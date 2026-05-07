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
                      brand, model, color, status, claim_location, remarks, updated_at, is_claimed
               FROM plates WHERE REPLACE(mv_file_number, '-', '') = REPLACE(?, '-', '')`;
            param = mv.trim().toUpperCase();
        } else {
            query = `SELECT mv_file_number, plate_number, owner_name, vehicle_type,
                      brand, model, color, status, claim_location, remarks, updated_at, is_claimed
               FROM plates WHERE REPLACE(plate_number, ' ', '') = REPLACE(?, ' ', '')`;
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
        const { q, page = 1, limit = 10 } = req.query;
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

        const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

        const [[{ total }]] = await pool.execute(
            `SELECT COUNT(*) as total FROM plates p${where}`, params
        );
        const [rows] = await pool.execute(
            `SELECT p.*, a.dealer_name as assigned_dealer_name
             FROM plates p
             LEFT JOIN admins a ON p.assigned_dealer_id = a.id
             ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
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

        // Build role-based scope filter
        let scopeClause = '';
        let scopeParams = [];
        if (req.admin.role === 'lto') {
            scopeClause = 'site_code = ?';
            scopeParams = [req.admin.site_code];
        } else if (req.admin.role === 'dealer') {
            scopeClause = 'assigned_dealer_id = ?';
            scopeParams = [req.admin.id];
        }

        // Helper: build WHERE combining scope + optional extra condition
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

        // LTO: force their own site_code
        const site_code = req.admin.role === 'lto' ? req.admin.site_code : req.body.site_code;

        if (!mv_file_number || !owner_name) {
            return res.status(400).json({ success: false, message: 'MV File Number and Owner Name are required' });
        }

        // Check duplicate Plate Number
        if (plate_number && plate_number.trim()) {
            const [existingPlate] = await pool.execute(
                `SELECT id FROM plates WHERE REPLACE(plate_number, ' ', '') = REPLACE(?, ' ', '')`,
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

        // LTO: can only edit plates in their site
        if (req.admin.role === 'lto') {
            const [check] = await pool.execute('SELECT site_code FROM plates WHERE id = ?', [req.params.id]);
            if (!check.length || check[0].site_code !== req.admin.site_code) {
                return res.status(403).json({ success: false, message: 'Access denied to this record' });
            }
        }

        // Check duplicate Plate Number on another record
        if (plate_number && plate_number.trim()) {
            const [existingPlate] = await pool.execute(
                `SELECT id FROM plates WHERE REPLACE(plate_number, ' ', '') = REPLACE(?, ' ', '') AND id != ?`,
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
        // Dealer: can only claim plates assigned to them
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
