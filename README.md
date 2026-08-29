# 🎮 Nexphyrix Store - PS4 Mod & Game Sub Indo

![Nexphyrix Banner](./frontend/public/banner.png)

**Nexphyrix Store** adalah sebuah *platform* e-commerce khusus untuk mendistribusikan *Mod* dan game PS4 (PlayStation 4) dengan *Subtitle Indonesia*. Platform ini dirancang dengan antarmuka yang sangat responsif, modern, dan dilengkapi dengan *Dark Mode* untuk kenyamanan pengguna.

Sistem ini memastikan transaksi yang aman, penyembunyian *link* rahasia untuk publik, dan dashboard manajemen yang lengkap bagi admin maupun member.

---

## ✨ Fitur Utama

### 🛒 Untuk Pengunjung & Member (Publik)
- **Katalog Game Modern**: Tampilan *grid* katalog game dengan animasi *glassmorphism* dan pencarian pintar secara *real-time*.
- **Dark Mode & Light Mode**: Tema situs yang bisa disesuaikan dengan preferensi pengguna hanya dengan satu klik.
- **Keranjang Belanja (Cart)**: Fitur keranjang dinamis untuk membeli beberapa *mod* sekaligus.
- **Member Diskon**: Fitur keanggotaan (Member) yang akan otomatis mendapatkan diskon setiap pembelian.
- **Pembayaran Mudah**: Pilihan *checkout* instan melalui **Messenger** atau **Telegram** langsung ke Admin, dilengkapi dengan *QRIS* otomatis.
- **Profil Member**: Dashboard privat di mana member dapat melacak status pesanan, total penghematan, mengelola biodata, serta mengakses **Link Download Game** secara otomatis saat pesanan selesai.

### 🛡️ Untuk Super Admin
- **Manajemen Pesanan**: Setujui atau batalkan pesanan masuk. Saat pesanan disetujui (Selesai), link *download* akan otomatis muncul di akun member pembeli.
- **Manajemen Database Link**: Tambah, edit, dan kelola katalog game dengan mudah. (Mendukung *Bulk Import* via Paste Teks).
- **Manajemen Kategori**: Buat dan kelompokkan game berdasarkan kategori.
- **Tabel Daftar Member**: Pantau seluruh data member yang terdaftar, termasuk informasi alamat dan lokasi.

---

## 🛠️ Teknologi yang Digunakan

Website ini dibangun menggunakan arsitektur modern **Jamstack** (*Serverless*):

*   **Frontend**: React.js (v18), Vite, TypeScript
*   **Styling**: Tailwind CSS, Lucide Icons
*   **Routing**: React Router DOM (HashRouter untuk GitHub Pages)
*   **Backend & Database**: **Supabase** (PostgreSQL, GoTrue Auth, PostgREST API)
*   **Keamanan**: Row Level Security (RLS) di lapisan Database (Anti-SQLi & Data Breach)
*   **Hosting**: GitHub Pages (Frontend) & Supabase Cloud (Backend)

---

## 🚀 Cara Akses & Penggunaan (Live Website)

Website ini sudah di-deploy secara publik dan dapat diakses langsung tanpa perlu instalasi lokal.

1. **Buka Halaman Utama**: Kunjungi URL Live GitHub Pages Anda (misal: `https://nexphyr.github.io/nexphyrix.store`).
2. **Sebagai Pengunjung**: Anda bisa mencari game, memfilter kategori, dan memasukkan game ke keranjang.
3. **Mendaftar Member**: Klik "Login" di pojok kanan atas, lalu gunakan akun Google Anda untuk mendaftar sebagai Member secara gratis.
4. **Checkout**: Saat checkout, Anda akan diberikan panduan QRIS dan akan dialihkan ke Telegram/Messenger untuk konfirmasi ke admin.
5. **Akses Admin**: Login menggunakan email Super Admin (misal: `nexphyrix@atomicmail.io`). Sistem akan otomatis mengenali Anda sebagai admin dan menampilkan menu rahasia **"Admin Panel"** di ujung kanan layar.

---

## 💻 Instalasi Lokal (Untuk Developer)

Jika Anda ingin menjalankan atau memodifikasi kode sumber (*source code*) ini di komputer lokal Anda:

### Prasyarat
- **Node.js** (v18 ke atas) terinstall di komputer.
- Akun dan Project di **Supabase**.

### Langkah-langkah
1. **Kloning Repositori**
   ```bash
   git clone https://github.com/nexphyr/nexphyrix.store.git
   cd nexphyrix.store/frontend
   ```

2. **Instalasi Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Buat file `.env` di dalam folder `frontend/` dan masukkan URL serta Anon Key dari project Supabase Anda:
   ```env
   VITE_SUPABASE_URL="https://xxxxx.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="eyJhxxxx..."
   ```

4. **Jalankan Mode Development**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173` di browser Anda. Setiap perubahan pada kode (*save*) akan otomatis me-refresh halaman (*Hot Reload*).

5. **Build untuk Produksi**
   ```bash
   npm run build
   ```
   Folder `dist/` akan dihasilkan dan siap untuk di-deploy ke server atau layanan hosting statis manapun (seperti GitHub Pages atau Vercel).

---

## 🔒 Catatan Keamanan
- Kredensial *database* asli (seperti *Service Role Key* atau *Password Postgres*) **TIDAK PERNAH** diekspos ke frontend.
- Semua perlindungan baca/tulis data dikontrol dengan ketat oleh *Row Level Security (RLS)* di Supabase, memastikan pengunjung tidak bisa mengakses Link Game rahasia tanpa membelinya.
- Untuk ketahanan maksimal terhadap serangan **DDoS**, disarankan mengarahkan Domain website Anda melalui **Cloudflare**.

---
*© 2026 Nexphyrix Store. All rights reserved.*
