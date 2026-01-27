-- MySQL schema alignment for Node backend + frontend fields
-- Run this against your target database (check DB_NAME in .env)

-- Table: atk_items
CREATE TABLE IF NOT EXISTS atk_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(191) NOT NULL,
  stok INT NOT NULL DEFAULT 0,
  satuan VARCHAR(64) NOT NULL,
  kode_barang VARCHAR(191) NULL,
  lokasi_simpan VARCHAR(191) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ensure new columns exist (safe on MySQL 8.0+)
ALTER TABLE atk_items
  ADD COLUMN IF NOT EXISTS kode_barang VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS lokasi_simpan VARCHAR(191) NULL;

-- Table: barang_masuk
CREATE TABLE IF NOT EXISTS barang_masuk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  atk_item_id INT NOT NULL,
  jumlah INT NOT NULL,
  tanggal DATE NOT NULL,
  satuan VARCHAR(64) NULL,
  pic VARCHAR(191) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_barang_masuk_item FOREIGN KEY (atk_item_id) REFERENCES atk_items(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE barang_masuk
  ADD COLUMN IF NOT EXISTS satuan VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS pic VARCHAR(191) NULL;

-- Table: barang_keluar
CREATE TABLE IF NOT EXISTS barang_keluar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  atk_item_id INT NOT NULL,
  jumlah INT NOT NULL,
  tanggal DATE NOT NULL,
  penerima VARCHAR(191) NULL,
  unit_id INT NULL,
  pic VARCHAR(191) NULL,
  satuan VARCHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_barang_keluar_item FOREIGN KEY (atk_item_id) REFERENCES atk_items(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE barang_keluar
  ADD COLUMN IF NOT EXISTS penerima VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS unit_id INT NULL,
  ADD COLUMN IF NOT EXISTS pic VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS satuan VARCHAR(64) NULL;

-- Optional indexes to speed lookups
CREATE INDEX IF NOT EXISTS idx_atk_items_nama ON atk_items (nama);
CREATE INDEX IF NOT EXISTS idx_barang_masuk_item ON barang_masuk (atk_item_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_barang_keluar_item ON barang_keluar (atk_item_id, tanggal);

-- Table: barang_kosong (stok habis / kosong)
CREATE TABLE IF NOT EXISTS barang_kosong (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(191) NOT NULL,
  kode_barang VARCHAR(191) NULL,
  lokasi_simpan VARCHAR(191) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: units
CREATE TABLE IF NOT EXISTS units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  username VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(191) NOT NULL,
  role ENUM('admin','user','approver','viewer') NOT NULL DEFAULT 'user',
  unit_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_unit FOREIGN KEY (unit_id) REFERENCES units(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: requests
CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  item VARCHAR(191) NOT NULL,
  qty INT NOT NULL,
  unit VARCHAR(128) NOT NULL,
  receiver VARCHAR(191) NOT NULL,
  dept VARCHAR(191) NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: approvals
CREATE TABLE IF NOT EXISTS approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  decided_by INT NULL,
  decided_at DATETIME NULL,
  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_approvals_request FOREIGN KEY (request_id) REFERENCES requests(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_approvals_user FOREIGN KEY (decided_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed units (idempotent)
INSERT INTO units (name, username)
SELECT * FROM (SELECT 'Business Service' AS name, 'BS' AS username) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM units WHERE username = 'BS');

INSERT INTO units (name, username)
SELECT * FROM (SELECT 'Share Service & General Support', 'SSGS') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM units WHERE username = 'SSGS');

INSERT INTO units (name, username)
SELECT * FROM (SELECT 'Government Service', 'GS') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM units WHERE username = 'GS');

INSERT INTO units (name, username)
SELECT * FROM (SELECT 'Performance, Risk & QOS', 'PRQ') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM units WHERE username = 'PRQ');

-- Seed users with bcrypt hashes for passwords: admin123 / approver123 / user123 / viewer123
INSERT INTO users (name, username, password_hash, role)
SELECT * FROM (SELECT 'Super Admin', 'superadmin', '$2a$10$3OaZkGZc5P4nOQ8bGVSRjO5t/eMSanlkwTmYiFnYkVRtGbyD5GD2K', 'admin') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'superadmin');

INSERT INTO users (name, username, password_hash, role)
SELECT * FROM (SELECT 'Approver', 'approver', '$2a$10$3I4XH9f7oR5xEevAyvQWXOQHbFjsPPCyc9HSehraVfaRyyHhBGXTu', 'approver') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'approver');

INSERT INTO users (name, username, password_hash, role)
SELECT * FROM (SELECT 'User', 'user', '$2a$10$f5h/XFeQgkm8/HN3EO5b8O4eo4gcVVfYXl82eN1tR10ZS8gMS0IU2', 'user') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user');

INSERT INTO users (name, username, password_hash, role)
SELECT * FROM (SELECT 'Viewer', 'viewer', '$2a$10$Gvyb4maLNFN5ZlgDYzjAfe0PQLYVQWqtZMDXT46e4KdQPi9Ld7seu', 'viewer') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'viewer');
