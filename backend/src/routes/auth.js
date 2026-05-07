const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);
        if (!rows.length) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const admin = rows[0];
        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                username: admin.username,
                role: admin.role || 'administrator',
                site_code: admin.site_code || null,
                dealer_name: admin.dealer_name || null,
            },
            process.env.JWT_SECRET || 'platex_secret',
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            token,
            username: admin.username,
            role: admin.role || 'administrator',
            site_code: admin.site_code || null,
            dealer_name: admin.dealer_name || null,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'platex_secret');
        res.json({
            success: true,
            username: decoded.username,
            role: decoded.role,
            site_code: decoded.site_code,
            dealer_name: decoded.dealer_name,
        });
    } catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});

module.exports = router;
