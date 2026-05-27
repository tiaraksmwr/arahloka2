# ArahLoka

ArahLoka adalah platform penjelajahan budaya Indonesia yang membantu Anda menemukan, menjelajahi, dan melestarikan kekayaan budaya Nusantara.

## Cara Menjalankan Proyek

### 1. Backend

Masuk ke direktori `backend`, instal dependensi, lalu jalankan server.

```bash
cd backend
npm install
npm run dev
```

Server akan berjalan di [http://localhost:3001](http://localhost:3001).

### 2. Frontend

Masuk ke direktori `frontend`, instal dependensi, lalu jalankan aplikasi React.

```bash
cd frontend
npm install
npm run dev
```

Aplikasi akan berjalan di [http://localhost:5173](http://localhost:5173) (atau port lain yang tersedia).

## Fitur Utama (Foundation)

- **Landing Page**: Informasi umum tentang ArahLoka.
- **Paket Budaya**: Menampilkan daftar paket wisata budaya dari database SQLite.
- **Health Check**: Endpoint API untuk memverifikasi status backend.
- **Integrasi Cuaca**: Informasi cuaca real-time untuk setiap paket wisata menggunakan Open-Meteo API.
- **Sistem Booking**: Alur lengkap untuk turis memesan paket dan penyedia jasa menyetujuinya.
- **ArahLoka Trip Planner**: Perencanaan perjalanan otomatis dan checklist persiapan yang terintegrasi langsung dengan booking pengguna.
- **Journey Studio**: Platform kreatif untuk abadikan kenangan perjalanan melalui **Memory Lane Card** (kartu pos digital) dan bagikan cerita budaya inspiratif di **Community Story Challenge**.

## Demo Accounts

Untuk keperluan pengujian, Anda dapat menggunakan akun demo berikut:

### 1. Superadmin
- **Email**: `admin@arahloka.com`
- **Password**: `admin123`
- **Role**: Pengelolaan user dan persetujuan provider.

### 2. Travel Provider (Sudah Approved)
- **Java Heritage Travel**: `provider@arahloka.com` / `provider123`
- **Bali Culture Trip**: `bali@arahloka.com` / `provider123`
- **Nusantara Culture Tour**: `nusantara@arahloka.com` / `provider123`

### 3. Tourist
- **Pendaftaran**: Turis dapat mendaftar langsung melalui halaman Register dan langsung aktif (Approved otomatis).

## Teknologi

- **Frontend**: React (Vite), Plain CSS.
- **Backend**: Node.js, Express.
- **Database**: SQLite.
