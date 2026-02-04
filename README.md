# Web Inventory Management System

A comprehensive web-based inventory management system designed for PKL projects. This system manages ATK (Alat Tulis Kantor) stock flow with role-based access control, secure transaction handling, and a fully responsive mobile-first design.

## 🚀 Features

### Core Functionality
*   **Role-Based Access Control (RBAC)**: Distinct distinct capabilities for User, Admin, and Superadmin.
*   **Inventory Tracking**: Real-time tracking of item quantities, locations, and low-stock alerts.
*   **Request & Approval Flow**: Streamlined process for users to request items and admins to approve/reject them.
*   **Transactional History**: Automatic logging of "Barang Masuk" and "Barang Keluar" for audit trails.
*   **Stock Integrity**: Protection against negative stock and concurrent modification conflicts.

### Security & Integrity
*   **Secure Authentication**: JWT-based auth with password hashing (bcrypt).
*   **Transaction Safety**: ACID-compliant database transactions for stock movements.
*   **Integrity Locks**: Prevents editing item details (Name/Qty) if there are pending requests.
*   **Account Protection**: Critical actions (like account deletion) require password confirmation.
*   **Input Validation**: Strict validation for all forms to prevent data corruption.

### Mobile-First UI
*   **Responsive Design**: Automatically switches between Desktop Sidebar and Mobile Drawer layouts.
*   **Mobile Card Views**: Specialized card components for tables on mobile devices for better readability.
*   **Touch Optimized**: 44px minimum touch targets and optimized form inputs.

## 🛠️ Tech Stack

### Frontend
*   **React** (v19) + **Vite**: Fast, modern UI development.
*   **TypeScript**: Type-safe code for better maintainability.
*   **CSS Modules / Vanilla CSS**: Custom, responsive styling without heavy frameworks.
*   **Axios**: Secure HTTP client with interceptors.

### Backend
*   **Node.js** + **Express**: Robust RESTful API.
*   **MySQL**: Relational database for structured inventory data.
*   **JWT**: Stateless authentication mechanism.

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MySQL Server

### 1. Database Setup
1.  Create a MySQL database named `atk`.
2.  Import the provided schema/seed file located at `backend/data/atk.sql` (if available) or rely on migration scripts.

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DB credentials
npm run dev
# Server runs on http://localhost:3000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed (default points to localhost:3000)
npm run dev
# App runs on http://localhost:5173
```

## 🔐 Default Credentials
*(Only for development/testing)*

*   **Superadmin**: `superadmin` / `password123`
*   **Admin**: `admin` / `password123`
*   **User**: `user` / `password123`

## 📝 License
This project is created for PKL (Praktik Kerja Lapangan) purposes.
