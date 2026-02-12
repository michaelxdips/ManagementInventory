import pool from './config/db.js';

/**
 * Migration: Create unit_quota table for distribution-aware approval.
 * Tracks per-item, per-unit quota allocation and usage.
 */
const migrate = async () => {
    console.log('🔧 Creating unit_quota table...');

    await pool.query(`
    CREATE TABLE IF NOT EXISTS unit_quota (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      item_id INTEGER NOT NULL,
      unit_id INTEGER NOT NULL,
      quota_max INTEGER NOT NULL DEFAULT 0,
      quota_used INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES atk_items(id),
      FOREIGN KEY (unit_id) REFERENCES users(id),
      UNIQUE KEY uq_item_unit (item_id, unit_id)
    );
  `);

    console.log('✅ unit_quota table created successfully.');
    process.exit(0);
};

migrate().catch((err) => {
    console.error('Migration error:', err);
    process.exit(1);
});
