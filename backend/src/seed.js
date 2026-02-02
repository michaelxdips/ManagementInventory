import bcrypt from 'bcryptjs';
import db from './config/db.js';

console.log('🌱 Seeding database...');

// Clear existing data
db.exec(`DELETE FROM barang_keluar`);
db.exec(`DELETE FROM barang_masuk`);
db.exec(`DELETE FROM requests`);
db.exec(`DELETE FROM barang_kosong`);
db.exec(`DELETE FROM atk_items`);
db.exec(`DELETE FROM users`);

// ========== SEED USERS ==========
const users = [
  { name: 'Super Admin', username: 'superadmin', password: 'admin123', role: 'superadmin' },
  { name: 'Admin 1', username: 'admin1', password: 'admin123', role: 'admin' },
  { name: 'Admin 2', username: 'admin2', password: 'admin123', role: 'admin' },
  { name: 'Share Service & General Support', username: 'ssgs', password: 'user123', role: 'user' },
  { name: 'Performance, Risk & QOS', username: 'prq', password: 'user123', role: 'user' },
  { name: 'Finance', username: 'finance', password: 'user123', role: 'user' },
  { name: 'IT Support', username: 'itsupport', password: 'user123', role: 'user' },
  { name: 'Viewer', username: 'viewer', password: 'viewer123', role: 'viewer' },
];

for (const user of users) {
  const hash = bcrypt.hashSync(user.password, 10);
  db.prepare(`INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, ?)`).run(user.name, user.username, hash, user.role);
}
console.log(`✅ Created ${users.length} users`);

// ========== SEED ATK ITEMS ==========
const items = [
  { nama: '3M Double Tape Abu-Abu', kode: '3M-DTP-GRY', qty: 15, satuan: 'pcs', lokasi: 'Lemari A1' },
  { nama: 'Amplop Coklat 110x240', kode: 'APP-BRW-110', qty: 200, satuan: 'pack', lokasi: 'Lemari A1' },
  { nama: 'Amplop Coklat 140x270', kode: 'APP-BRW-140', qty: 1001, satuan: 'pack', lokasi: 'Lemari A1' },
  { nama: 'Amplop Polos Coklat', kode: 'APP-PLS-BRW', qty: 190, satuan: 'pcs', lokasi: 'Lemari A2' },
  { nama: 'Amplop Telkom Polos', kode: 'APP-TLM-CLS', qty: 20, satuan: 'bungkus', lokasi: 'Lemari A2' },
  { nama: 'Amplop Telkom Jendela', kode: 'APP-TLM-JDL', qty: 11, satuan: 'bundle', lokasi: 'Lemari A2' },
  { nama: 'Bola Golf', kode: 'BAL-GLF', qty: 3, satuan: 'kotak', lokasi: 'Lemari B1' },
  { nama: 'Ball Liner Biru', kode: 'BAL-LNR-BLU', qty: 109, satuan: 'pcs', lokasi: 'Lemari B1' },
  { nama: 'Ball Liner Hijau', kode: 'BAL-LNR-HJU', qty: 2, satuan: 'pcs', lokasi: 'Lemari B1' },
  { nama: 'Ball Liner Hitam', kode: 'BAL-LNR-HTM', qty: 19, satuan: 'pcs', lokasi: 'Lemari B1' },
  { nama: 'Baterai AA', kode: 'BTR-A2', qty: 48, satuan: 'pcs', lokasi: 'Lemari B2' },
  { nama: 'Baterai AAA', kode: 'BTR-A3', qty: 36, satuan: 'pcs', lokasi: 'Lemari B2' },
  { nama: 'kertas paper one A4', kode: 'PPR-ONE-A4', qty: 50, satuan: 'rim', lokasi: 'Gudang' },
  { nama: 'Map Bening Dataflex', kode: 'MAP-CLS-DTX', qty: 0, satuan: 'pcs', lokasi: 'Lemari C1' },
  { nama: 'Folder One Transparent', kode: 'FDR-ONE-TPR', qty: 120, satuan: 'pcs', lokasi: 'Lemari C1' },
  { nama: 'Gunting Besar Joyko', kode: 'GTG-BIG-JYO', qty: 5, satuan: 'pcs', lokasi: 'Lemari C2' },
  { nama: 'Gunting Kecil', kode: 'GK01', qty: 8, satuan: 'pcs', lokasi: 'Lemari C2' },
  { nama: 'Pilot Hitam', kode: 'PLT-HTM', qty: 45, satuan: 'pcs', lokasi: 'Lemari D1' },
  { nama: 'Pilot Biru', kode: 'PLT-BLU', qty: 38, satuan: 'pcs', lokasi: 'Lemari D1' },
  { nama: 'Lakban Hijau Besar', kode: 'SLS-HJU-BIG', qty: 0, satuan: 'pcs', lokasi: 'Lemari D2' },
  { nama: 'Label Tom & Jerry No.121', kode: 'LBL-TNJ-121', qty: 25, satuan: 'bungkus', lokasi: 'Lemari D2' },
  { nama: 'Snowman Whiteboard Marker Non Permanent Merah', kode: 'SNO-NON-RED', qty: 12, satuan: 'pcs', lokasi: 'Lemari E1' },
  { nama: 'Staples Kecil', kode: 'STP-KCL', qty: 0, satuan: 'kotak', lokasi: 'Lemari E1' },
  { nama: 'Lem Kertas UHU', kode: 'LEM-UHU', qty: 18, satuan: 'pcs', lokasi: 'Lemari E2' },
];

