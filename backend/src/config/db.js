import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'inventory.db');

// Initialize SQL.js
const SQL = await initSqlJs();

// Load existing database or create new one
let db;
if (existsSync(dbPath)) {
  const fileBuffer = readFileSync(dbPath);
  db = new SQL.Database(fileBuffer);
} else {
  db = new SQL.Database();
}

// Helper to save database to file
export const saveDatabase = () => {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);
};

// Auto-save on exit
process.on('exit', saveDatabase);
process.on('SIGINT', () => {
  saveDatabase();
  process.exit();
});

// Create wrapper for better-sqlite3 compatible API
const dbWrapper = {
  prepare: (sql) => {
    return {
      run: (...params) => {
        db.run(sql, params);
        saveDatabase();
        return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] };
      },
      get: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const columns = stmt.getColumnNames();
          const values = stmt.get();
          stmt.free();
          return columns.reduce((obj, col, i) => {
            obj[col] = values[i];
            return obj;
          }, {});
        }
        stmt.free();
        return undefined;
      },
      all: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const results = [];
        const columns = stmt.getColumnNames();
        while (stmt.step()) {
          const values = stmt.get();
          results.push(columns.reduce((obj, col, i) => {
            obj[col] = values[i];
            return obj;
          }, {}));
        }
        stmt.free();
        return results;
      }
    };
  },
  exec: (sql) => {
    db.run(sql);
    saveDatabase();
  },
  pragma: () => { } // No-op for sql.js
};

// Create tables
dbWrapper.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'superadmin', 'user', 'viewer')) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- ATK Items table
  CREATE TABLE IF NOT EXISTS atk_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_barang TEXT NOT NULL,
    kode_barang TEXT,
    qty INTEGER NOT NULL DEFAULT 0,
    satuan TEXT NOT NULL,
    lokasi_simpan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Requests table
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    item TEXT NOT NULL,
    qty INTEGER NOT NULL,
    unit TEXT NOT NULL,
    receiver TEXT NOT NULL,
    dept TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'FINISHED')) DEFAULT 'PENDING',
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Barang Masuk (Incoming Items) table
  CREATE TABLE IF NOT EXISTS barang_masuk (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    atk_item_id INTEGER,
    nama_barang TEXT NOT NULL,
    kode_barang TEXT,
    qty INTEGER NOT NULL,
    satuan TEXT NOT NULL,
    lokasi_simpan TEXT,
    pic TEXT,
    request_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (atk_item_id) REFERENCES atk_items(id),
    FOREIGN KEY (request_id) REFERENCES requests(id)
  );

  -- Barang Keluar (Outgoing Items) table
  CREATE TABLE IF NOT EXISTS barang_keluar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    atk_item_id INTEGER NOT NULL,
    nama_barang TEXT NOT NULL,
    kode_barang TEXT,
    qty INTEGER NOT NULL,
    satuan TEXT NOT NULL,
    penerima TEXT NOT NULL,
    dept TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (atk_item_id) REFERENCES atk_items(id)
  );

  -- Barang Kosong (Empty Items) table
  CREATE TABLE IF NOT EXISTS barang_kosong (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default dbWrapper;
