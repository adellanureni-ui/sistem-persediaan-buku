# a book – Sistem Informasi Persediaan Buku

**a book** merupakan sistem informasi sederhana yang dibuat untuk membantu pengelolaan usaha toko buku, khususnya dalam pencatatan data buku, kategori, supplier, transaksi mutasi stok, serta informasi log persediaan barang.

## 🔗 Tentang a book

**a book** merupakan platform manajemen persediaan toko buku yang menyediakan berbagai macam kategori buku mulai dari Fiksi, Sains & Teknologi, hingga Pengembangan Diri untuk membantu operasional gudang secara teratur.

Produk buku yang masuk dipantau berdasarkan pencatatan nota supplier, jumlah stok fisik saat ini, serta harga beli dan harga jual agar nilai valuasi aset persediaan terpantau secara transparan.

## 🎯 Tujuan Sistem

Sistem ini dibuat untuk membantu pengelolaan data usaha secara lebih rapi dan praktis, meliputi:
* Pengelolaan data buku
* Pengelolaan data kategori
* Pengelolaan data supplier
* Pengelolaan stok barang (Masuk & Keluar)
* Perhitungan otomatis sisa stok pasca-mutasi
* Pencegahan stok minus (*error handling* transaksi)

## 🛠️ Fitur

### 📊 Dashboard
Menampilkan ringkasan data:
* Total Judul Buku
* Total Unit Stok
* Total Supplier

### 📚 Data Buku
Digunakan untuk mencatat:
* ID Buku
* Judul Buku
* ISBN
* Pengarang
* Penerbit
* Harga Beli
* Harga Jual
* Stok
* Aksi (Tambah, Edit, Hapus)

### 🏷️ Data Kategori
Digunakan untuk menyimpan:
* Nama Kategori

### 🚚 Data Supplier
Digunakan untuk menyimpan:
* Nama Supplier
* Kontak
* Alamat

### 🔄 Mutasi Stok
Digunakan untuk mencatat:
* Judul Buku
* Jenis Mutasi (Stok Masuk / Stok Keluar)
* Jumlah Barang
* Keterangan / Alasan

*Sistem juga secara otomatis mengubah jumlah stok barang setelah transaksi mutasi berhasil disimpan.*

## 🧮 Unsur Akuntansi & Aturan Bisnis

Sistem menggunakan beberapa perhitungan dasar dan logika validasi persediaan:

**Stok Akhir Masuk:**
```text
Stok Awal + Jumlah Barang Masuk
```

**Stok Akhir Keluar:**
```text
Stok Awal - Jumlah Barang Keluar
```

**Aturan Bisnis Batas Pengurangan Stok:**
```text
IF Jumlah Barang Keluar > Stok Saat Ini THEN Tampilkan "Transaksi Ditolak!"
```

## 💻 Teknologi

* HTML
* CSS
* JavaScript
* Supabase (PostgreSQL)
* Git
* GitHub
* Visual Studio Code

## 📁 Struktur Project

```text
sistem-persediaan-buku/
├── database/
│   └── schema.sql
├── backend/
│   └── app.js
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```
