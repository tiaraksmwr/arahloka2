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

## Teknologi

- **Frontend**: React (Vite), Plain CSS.
- **Backend**: Node.js, Express.
- **Database**: SQLite.
