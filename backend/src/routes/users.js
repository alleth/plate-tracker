const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
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

function adminOnly(req, res, next) {
    if (req.admin.role !== 'administrator') {
        return res.status(403).json({ success: false, message: 'Administrator access required' });
    }
    next();
}

const SELECT_FIELDS = `id, username, first_name, middle_name, last_name, role, site_code, dealer_name, created_at`;

// GET all users
router.get('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT ${SELECT_FIELDS} FROM admins ORDER BY created_at DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create user — password defaults to 'password'
router.post('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { username, role, site_code, dealer_name, first_name, middle_name, last_name } = req.body;
        if (!username || !role) {
            return res.status(400).json({ success: false, message: 'Username and role are required' });
        }

        const [existing] = await pool.execute('SELECT id FROM admins WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }

        const hashed = await bcrypt.hash('password', 10);
        const id = uuidv4();
        await pool.execute(
            `INSERT INTO admins (id, username, password, role, site_code, dealer_name, first_name, middle_name, last_name)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, username, hashed, role, site_code || null, dealer_name || null,
             first_name || null, middle_name || null, last_name || null]
        );

        const [rows] = await pool.execute(
            `SELECT ${SELECT_FIELDS} FROM admins WHERE id = ?`, [id]
        );
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT update user
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { username, password, role, site_code, dealer_name, first_name, middle_name, last_name } = req.body;
        if (!username || !role) {
            return res.status(400).json({ success: false, message: 'Username and role are required' });
        }

        const [existing] = await pool.execute(
            'SELECT id FROM admins WHERE username = ? AND id != ?', [username, req.params.id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }

        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            await pool.execute(
                `UPDATE admins SET username=?, password=?, role=?, site_code=?, dealer_name=?, first_name=?, middle_name=?, last_name=? WHERE id=?`,
                [username, hashed, role, site_code || null, dealer_name || null,
                 first_name || null, middle_name || null, last_name || null, req.params.id]
            );
        } else {
            await pool.execute(
                `UPDATE admins SET username=?, role=?, site_code=?, dealer_name=?, first_name=?, middle_name=?, last_name=? WHERE id=?`,
                [username, role, site_code || null, dealer_name || null,
                 first_name || null, middle_name || null, last_name || null, req.params.id]
            );
        }

        const [rows] = await pool.execute(
            `SELECT ${SELECT_FIELDS} FROM admins WHERE id = ?`, [req.params.id]
        );
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE user
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        if (req.params.id === req.admin.id) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }
        await pool.execute('DELETE FROM admins WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
