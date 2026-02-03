# 📦 Web Inventory Management System

Sistem Manajemen Inventaris ATK berbasis web untuk keperluan PKL.

## 🚀 Quick Start

### Prasyarat
- Node.js v18+
- npm v9+

### Instalasi

```bash
# Clone repository
git clone <repository-url>
cd ManagementInventory

# Install dependencies backend
cd backend
npm install

# Install dependencies frontend
cd ../frontend
npm install
```

### Development Tools

Project ini dilengkapi dengan Linter & Formatter.
```bash
# Cek kerapian kode
npm run lint

# Rapikan otomatis
npm run format
```

### Menjalankan Aplikasi

**Cara 1: Windows Script (Direkomendasikan untk Dev)**
```powershell
.\start-dev.ps1
```

**Cara 2: Docker (Production Ready)**
Jika Docker Desktop sudah terinstall:
```bash
docker-compose up -d --build
```
Aplikasi akan berjalan di container yang terisolasi.

**Cara 3: Manual (Single Terminal)**
Paling simpel untuk development cepat.
```bash
npm run dev
```

### Seed Database

```bash
cd backend
node src/seed.js
```

---

## 🔐 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| SuperAdmin | `superadmin` | `admin123` |
| Admin | `admin1` | `admin123` |
| User | `ssgs` | `user123` |
| Viewer | `viewer` | `viewer123` |

---

## 📋 Fitur

### SuperAdmin
- ✅ Dashboard navigasi
- ✅ View & Edit Items (stok ATK)
- ✅ Approval permintaan barang keluar
- ✅ Daftar Barang Masuk
- ✅ Daftar Barang Keluar
- ✅ Manage Units (user/unit kerja)

### Admin
- ✅ Dashboard navigasi
- ✅ View Items (tidak bisa edit)
- ✅ Approval permintaan barang keluar
- ✅ Daftar Barang Masuk
- ✅ Daftar Barang Keluar
- ❌ Manage Units (superadmin only)

### User
- ✅ Dashboard + Barang Kosong
- ✅ View Items + Request barang
- ✅ List Permintaan (own)
- ✅ Informasi (history barang yang diambil)
- ❌ Approval, History Masuk/Keluar

---

## 🏗️ Arsitektur

```
ManagementInventory/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── config/         # Database & Swagger config
│   │   ├── controllers/    # Business Logic
│   │   ├── middleware/     # Auth & Security middleware
│   │   ├── routes/         # API routes
│   │   └── index.js        # Entry point
│   └── package.json
│
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── api/            # API clients
│   │   ├── components/     # UI components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   └── routes/         # Route definitions
│   └── package.json
│
└── package.json            # Root scripts
```

---

## 🔌 API Endpoints
Documentasi lengkap API tersedia via Swagger UI di:
`http://localhost:3000/api-docs`

### Authentication

### Authentication
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |

### Items
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/atk-items` | All |
| GET | `/api/atk-items/:id` | All |
| PUT | `/api/atk-items/:id` | SuperAdmin |
| POST | `/api/atk-items` | SuperAdmin |

### Requests
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/requests` | All (filtered) |
| POST | `/api/requests` | User, Admin, SuperAdmin |

### Approval
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/approval` | Admin, SuperAdmin |
| POST | `/api/approval/:id/approve` | Admin, SuperAdmin |
| POST | `/api/approval/:id/reject` | Admin, SuperAdmin |

### History
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/history/masuk` | Admin, SuperAdmin |
| GET | `/api/history/keluar` | Admin, SuperAdmin |
| GET | `/api/history/user` | All (own data) |

### Barang Masuk
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/barang-masuk` | Admin, SuperAdmin |
| POST | `/api/barang-masuk` | Admin, SuperAdmin |

### Units
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/units` | SuperAdmin |
| POST | `/api/units` | SuperAdmin |
| DELETE | `/api/units/:id` | SuperAdmin |

---

## 🛡️ Security Features

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Role-based Access Control
- ✅ User data isolation
- ✅ Backend validation (never trust frontend)
- ✅ Negative stock prevention
- ✅ Double approval prevention
- ✅ Pending request lock on edit
- ✅ **Helmet Protection** (Secure Headers)
- ✅ **Rate Limiting** (DDoS Protection)

---

## 📊 Business Logic

### Flow Request Barang
```
User Request → PENDING → Admin Approve → Stock Reduced → Record Keluar
                       ↓
                  Admin Reject → No Stock Change
```

### Stock Calculation
- Source of Truth: `atk_items.qty`
- Barang Masuk: `qty += amount`
- Approval: `qty -= request.qty`
- Barang Kosong: Derived from `qty = 0`

---

## ⚠️ Known Limitations

1. **Item identified by NAME** - Item lookup uses name, not ID
2. **SQLite limitations** - No true transaction rollback (manual implemented)
3. **No real-time updates** - Need refresh to see latest data

---

## 🧪 Testing

```bash
# Seed test data
cd backend
node src/seed.js

# Test endpoints
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}'
```

---

## 📝 License

ISC License - PKL Project 2026
