# 📦 Web Inventory Management System (ATK)

![Project Status](https://img.shields.io/badge/Status-Final_RC-success)
![Tech Stack](https://img.shields.io/badge/Stack-React_Node_MySQL-blue)
![License](https://img.shields.io/badge/License-PKL-orange)

Sistem Informasi Manajemen Inventaris berbasis Web untuk pengelolaan Alat Tulis Kantor (ATK). Dibangun dengan arsitektur modern (Separation of Concern) antara Frontend dan Backend, mengutamakan keamanan data, integritas stok, dan pengalaman pengguna mobile yang responsif.

---

## ✨ Fitur Utama (Features)

Aplikasi ini mencakup siklus lengkap manajemen barang, mulai dari penerimaan, permintaan user, hingga persetujuan admin.

### 1. Manajemen Stok & Inventaris

- **Real-time Monitoring**: Stok barang terupdate otomatis saat transaksi disetujui.
- **Low Stock Alerts**: Notifikasi visual untuk barang yang stoknya menipis atau habis.
- **Manajemen Unit**: Kustomisasi satuan barang (Pcs, Rim, Box, dll).
- **Barang Masuk (Procurement)**: Pencatatan barang masuk dari supplier dengan validasi ketat.

### 2. Digital Request & Approval Flow

Menggantikan sistem form kertas dengan alur digital yang terkontrol:

1.  **Request User**: User biasa mengajukan permintaan barang via aplikasi.
2.  **Pending Queue**: Request masuk ke daftar antrian Admin.
3.  **Strict Blocking**: Barang yang sedang ada di antrian "Pending" tidak bisa di-rename/edit untuk mencegah manipulasi data.
4.  **Real-Time Notifications (SSE)**: Admin dan User akan mendapatkan notifikasi instan langsung di layar tanpa perlu _refresh_ page setiap kali ada Request baru atau saat status Approval berubah.
5.  **Eksekusi Admin (Approve/Reject)**:
    - **Approve**: Stok otomatis berkurang, tercatat di History Keluar.
    - **Reject**: Request ditolak dengan alasan, stok tetap aman.

### 3. Laporan & Histori (Reporting)

- **History Barang Masuk**: Log lengkap kapan barang ditambah, jumlah, dan PIC penerima.
- **History Barang Keluar**: Jejak audit digital siapa yang meminta barang, kapan disetujui, dan oleh siapa.
- **Filter & Sort**: Pencarian data berdasarkan rentang tanggal dan nama barang.

### 4. Manajemen Akun & Keamanan (Security)

- **Role-Based Access Control (RBAC)**:
  - **User**: Hanya bisa Request dan Lihat Stok.
  - **Admin**: Approval Request, Input Barang Masuk, Manajemen Unit.
  - **Superadmin**: Full Access termasuk Edit Detail Barang dan Manajemen User.
- **Self-Service Security**: Update profil dan ganti password mandiri.
- **Account Deletion Protection**: Menghapus akun wajib memasukkan password konfirmasi (mencegah hijack).

### 5. Mobile-First Experience 📱

- **Adaptive Layout**: Sidebar otomatis berubah menjadi Drawer Menu di layar kecil.
- **Smart Views**: Tabel data otomatis bertransformasi menjadi **Card View** di mobile agar mudah dibaca.
- **Touch Friendly**: Tombol dan input didesain nyaman untuk layar sentuh.

---

## 🛠️ Teknologi (Tech Stack)

Dibangun menggunakan stack industri terkini:

| Layer        | Technology              | Description                                    |
| :----------- | :---------------------- | :--------------------------------------------- |
| **Frontend** | **React 19 + Vite**     | Framework UI modern, cepat, dan ringan.        |
| **Styling**  | **CSS Modules**         | Desain responsif manual tanpa framework berat. |
| **Backend**  | **Node.js + Express**   | RESTful API server.                            |
| **Database** | **MySQL (Aiven Cloud)** | Relational DB dengan ACID Transactions.        |
| **Auth**     | **JWT + Bcrypt**        | Secure stateless authentication.               |
| **DevOps**   | **Docker**              | Containerization untuk kemudahan deployment.   |

---

## 📂 Struktur Folder Proyek

```
📦 ManagementInventory
 ┣ 📂 backend                 # Server Side Code
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 config              # DB Connection
 ┃ ┃ ┣ 📂 controllers         # Business Logic
 ┃ ┃ ┣ 📂 middleware          # Auth & RBAC
 ┃ ┃ ┣ 📂 routes              # API Endpoints
 ┃ ┃ ┗ 📜 index.js            # Entry Point
 ┃ ┗ 📜 Dockerfile
 ┣ 📂 frontend                # Client Side Code
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 api                 # Axios Service Layer
 ┃ ┃ ┣ 📂 components          # Reusable UI & Layouts
 ┃ ┃ ┣ 📂 hooks               # Custom React Hooks
 ┃ ┃ ┣ 📂 pages               # Screen Views
 ┃ ┃ ┗ 📜 styles.css          # Global Variables
 ┃ ┗ 📜 Dockerfile
 ┗ 📜 docker-compose.yml      # Orchestration
```

---

## 🚀 Instalasi & Menjalankan (Local)

### Persyaratan

- Node.js v18+
- MySQL Server (Local atau Cloud)

### Cara 1: Standard (Manual)

1.  **Setup Backend**

    ```bash
    cd backend
    npm install
    cp .env.example .env
    # Konfigurasi database di file .env
    npm run dev
    ```

2.  **Setup Frontend**

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3.  Akses aplikasi di `http://localhost:5173`.

### Cara 2: Docker (Recommended) 🐳

Jika Docker Desktop sudah terinstall, cukup jalankan satu perintah:

```bash
docker-compose up -d --build
```

Aplikasi akan otomatis berjalan di container terisolasi.

---

## 🔑 Akun Default (Demo)

Gunakan kredensial berikut untuk pengujian:

| Role           | Username     | Password      | Akses                        |
| :------------- | :----------- | :------------ | :--------------------------- |
| **Superadmin** | `superadmin` | `password123` | Full Control                 |
| **Admin**      | `admin`      | `password123` | Ops Harian (Stok & Approval) |
| **User**       | `user`       | `password123` | Request Only                 |

---

## 📝 Catatan Implementasi (Untuk Laporan PKL)

- **Pemisahan Logic Backend**: Validasi stok (negatif check) dan logic transaksi (approval mengurangi stok) dilakukan di Backend menggunakan MySQL Transactions untuk menjamin data tidak korup.
- **Security Hardening**: API Endpoint dilindungi Middleware `authorize('role')` sehingga User biasa tidak bisa menembus akses Admin via Imnsomnia/Postman.
- **Responsive Strategy**: Menggunakan Custom Hook `useBreakpoint` untuk mendeteksi ukuran layar dan me-render komponen `DesktopLayout` atau `MobileLayout` secara kondisional.

## 🎨 Kustomisasi Tampilan (Customization)

### Mengganti Logo Judul dan Favicon Aplikasi

Untuk mengganti logo utama yang muncul di halaman _Login_ dan di pojok kiri atas _Sidebar_:

1. Siapkan 2 file gambar logo Anda dengan nama: `logo.png` (usahakan latar transparan) dan `favicon.ico` (untuk ikon _tab browser_).
2. Masuk ke folder `frontend/public/`
3. Timpa (Replace) file `logo.png` dan `favicon.ico` bawaan dengan file Anda yang baru.
4. _Refresh browser_ Anda (Mungkin perlu `Ctrl + Shift + R` untuk membersihkan _cache_ gambar lama).

---

**Developed for PKL Project - 2026**