// Map to store item IDs by name for later reference
const itemIdMap = {};

for (const item of items) {
  const result = db.prepare(`INSERT INTO atk_items (nama_barang, kode_barang, qty, satuan, lokasi_simpan) VALUES (?, ?, ?, ?, ?)`).run(item.nama, item.kode, item.qty, item.satuan, item.lokasi);
  itemIdMap[item.nama] = result.lastInsertRowid;

  if (item.qty === 0) {
    db.prepare(`INSERT INTO barang_kosong (name, code, location) VALUES (?, ?, ?)`).run(item.nama, item.kode, item.lokasi);
  }
}
console.log(`✅ Created ${items.length} ATK items`);

// ========== SEED REQUESTS ==========
const requests = [
  { date: '2026-01-15', item: 'Map Bening Dataflex', qty: 1, unit: 'pcs', receiver: 'Wulan', dept: 'Share Service & General Support', status: 'PENDING', userId: 4 },
  { date: '2026-01-15', item: 'kertas paper one A4', qty: 1, unit: 'rim', receiver: 'Wulan', dept: 'Share Service & General Support', status: 'PENDING', userId: 4 },
  { date: '2026-01-05', item: 'Map Bening Dataflex', qty: 2, unit: 'pcs', receiver: 'Alma', dept: 'Performance, Risk & QOS', status: 'PENDING', userId: 5 },
  { date: '2026-01-06', item: 'kertas paper one A4', qty: 1, unit: 'rim', receiver: 'wulan', dept: 'Share Service & General Support', status: 'PENDING', userId: 4 },
  { date: '2026-01-07', item: 'Baterai AAA', qty: 2, unit: 'pcs', receiver: 'Akbar', dept: 'Share Service & General Support', status: 'PENDING', userId: 4 },
  { date: '2026-01-07', item: 'Pilot Hitam', qty: 1, unit: 'pcs', receiver: 'eti', dept: 'Share Service & General Support', status: 'APPROVED', userId: 4 },
  { date: '2026-01-07', item: 'Pilot Biru', qty: 1, unit: 'pcs', receiver: 'Eti', dept: 'Share Service & General Support', status: 'APPROVED', userId: 4 },
];

for (const req of requests) {
  db.prepare(`INSERT INTO requests (date, item, qty, unit, receiver, dept, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(req.date, req.item, req.qty, req.unit, req.receiver, req.dept, req.status, req.userId);
}
console.log(`✅ Created ${requests.length} requests`);

// ========== SEED HISTORY (Barang Masuk) ==========
const barangMasuk = [
  { date: '2026-01-15', nama: 'Snowman Whiteboard Marker Non Permanent Merah', kode: 'SNO-NON-RED', qty: 10, satuan: 'pcs', pic: 'Super Admin' },
  { date: '2026-01-02', nama: 'Map Bening Dataflex', kode: 'MAP-CLS-DTX', qty: 120, satuan: 'pcs', pic: 'Admin 1' },
  { date: '2026-01-02', nama: 'Folder One Transparent', kode: 'FDR-ONE-TPR', qty: 240, satuan: 'pcs', pic: 'Admin 1' },
  { date: '2026-01-02', nama: 'Amplop Coklat 140x270', kode: 'APP-BRW-140', qty: 1000, satuan: 'pcs', pic: 'Admin 1' },
  { date: '2025-12-02', nama: 'Baterai AA', kode: 'BTR-A2', qty: 70, satuan: 'pcs', pic: 'Admin 1' },
  { date: '2025-12-01', nama: 'kertas paper one A4', kode: 'PPR-ONE-A4', qty: 29, satuan: 'rim', pic: 'Admin 2' },
];

for (const bm of barangMasuk) {
  const itemId = itemIdMap[bm.nama] || null;
  db.prepare(`INSERT INTO barang_masuk (date, atk_item_id, nama_barang, kode_barang, qty, satuan, pic) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(bm.date, itemId, bm.nama, bm.kode, bm.qty, bm.satuan, bm.pic);
}
console.log(`✅ Created ${barangMasuk.length} barang masuk records`);

// ========== SEED HISTORY (Barang Keluar) ==========
const barangKeluar = [
  { date: '2026-01-20', nama: 'Pilot Hitam', kode: 'PLT-HTM', qty: 2, satuan: 'pcs', penerima: 'Eti', dept: 'Share Service & General Support' },
  { date: '2026-01-18', nama: 'kertas paper one A4', kode: 'PPR-ONE-A4', qty: 3, satuan: 'rim', penerima: 'Wulan', dept: 'Share Service & General Support' },
  { date: '2026-01-15', nama: 'Baterai AA', kode: 'BTR-A2', qty: 4, satuan: 'pcs', penerima: 'Akbar', dept: 'IT Support' },
];

for (const bk of barangKeluar) {
  const itemId = itemIdMap[bk.nama];
  if (itemId) {
    db.prepare(`INSERT INTO barang_keluar (date, atk_item_id, nama_barang, kode_barang, qty, satuan, penerima, dept) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(bk.date, itemId, bk.nama, bk.kode, bk.qty, bk.satuan, bk.penerima, bk.dept);
  }
}
console.log(`✅ Created ${barangKeluar.length} barang keluar records`);

console.log('');
console.log('🎉 Database seeding completed!');
console.log('');
console.log('📋 Default credentials:');
console.log('   Superadmin: superadmin / admin123');
console.log('   Admin:      admin1 / admin123');
console.log('   User:       ssgs / user123');
console.log('   Viewer:     viewer / viewer123');
