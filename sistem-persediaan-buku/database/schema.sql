DROP TABLE IF EXISTS stock_mutations;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(150),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(150),
    isbn VARCHAR(30),
    publisher VARCHAR(150),
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    publication_year INT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_mutations (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    mutation_type VARCHAR(20) NOT NULL CHECK (mutation_type IN ('IN', 'OUT', 'ADJUSTMENT')),
    quantity INT NOT NULL CHECK (quantity > 0),
    reason VARCHAR(100),
    reference_no VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_books_supplier_id ON books(supplier_id);
CREATE INDEX idx_stock_mutations_book_id ON stock_mutations(book_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_mutations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to categories" ON categories
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to suppliers" ON suppliers
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to books" ON books
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to stock_mutations" ON stock_mutations
FOR ALL USING (true) WITH CHECK (true);

INSERT INTO categories (name, description) VALUES
('Novel', 'Buku fiksi dan cerita panjang'),
('Pendidikan', 'Buku pelajaran dan referensi akademik'),
('Komik', 'Buku komik, ilustrasi, dan hiburan visual');

INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('Gramedia Pustaka Utama', 'Rina Permata', '081234567890', 'rina@gramedia.id', 'Jl. Sudirman No. 10, Jakarta'),
('Mitra Ilmu', 'Budi Santoso', '082345678901', 'budi@mitrailmu.id', 'Jl. Merdeka No. 44, Bandung'),
('Buku Nusantara', 'Tina Wijaya', '083456789012', 'tina@bukunusantara.id', 'Jl. Diponegoro No. 88, Surabaya');

INSERT INTO books (sku, title, author, isbn, publisher, category_id, supplier_id, purchase_price, price, stock_quantity, publication_year, description) VALUES
('BK-1001', 'Laskar Pelangi', 'Andrea Hirata', '9786020328756', 'Bentang Pustaka', 1, 1, 60000, 85000, 24, 2005, 'Novel inspiratif tentang semangat belajar dan persahabatan.'),
('BK-1002', 'Matematika untuk SMA Kelas X', 'Tim Erlangga', '9786021234567', 'Erlangga', 2, 2, 85000, 120000, 18, 2023, 'Buku panduan pelajaran matematika untuk jenjang SMA.'),
('BK-1003', 'Naruto Vol. 1', 'Masashi Kishimoto', '9789791234568', 'Shueisha', 3, 3, 45000, 65000, 15, 2021, 'Komik aksi petualangan ninja yang terkenal di dunia.'),
('BK-1004', 'Biologi untuk SMA', 'Rina Sari', '9786029876543', 'Pustaka Edu', 2, 2, 80000, 115000, 12, 2024, 'Referensi biologi modern untuk siswa SMA.'),
('BK-1005', 'Dilan 1990', 'Pidi Baiq', '9786021112233', 'Mizan', 1, 1, 65000, 90000, 20, 2014, 'Novel populer dengan nuansa romantis dan budaya khas Bandung.');

INSERT INTO stock_mutations (book_id, mutation_type, quantity, reason, reference_no, notes) VALUES
(1, 'IN', 12, 'Pembelian baru', 'PO-001', 'Stok masuk dari supplier Gramedia Pustaka Utama'),
(2, 'IN', 8, 'Pembelian bulan ini', 'PO-002', 'Penambahan stok untuk kebutuhan sekolah'),
(1, 'OUT', 3, 'Penjualan retail', 'SO-010', 'Pengiriman ke toko cabang'),
(3, 'ADJUSTMENT', 2, 'Cek stok', 'ADJ-005', 'Penyesuaian stok hasil audit'),
(5, 'OUT', 5, 'Penjualan online', 'SO-014', 'Pesanan pelanggan melalui marketplace');

SELECT pg_catalog.setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 0), true);
SELECT pg_catalog.setval(pg_get_serial_sequence('suppliers', 'id'), COALESCE((SELECT MAX(id) FROM suppliers), 0), true);
SELECT pg_catalog.setval(pg_get_serial_sequence('books', 'id'), COALESCE((SELECT MAX(id) FROM books), 0), true);
SELECT pg_catalog.setval(pg_get_serial_sequence('stock_mutations', 'id'), COALESCE((SELECT MAX(id) FROM stock_mutations), 0), true);
