const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
        req.admin = jwt.verify(token, process.env.JWT_SECRET || 'platex_secret');
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        next();
    };
}

// PUBLIC — Search by MV File Number or Plate Number
router.get('/search', async (req, res) => {
    try {
        const { mv, plate } = req.query;
        if (!mv && !plate) {
            return res.status(400).json({ success: false, message: 'MV File Number or Plate Number is required' });
        }

        let query, param;
        if (mv) {
            query = `SELECT mv_file_number, plate_number, owner_name, vehicle_type,
                      brand, model, color, status, site_name, claim_location, remarks, updated_at, is_claimed
               FROM plates WHERE UPPER(REPLACE(mv_file_number COLLATE utf8mb4_unicode_ci, '-', '')) = UPPER(REPLACE(? COLLATE utf8mb4_unicode_ci, '-', ''))`;
            param = mv.trim().toUpperCase();
        } else {
            query = `SELECT mv_file_number, plate_number, owner_name, vehicle_type,
                      brand, model, color, status, site_name, claim_location, remarks, updated_at, is_claimed
               FROM plates WHERE UPPER(REPLACE(plate_number COLLATE utf8mb4_unicode_ci, ' ', '')) = UPPER(REPLACE(? COLLATE utf8mb4_unicode_ci, ' ', ''))`;
            param = plate.trim().toUpperCase();
        }

        const [rows] = await pool.execute(query, [param]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'No record found' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET list of dealer users — must be before /:id
router.get('/dealers', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT id, username, dealer_name FROM admins WHERE role = 'dealer' ORDER BY dealer_name`
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all plates (paginated, role-filtered)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { q, page = 1, limit = 10, duplicates, mv_exact } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * limitNum;

        const conditions = [];
        const params = [];

        if (q) {
            conditions.push(`(
                p.mv_file_number LIKE ? OR p.plate_number LIKE ? OR p.owner_name LIKE ? OR
                p.brand LIKE ? OR p.model LIKE ? OR p.color LIKE ? OR p.vehicle_type LIKE ? OR
                p.site_code LIKE ? OR p.site_name LIKE ? OR p.status LIKE ? OR
                p.claim_location LIKE ? OR p.remarks LIKE ?
            )`);
            const like = `%${q}%`;
            params.push(like, like, like, like, like, like, like, like, like, like, like, like);
        }

        if (req.admin.role === 'lto') {
            conditions.push(`p.site_code = ?`);
            params.push(req.admin.site_code);
        } else if (req.admin.role === 'dealer') {
            conditions.push(`p.assigned_dealer_id = ?`);
            params.push(req.admin.id);
        }

        if (duplicates === 'mv') {
            let subSql = `SELECT UPPER(REPLACE(mv_file_number COLLATE utf8mb4_unicode_ci, '-', '')) FROM plates WHERE TRIM(REPLACE(mv_file_number COLLATE utf8mb4_unicode_ci, '-', '')) != ''`;
            const subParams = [];
            if (req.admin.role === 'lto') {
                subSql += ` AND site_code = ?`;
                subParams.push(req.admin.site_code);
            } else if (req.admin.role === 'dealer') {
                subSql += ` AND assigned_dealer_id = ?`;
                subParams.push(req.admin.id);
            }
            subSql += ` GROUP BY UPPER(REPLACE(mv_file_number COLLATE utf8mb4_unicode_ci, '-', '')) HAVING COUNT(*) > 1`;
            conditions.push(`TRIM(REPLACE(p.mv_file_number COLLATE utf8mb4_unicode_ci, '-', '')) != '' AND UPPER(REPLACE(p.mv_file_number COLLATE utf8mb4_unicode_ci, '-', '')) IN (${subSql})`);
            params.push(...subParams);
        } else if (duplicates === 'plate') {
            const plateNotBlank = `plate_number IS NOT NULL AND TRIM(REPLACE(plate_number COLLATE utf8mb4_unicode_ci, '-', '')) != ''`;
            let subSql = `SELECT REPLACE(UPPER(plate_number COLLATE utf8mb4_unicode_ci), ' ', '') FROM plates WHERE ${plateNotBlank}`;
            const subParams = [];
            if (req.admin.role === 'lto') {
                subSql += ` AND site_code = ?`;
                subParams.push(req.admin.site_code);
            } else if (req.admin.role === 'dealer') {
                subSql += ` AND assigned_dealer_id = ?`;
                subParams.push(req.admin.id);
            }
            subSql += ` GROUP BY REPLACE(UPPER(plate_number COLLATE utf8mb4_unicode_ci), ' ', '') HAVING COUNT(*) > 1`;
            conditions.push(`p.${plateNotBlank} AND REPLACE(UPPER(p.plate_number COLLATE utf8mb4_unicode_ci), ' ', '') IN (${subSql})`);
            params.push(...subParams);
        } else if (duplicates === 'both') {
            let mvSubSql = `SELECT UPPER(REPLACE(mv_file_number COLLATE utf8mb4_unicode_ci, '-', '')) FROM plates WHERE TRIM(REPLACE(mv_file_number COLLATE utf8mb4_unicode_ci, '-', '')) != ''`;
            let plSubSql = `SELECT REPLACE(UPPER(plate_number COLLATE utf8mb4_unicode_ci), ' ', '') FROM plates WHERE plate_number IS NOT NULL AND plate_number != ''`;
            const subParams = [];
            if (req.admin.role === 'lto') {
                mvSubSql += ` AND site_code = ?`;
                plSubSql += ` AND site_code = ?`;
                subParams.push(req.admin.site_code, req.admin.site_code);
            } else if (req.admin.role === 'dealer') {
                mvSubSql += ` AND assigned_dealer_id = ?`;
                plSubSql += ` AND assigned_dealer_id = ?`;
                subParams.push(req.admin.id, req.admin.id);
            }
            mvSubSql += ` GROUP BY UPPER(REPLACE(mv_file_number COLLATE utf8mb4_unicode_ci, '-', '')) HAVING COUNT(*) > 1`;
            plSubSql += ` GROUP BY REPLACE(UPPER(plate_number COLLATE utf8mb4_unicode_ci), ' ', '') HAVING COUNT(*) > 1`;
            conditions.push(`(
                (TRIM(REPLACE(p.mv_file_number COLLATE utf8mb4_unicode_ci, '-', '')) != '' AND UPPER(REPLACE(p.mv_file_number COLLATE utf8mb4_unicode_ci, '-', '')) IN (${mvSubSql}))
                OR (p.plate_number IS NOT NULL AND p.plate_number != '' AND REPLACE(UPPER(p.plate_number COLLATE utf8mb4_unicode_ci), ' ', '') IN (${plSubSql}))
            )`);
            params.push(...subParams);
        }

        if (mv_exact) {
            const mvExactNorm = mv_exact.trim().toUpperCase().replace(/-/g, '');
            if (mvExactNorm) {
                conditions.push(`UPPER(REPLACE(p.mv_file_number, '-', '')) = ?`);
                params.push(mvExactNorm);
            }
        }

        const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

        const [[{ total }]] = await pool.execute(
            `SELECT COUNT(*) as total FROM plates p${where}`, params
        );
        const orderBy = duplicates === 'plate'
            ? `REPLACE(UPPER(p.plate_number), ' ', '') ASC, p.id ASC`
            : `p.created_at DESC`;
        const [rows] = await pool.execute(
            `SELECT p.*, a.dealer_name as assigned_dealer_name
             FROM plates p
                      LEFT JOIN admins a ON p.assigned_dealer_id = a.id
                 ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        res.json({ success: true, data: rows, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET single plate by id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM plates WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Record not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET stats (all roles — filtered by role scope)
router.get('/stats/summary', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * limitNum;

        let scopeClause = '';
        let scopeParams = [];
        if (req.admin.role === 'lto') {
            scopeClause = 'site_code = ?';
            scopeParams = [req.admin.site_code];
        } else if (req.admin.role === 'dealer') {
            scopeClause = 'assigned_dealer_id = ?';
            scopeParams = [req.admin.id];
        }

        const where = (extra = '') => {
            const parts = [scopeClause, extra].filter(Boolean);
            return parts.length ? ` WHERE ${parts.join(' AND ')}` : '';
        };

        const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM plates${where()}`, scopeParams);
        const [[{ claimed }]] = await pool.execute(`SELECT COUNT(*) as claimed FROM plates${where('is_claimed = 1')}`, scopeParams);
        const [[{ in_process }]] = await pool.execute(`SELECT COUNT(*) as in_process FROM plates${where("status = 'In Process' AND is_claimed = 0")}`, scopeParams);
        const [[{ at_dealer }]] = await pool.execute(`SELECT COUNT(*) as at_dealer FROM plates${where("status = 'At Dealer' AND is_claimed = 0")}`, scopeParams);
        const [[{ at_lto }]] = await pool.execute(`SELECT COUNT(*) as at_lto FROM plates${where("status = 'At LTO' AND is_claimed = 0")}`, scopeParams);
        const [recent] = await pool.execute(
            `SELECT * FROM plates${where()} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
            [...scopeParams, limitNum, offset]
        );

        res.json({
            success: true,
            data: {
                total, claimed, in_process, at_dealer, at_lto,
                recent,
                recentPage: pageNum,
                recentTotalPages: Math.ceil(total / limitNum),
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create plate record (administrator and lto only)
router.post('/', authMiddleware, requireRole('administrator', 'lto'), async (req, res) => {
    try {
        const {
            mv_file_number, plate_number, owner_name, vehicle_type,
            brand, model, color, status, claim_location, remarks,
            assigned_dealer_id, site_name,
        } = req.body;

        const site_code = req.admin.role === 'lto' ? req.admin.site_code : req.body.site_code;

        if (!mv_file_number || !owner_name) {
            return res.status(400).json({ success: false, message: 'MV File Number and Owner Name are required' });
        }

        if (plate_number && plate_number.trim()) {
            const [existingPlate] = await pool.execute(
                `SELECT id FROM plates WHERE REPLACE(plate_number COLLATE utf8mb4_unicode_ci, ' ', '') = REPLACE(? COLLATE utf8mb4_unicode_ci, ' ', '')`,
                [plate_number.trim().toUpperCase()]
            );
            if (existingPlate.length > 0) {
                return res.status(409).json({ success: false, message: 'Plate Number already exists in the system' });
            }
        }

        const [result] = await pool.execute(
            `INSERT INTO plates
             (mv_file_number, site_code, site_name, plate_number, owner_name, vehicle_type, brand, model,
              color, status, claim_location, remarks, assigned_dealer_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                mv_file_number.trim().toUpperCase(),
                site_code ? site_code.trim() : null,
                site_name ? site_name.trim() : null,
                plate_number ? plate_number.trim().toUpperCase() : null,
                owner_name, vehicle_type, brand, model, color,
                status || 'In Process', claim_location, remarks,
                assigned_dealer_id || null,
            ]
        );

        const [rows] = await pool.execute('SELECT * FROM plates WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Plate Number already exists in the system' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT update plate record (administrator and lto only)
router.put('/:id', authMiddleware, requireRole('administrator', 'lto'), async (req, res) => {
    try {
        const {
            plate_number, owner_name, vehicle_type, brand,
            model, color, status, claim_location, remarks,
            site_code, site_name, assigned_dealer_id,
        } = req.body;

        if (req.admin.role === 'lto') {
            const [check] = await pool.execute('SELECT site_code FROM plates WHERE id = ?', [req.params.id]);
            if (!check.length || check[0].site_code !== req.admin.site_code) {
                return res.status(403).json({ success: false, message: 'Access denied to this record' });
            }
        }

        if (plate_number && plate_number.trim()) {
            const [existingPlate] = await pool.execute(
                `SELECT id FROM plates WHERE REPLACE(plate_number COLLATE utf8mb4_unicode_ci, ' ', '') = REPLACE(? COLLATE utf8mb4_unicode_ci, ' ', '') AND id != ?`,
                [plate_number.trim().toUpperCase(), req.params.id]
            );
            if (existingPlate.length > 0) {
                return res.status(409).json({ success: false, message: 'Plate Number already exists in the system' });
            }
        }

        const effectiveSiteCode = req.admin.role === 'lto' ? req.admin.site_code : (site_code ? site_code.trim() : null);

        await pool.execute(
            `UPDATE plates SET
             site_code=?, site_name=?, plate_number=?, owner_name=?, vehicle_type=?, brand=?,
             model=?, color=?, status=?, claim_location=?, remarks=?, assigned_dealer_id=?
             WHERE id=?`,
            [
                effectiveSiteCode,
                site_name ? site_name.trim() : null,
                plate_number ? plate_number.trim().toUpperCase() : null,
                owner_name, vehicle_type, brand, model, color,
                status, claim_location, remarks,
                assigned_dealer_id || null,
                req.params.id,
            ]
        );

        const [rows] = await pool.execute('SELECT * FROM plates WHERE id = ?', [req.params.id]);
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PATCH toggle claimed status (administrator and dealer)
router.patch('/:id/claim', authMiddleware, requireRole('administrator', 'dealer'), async (req, res) => {
    try {
        if (req.admin.role === 'dealer') {
            const [check] = await pool.execute('SELECT assigned_dealer_id FROM plates WHERE id = ?', [req.params.id]);
            if (!check.length || check[0].assigned_dealer_id !== req.admin.id) {
                return res.status(403).json({ success: false, message: 'Access denied to this record' });
            }
        }

        const { is_claimed } = req.body;
        await pool.execute('UPDATE plates SET is_claimed = ? WHERE id = ?', [is_claimed ? 1 : 0, req.params.id]);
        const [rows] = await pool.execute('SELECT * FROM plates WHERE id = ?', [req.params.id]);
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE plate record (administrator only)
router.delete('/:id', authMiddleware, requireRole('administrator'), async (req, res) => {
    try {
        await pool.execute('DELETE FROM plates WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Record deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;