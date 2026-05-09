const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'plate_tracker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    family: 4,
});

// Helper: add a column if it doesn't exist yet
async function addColumnIfMissing(conn, table, column, sql, label) {
    const [rows] = await conn.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
    );
    if (rows.length === 0) {
        await conn.execute(sql);
        console.log(`✅ ${label}`);
    }
}

async function initDB() {
    const conn = await pool.getConnection();
    try {
        // ── plates table ──────────────────────────────────────────────────────
        // Drop and recreate if: (a) id column is missing (mv_file_number was PK),
        // or (b) id is VARCHAR (old UUID schema). Either way data is cleared.
        const [idCol] = await conn.execute(
            `SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'plates' AND COLUMN_NAME = 'id'`
        );
        const [tableExists] = await conn.execute(
            `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'plates'`
        );
        const needsRebuild = tableExists.length > 0 && (
            idCol.length === 0 ||
            idCol[0].DATA_TYPE === 'varchar'
        );
        if (needsRebuild) {
            console.log('⚠️  Rebuilding plates table (id must be AUTO_INCREMENT INT). Existing plate data will be cleared.');
            await conn.execute('DROP TABLE IF EXISTS plates');
        }

        await conn.execute(`
            CREATE TABLE IF NOT EXISTS plates (
                id            INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                mv_file_number VARCHAR(50) NOT NULL,
                site_code     VARCHAR(20) DEFAULT NULL,
                site_name     VARCHAR(100) DEFAULT NULL,
                plate_number  VARCHAR(20) DEFAULT NULL,
                owner_name    VARCHAR(100) NOT NULL,
                vehicle_type  VARCHAR(50) DEFAULT NULL,
                brand         VARCHAR(50) DEFAULT NULL,
                model         VARCHAR(50) DEFAULT NULL,
                color         VARCHAR(30) DEFAULT NULL,
                status        ENUM('In Process','At Dealer','At LTO','Available') NOT NULL DEFAULT 'In Process',
                claim_location VARCHAR(150) DEFAULT NULL,
                remarks       TEXT,
                is_claimed    TINYINT(1) NOT NULL DEFAULT 0,
                assigned_dealer_id VARCHAR(36) DEFAULT NULL,
                created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Drop unique index on mv_file_number if it exists (duplicates are now allowed)
        const [mvIdx] = await conn.execute(
            `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'plates'
             AND COLUMN_NAME = 'mv_file_number' AND NON_UNIQUE = 0 AND INDEX_NAME != 'PRIMARY'`
        );
        if (mvIdx.length > 0) {
            await conn.execute(`ALTER TABLE plates DROP INDEX \`${mvIdx[0].INDEX_NAME}\``);
            console.log('✅ Removed unique constraint from mv_file_number');
        }

        // Column migrations for plates (runs only when table already existed with INT id)
        await addColumnIfMissing(conn, 'plates', 'site_code',
            `ALTER TABLE plates ADD COLUMN site_code VARCHAR(20) DEFAULT NULL AFTER mv_file_number`,
            'Added site_code to plates');
        await addColumnIfMissing(conn, 'plates', 'site_name',
            `ALTER TABLE plates ADD COLUMN site_name VARCHAR(100) DEFAULT NULL AFTER site_code`,
            'Added site_name to plates');
        await addColumnIfMissing(conn, 'plates', 'is_claimed',
            `ALTER TABLE plates ADD COLUMN is_claimed TINYINT(1) NOT NULL DEFAULT 0`,
            'Added is_claimed to plates');
        await addColumnIfMissing(conn, 'plates', 'assigned_dealer_id',
            `ALTER TABLE plates ADD COLUMN assigned_dealer_id VARCHAR(36) DEFAULT NULL`,
            'Added assigned_dealer_id to plates');

        // ── admins table ──────────────────────────────────────────────────────
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS admins (
                id          VARCHAR(36) PRIMARY KEY,
                username    VARCHAR(50) NOT NULL UNIQUE,
                password    VARCHAR(255) NOT NULL,
                role        ENUM('administrator','lto','dealer') NOT NULL DEFAULT 'administrator',
                site_code   VARCHAR(20) DEFAULT NULL,
                dealer_name VARCHAR(100) DEFAULT NULL,
                created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Column migrations for admins
        await addColumnIfMissing(conn, 'admins', 'role',
            `ALTER TABLE admins ADD COLUMN role ENUM('administrator','lto','dealer') NOT NULL DEFAULT 'administrator'`,
            'Added role to admins');
        await addColumnIfMissing(conn, 'admins', 'site_code',
            `ALTER TABLE admins ADD COLUMN site_code VARCHAR(20) DEFAULT NULL`,
            'Added site_code to admins');
        await addColumnIfMissing(conn, 'admins', 'dealer_name',
            `ALTER TABLE admins ADD COLUMN dealer_name VARCHAR(100) DEFAULT NULL`,
            'Added dealer_name to admins');
        await addColumnIfMissing(conn, 'admins', 'first_name',
            `ALTER TABLE admins ADD COLUMN first_name VARCHAR(100) DEFAULT NULL AFTER dealer_name`,
            'Added first_name to admins');
        await addColumnIfMissing(conn, 'admins', 'middle_name',
            `ALTER TABLE admins ADD COLUMN middle_name VARCHAR(100) DEFAULT NULL AFTER first_name`,
            'Added middle_name to admins');
        await addColumnIfMissing(conn, 'admins', 'last_name',
            `ALTER TABLE admins ADD COLUMN last_name VARCHAR(100) DEFAULT NULL AFTER middle_name`,
            'Added last_name to admins');

        // ── Seed default admin ────────────────────────────────────────────────
        const bcrypt = require('bcryptjs');
        const { v4: uuidv4 } = require('uuid');
        const [admins] = await conn.execute('SELECT id FROM admins LIMIT 1');
        if (admins.length === 0) {
            const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
            await conn.execute(
                'INSERT INTO admins (id, username, password, role) VALUES (?, ?, ?, ?)',
                [uuidv4(), process.env.ADMIN_USERNAME || 'admin', hashed, 'administrator']
            );
            console.log('✅ Default admin created');
        }

        console.log('✅ Database initialized');
    } finally {
        conn.release();
    }
}

module.exports = { pool, initDB };
