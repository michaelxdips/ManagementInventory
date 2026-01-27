# ManagementInventory

Inventory ATK dengan modul Barang Masuk, Barang Keluar, Request, dan Approval.

## Struktur
- backend: API Express + MySQL
- frontend: Vite + React/TS

## Prasyarat
- Node.js 18+
- MySQL berjalan dan kredensial di `.env` (lihat backend/src/db/mysql.js)

## Menjalankan Backend
```bash
cd backend
npm install
npm run dev
```

## Menjalankan Frontend
```bash
cd frontend
npm install
npm run dev
```

## Role
- admin & superadmin: transaksi Barang Masuk/Keluar, approval request
- user: membuat request; tidak bisa ubah stok langsung

## Aturan Stok (ringkas)
- Stok hanya berubah lewat Barang Masuk (+) dan Barang Keluar (-)
- Request tidak mengubah stok; approval yang disetujui membuat transaksi Barang Keluar
- Validasi stok dilakukan di backend

## Build
```bash
cd frontend
npm run build
```

## Deploy
Push ke branch main di https://github.com/michaelxdips/ManagementInventory
