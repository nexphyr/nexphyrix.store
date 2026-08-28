# Link Database Management System (PS4 Sub Indo)

## Overview
A modern web application designed to securely manage a database of links (specifically PS4 Sub Indo games). It features a public-facing search interface that hides sensitive URLs, and a secure admin dashboard for complete CRUD operations.

## Requirements
- Windows 10/11
- Node.js LTS (v18+)
- PostgreSQL
- npm

## Install PostgreSQL
1. Download installer resmi dari [PostgreSQL Official Website](https://www.postgresql.org/download/windows/).
2. Jalankan installer dan ikuti petunjuknya. 
3. **Ingat password** yang Anda buat saat instalasi untuk user `postgres`.
4. Buka **pgAdmin** atau **psql**, lalu buat database baru:
   ```sql
   CREATE DATABASE ps4_link_database;
   ```

## Installation & Setup

1. **Configure Environment**
   Buka folder `backend/`, copy file `.env.example` menjadi `.env`.
   Sesuaikan `DATABASE_URL` dengan password PostgreSQL Anda:
   ```env
   DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/ps4_link_database?schema=public"
   ```

2. **Backend Setup**
   ```powershell
   cd backend
   npm install

   # Generate password admin (Copy the output hash and paste into .env as ADMIN_PASSWORD_HASH)
   npm run hash-password

   # Push schema to database
   npx prisma generate
   npx prisma db push

   # Seed initial categories & admin user
   npm run db:seed
   ```

3. **Frontend Setup**
   ```powershell
   cd ../frontend
   npm install
   ```

## Running the Application (Development)

Untuk menjalankan aplikasi secara langsung di Windows, Anda bisa kembali ke root folder dan menggunakan:

```powershell
# Jalankan command ini di root project
npm run dev
```

Atau cukup klik dua kali pada file **`start-dev.bat`** untuk membuka terminal frontend dan backend secara bersamaan.

### URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Production Deployment (GitHub Pages)

Karena frontend akan di-deploy ke GitHub Pages (Public) dan Backend di server terpisah (Private/Secure):
1. Ubah `VITE_API_URL` (atau sesuaikan `baseURL` axios) di `frontend/src/services/api.ts` agar mengarah ke domain backend production Anda.
2. Build Frontend:
   ```powershell
   cd frontend
   npm run build
   ```
   Folder `dist/` siap di-deploy ke GitHub Pages.

> **PENTING**: Jangan pernah commit file `.env` atau memasukkan secret key (password, database url) ke dalam frontend codebase. File konfigurasi `.env` harus ditambahkan ke server backend Anda secara manual.
