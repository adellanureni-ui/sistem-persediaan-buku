# 📚 Sistem Manajemen Persediaan Buku - Toko "a book"

Sistem informasi berbasis web (Web Apps) yang dirancang khusus untuk mempermudah pengelolaan data master buku, pengelompokan kategori, manajemen supplier, serta pencatatan log harian mutasi stok (barang masuk dan keluar) secara real-time. Aplikasi ini menggunakan pendekatan arsitektur serverless modern dengan memanfaatkan *Supabase* sebagai basis data awan (Cloud Database).

---

## 🏗️ Desain Database & Arsitektur ERD (4 Entitas)
Sistem ini dirancang secara ramping dan efisien menggunakan struktur *4 Entitas Utama* yang saling terelasi:
1. *kategori*: Mengelompokkan genre/jenis buku untuk kerapian manajemen stok.
2. *buku*: Menyimpan data detail buku (Judul, ISBN, Pengarang, Penerbit, Harga Beli, Harga Jual) serta kuantitas sisa stok saat ini.
3. *supplier*: Mencatat profile vendor atau pihak ketiga yang memasok buku ke gudang.
4. *mutasi_stok*: Buku jurnal digital tunggal (log harian) yang mencatat kronologi perubahan stok barang masuk maupun keluar.

---

## 📂 Struktur Dokumen Proyek
text
/sistem-persediaan-buku
├── /database
│   └── schema.sql        # Skema query tabel PostgreSQL & data dummy awal
├── /backend
│   └── app.js            # Modul konfigurasi global API Key Supabase Client
└── /frontend
    ├── index.html        # Layout antarmuka Single Page Application (SPA)
    ├── style.css         # Desain responsive bertema warna merah marun premium
    └── script.js         # Logika event klik navigasi & integrasi Supabase

---

## ⚡ Fitur Utama Aplikasi
- *Dashboard Interaktif*: Menampilkan widget ringkasan total judul buku, total unit stok tersedia, dan jumlah supplier aktif secara dinamis.
- *Single Page Application (SPA): Navigasi menu sidebar yang interaktif dan responsif tanpa perlu melakukan pemuatan ulang halaman (*reload).
- *Manajemen Persediaan Otomatis*: Form mutasi stok harian yang simpel. Setiap input "Stok Masuk" akan otomatis menambah stok di tabel buku, dan input "Stok Keluar" akan otomatis mengurangi stok.
- *Aturan Bisnis Aman*: Sistem secara otomatis menolak transaksi "Stok Keluar" jika jumlah barang yang dikeluarkan melebihi sisa stok fisik buku saat itu agar terhindar dari stok minus.
- *Fitur Kelola Data Lengkap: Modul form pengisian data baru beserta fungsionalitas tombol **Edit* dan *Hapus* pada baris data buku.

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

Ikuti langkah mudah berikut untuk menjalankan aplikasi ini di komputer/laptop Anda:

### 1. Prasyarat Penginstalan
Pastikan Anda telah menginstal editor kode *Visual Studio Code (VS Code)* di komputer Anda.

### 2. Setup Database (Supabase)
1. Buat proyek baru di dashboard [Supabase](https://supabase.com).
2. Masuk ke menu *SQL Editor*, buat query baru, lalu salin dan jalankan seluruh perintah dari file /database/schema.sql.
3. Buka menu *Project Settings* -> *API, lalu salin nilai *Project URL dan anon public API Key milik Anda.
4. Buka file /backend/app.js di editor Anda, lalu masukkan kedua nilai tersebut pada konfigurasi window.SUPABASE_CONFIG.

### 3. Menjalankan Aplikasi via Live Server
1. Buka folder proyek ini menggunakan aplikasi VS Code.
2. Masuk ke menu *Extensions* (Ctrl + Shift + X), cari ekstensi bernama *"Live Server"* (oleh Ritwick Dey), kemudian klik *Install*.
3. Buka file /frontend/index.html di dalam VS Code.
4. Klik kanan di area editor file index.html tersebut, lalu pilih opsi *"Open with Live Server"* (atau klik tombol *"Go Live"* di pojok kanan bawah status bar VS Code).
5. Browser utama Anda akan otomatis terbuka dan mengarah ke alamat lokal http://127.0.0. Aplikasi siap digunakan!
