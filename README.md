# ChatKita

Chat realtime full-stack dibangun dengan React, Tailwind CSS, Express, Socket.IO, dan MongoDB.

## Struktur

- `client/` — React + Tailwind CSS
- `server/` — Express, Socket.IO, dan MongoDB

## Instalasi

### Prasyarat

- Node.js 18+
- MongoDB lokal atau MongoDB Atlas

### Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Environment

Server membaca nilai berikut:

- `PORT=5000`
- `MONGO_URI=mongodb://127.0.0.1:27017/chatkita`
- `JWT_SECRET=ubah-ke-rahasia-kuat`
- `CLIENT_URL=http://localhost:5173`

## Fitur

- Registrasi dan login JWT
- Daftar pengguna dan percakapan
- Pesan 1-v-1 realtime
- Status terkirim, terbaca, dan sentang biru
- Indikator sedang mengetik
- Foto, emoji, dan voice note
- Chat grup
- Status/story otomatis kedaluwarsa setelah 24 jam
- Edit profil dan foto profil
- Mode terang dan gelap
