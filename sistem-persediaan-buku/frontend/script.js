const dashboardState = {
  books: [],
  mutations: [],
  suppliers: []
};

const pages = {
  dashboard: document.getElementById('page-dashboard'),
  buku: document.getElementById('page-buku'),
  kategori: document.getElementById('page-kategori'),
  supplier: document.getElementById('page-supplier'),
  mutasi: document.getElementById('page-mutasi')
};

const navLinks = document.querySelectorAll('.nav-item');
const statusMessage = document.getElementById('statusMessage');
const bookTableBody = document.getElementById('bookTableBody');
const mutationList = document.getElementById('mutationList');
const supplierList = document.getElementById('supplierList');
const categoryTableBody = document.getElementById('categoryTableBody');
const supplierTableBody = document.getElementById('supplierTableBody');
const mutationTableBody = document.getElementById('mutationTableBody');
const categorySelect = document.getElementById('kategori-buku');
const mutationBookSelect = document.getElementById('select-buku-mutasi');
const modalEditBuku = document.getElementById('modal-edit-buku');
const formEditBuku = document.getElementById('form-edit-buku');
const editBookIdInput = document.getElementById('edit-book-id');
const editCategorySelect = document.getElementById('edit-kategori-buku');
const formBukuBaru = document.getElementById('form-buku-baru');
const formKategori = document.getElementById('form-kategori');
const formSupplier = document.getElementById('form-supplier');
const formMutasiStok = document.getElementById('form-mutasi-stok');
const selectBukuMutasi = document.getElementById('select-buku-mutasi');
const selectJenisMutasi = document.getElementById('select-jenis-mutasi');
const inputJumlahMutasi = document.getElementById('input-jumlah-mutasi');
const inputKeteranganMutasi = document.getElementById('input-keterangan-mutasi');
const btnSimpanMutasi = document.getElementById('btn-simpan-mutasi');

function getSupabaseClient() {
  const config = window.supabase?.config || {};
  const url = config.url;
  const anonKey = config.anonKey;

  if (typeof window.supabase?.getClient === 'function') {
    return window.supabase.getClient();
  }

  if (!url || !anonKey || url.includes('your-project-id') || anonKey.includes('your-anon-key')) {
    return null;
  }

  return window.supabase.createClient(url, anonKey);
}

function setActivePage(targetPage) {
  Object.entries(pages).forEach(([key, page]) => {
    if (!page) return;
    page.style.display = key === targetPage ? 'block' : 'none';
  });

  navLinks.forEach((link) => {
    const isActive = link.dataset.page === targetPage;
    link.classList.toggle('active', isActive);
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const page = link.dataset.page;
    if (page) {
      setActivePage(page);
    }
  });
});

const tambahBukuButton = document.getElementById('btnTambahBuku');
if (tambahBukuButton) {
  tambahBukuButton.addEventListener('click', (event) => {
    event.preventDefault();
    setActivePage('buku');
  });
}

async function loadCategoriesToSelect(selectElement = categorySelect) {
  if (!selectElement) return;

  const supabase = getSupabaseClient();
  if (!supabase) {
    selectElement.innerHTML = '<option value="">Pilih kategori</option>';
    return;
  }

  const { data, error } = await supabase.from('categories').select('id, name').order('name', { ascending: true });

  if (error) {
    console.error('Category load error:', error);
    showStatus('Gagal mengambil data kategori dari Supabase.', 'error');
    selectElement.innerHTML = '<option value="">Pilih kategori</option>';
    return;
  }

  selectElement.innerHTML = '<option value="">Pilih kategori</option>' +
    (data || [])
      .map((category) => `<option value="${category.id}">${category.name}</option>`)
      .join('');
}

function closeEditModal() {
  if (modalEditBuku) {
    modalEditBuku.style.display = 'none';
  }

  if (formEditBuku) {
    formEditBuku.reset();
    if (editBookIdInput) {
      editBookIdInput.value = '';
    }
  }
}

function openEditModal(book) {
  if (!book || !modalEditBuku || !formEditBuku) return;

  document.getElementById('edit-book-id').value = book.id;
  document.getElementById('edit-judul-buku').value = book.title || '';
  document.getElementById('edit-isbn-buku').value = book.isbn || '';
  document.getElementById('edit-pengarang-buku').value = book.author || '';
  document.getElementById('edit-penerbit-buku').value = book.publisher || '';
  document.getElementById('edit-harga-beli-buku').value = book.purchase_price ?? 0;
  document.getElementById('edit-harga-jual-buku').value = book.price ?? 0;

  loadCategoriesToSelect(editCategorySelect).then(() => {
    if (editCategorySelect) {
      editCategorySelect.value = book.category_id ? String(book.category_id) : '';
    }
  });

  modalEditBuku.style.display = 'block';
}

async function handleDeleteBook(bookId) {
  const id = Number(bookId);

  if (!id || Number.isNaN(id)) {
    showStatus('ID buku tidak valid untuk dihapus.', 'error');
    return;
  }

  const confirmed = window.confirm('Apakah Anda yakin ingin menghapus buku ini?');
  if (!confirmed) return;

  const supabase = getSupabaseClient();
  if (!supabase) {
    showStatus('Client Supabase belum siap. Cek konfigurasi URL & anon key.', 'error');
    return;
  }

  try {
    const { error } = await supabase.from('books').delete().eq('id', id);

    if (error) {
      console.error('Delete book error:', error);
      showStatus('Gagal menghapus buku dari Supabase.', 'error');
      return;
    }

    await renderData();
    showStatus('Buku berhasil dihapus.', 'info');
  } catch (error) {
    console.error('Exception during delete book:', error);
    showStatus('Terjadi kesalahan saat menghapus buku.', 'error');
  }
}

function populateMutationBookSelect(listBuku = dashboardState.books) {
  const dropdownBuku = document.getElementById('select-buku-mutasi');

  if (!dropdownBuku) return;

  dropdownBuku.innerHTML = '<option value="">-- Pilih Buku --</option>';

  if (!Array.isArray(listBuku) || !listBuku.length) return;

  listBuku.forEach((b) => {
    const idBuku = b.id_buku ?? b.id ?? b.book_id;
    const judulBuku = b.judul ?? b.title ?? 'Judul tidak tersedia';
    dropdownBuku.innerHTML += `<option value="${idBuku}">${judulBuku}</option>`;
  });
}

function renderCategoryTable(categories = []) {
  if (!categoryTableBody) return;

  if (!categories.length) {
    categoryTableBody.innerHTML = `
      <tr>
        <td colspan="2" style="text-align:center; color:#6b7280; padding: 28px 12px;">Belum ada data kategori.</td>
      </tr>
    `;
    return;
  }

  categoryTableBody.innerHTML = categories
    .map(
      (category) => `
        <tr>
          <td>${category.id}</td>
          <td>${category.name}</td>
        </tr>
      `
    )
    .join('');
}

function renderSupplierTable(suppliers = []) {
  if (!supplierTableBody) return;

  if (!suppliers.length) {
    supplierTableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; color:#6b7280; padding: 28px 12px;">Belum ada data supplier.</td>
      </tr>
    `;
    return;
  }

  supplierTableBody.innerHTML = suppliers
    .map(
      (supplier) => `
        <tr>
          <td>${supplier.id}</td>
          <td>${supplier.name}</td>
          <td>${supplier.contact_person || '-'}</td>
          <td>${supplier.address || '-'}</td>
        </tr>
      `
    )
    .join('');
}

function renderMutationTable(mutations = []) {
  if (!mutationTableBody) return;

  if (!mutations.length) {
    mutationTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; color:#6b7280; padding: 28px 12px;">Belum ada riwayat mutasi stok.</td>
      </tr>
    `;
    return;
  }

  mutationTableBody.innerHTML = mutations
    .map((item) => {
      const bookTitle = item.books?.title || item.book_title || 'Judul tidak tersedia';
      const createdAt = item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-';

      return `
        <tr>
          <td>${item.id}</td>
          <td>${bookTitle}</td>
          <td>${item.mutation_type}</td>
          <td>${item.quantity}</td>
          <td>${item.reason || '-'}</td>
          <td>${item.reference_no || '-'}</td>
          <td>${createdAt}</td>
        </tr>
      `;
    })
    .join('');
}

async function renderData() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    showStatus('Konfigurasi Supabase belum diisi. Silakan cek backend/app.js.', 'error');
    return;
  }

  await loadCategoriesToSelect();

  const [booksResult, suppliersResult, mutationsResult, categoriesResult] = await Promise.all([
    supabase.from('books').select('*'),
    supabase.from('suppliers').select('*').order('id', { ascending: true }),
    supabase.from('stock_mutations').select('*, books(title)').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('id', { ascending: true })
  ]);

  if (booksResult.error) {
    console.error('Books error:', booksResult.error);
    showStatus('Gagal mengambil data buku dari Supabase.', 'error');
    return;
  }

  if (suppliersResult.error) {
    console.error('Suppliers error:', suppliersResult.error);
    showStatus('Gagal mengambil data supplier dari Supabase.', 'error');
    return;
  }

  if (mutationsResult.error) {
    console.error('Stock mutations error:', mutationsResult.error);
    showStatus('Gagal mengambil data mutasi stok dari Supabase.', 'error');
    return;
  }

  if (categoriesResult.error) {
    console.error('Categories error:', categoriesResult.error);
    showStatus('Gagal mengambil data kategori dari Supabase.', 'error');
    return;
  }

  const bookData = booksResult.data || [];
  const supplierData = suppliersResult.data || [];
  const mutationData = mutationsResult.data || [];
  const categoryData = categoriesResult.data || [];

  const categoryMap = Object.fromEntries((categoryData || []).map((cat) => [cat.id, cat.name]));
  const supplierMap = Object.fromEntries((supplierData || []).map((s) => [s.id, s.name]));

  dashboardState.books = bookData.map((book) => ({
    ...book,
    category_name: categoryMap[book.category_id] || 'Tanpa Kategori',
    supplier_name: supplierMap[book.supplier_id] || 'Tanpa Supplier'
  }));

  dashboardState.suppliers = supplierData;
  dashboardState.mutations = mutationData;
  populateMutationBookSelect(dashboardState.books);

  renderCategoryTable(categoryData);
  renderSupplierTable(supplierData);
  renderMutationTable(mutationData);
  renderSummary();
  renderBooksTable();
  renderMutations();
  renderSuppliers();
  showStatus('Data dashboard berhasil dimuat dari Supabase.', 'info');
}

if (formBukuBaru) {
  formBukuBaru.addEventListener('submit', async (event) => {
    event.preventDefault();

    const supabase = getSupabaseClient();
    if (!supabase) {
      showStatus('Client Supabase belum siap. Cek konfigurasi URL & anon key.', 'error');
      return;
    }

    const formData = new FormData(formBukuBaru);
    const categoryId = parseInt(formData.get('category_id'), 10);
    const title = String(formData.get('title') || '').trim();
    const isbn = String(formData.get('isbn') || '').trim();
    const author = String(formData.get('author') || '').trim();
    const publisher = String(formData.get('publisher') || '').trim();
    const purchasePrice = parseFloat(formData.get('purchase_price')) || 0;
    const sellingPrice = parseFloat(formData.get('price')) || 0;
    const stockQuantity = parseInt(formData.get('stock_quantity'), 10) || 0;

    if (!title || !isbn || !author || !publisher || !categoryId || sellingPrice <= 0 || stockQuantity < 0) {
      showStatus('Semua field wajib diisi dengan nilai yang valid.', 'error');
      return;
    }

    const payload = {
      sku: `BK-${Date.now()}`,
      title,
      author,
      isbn,
      publisher,
      category_id: categoryId,
      supplier_id: null,
      purchase_price: purchasePrice,
      price: sellingPrice,
      stock_quantity: stockQuantity,
      publication_year: new Date().getFullYear(),
      description: `Penerbit: ${publisher}`
    };

    try {
      const { error } = await supabase.from('books').insert([payload]);

      if (error) {
        console.error('Insert book error:', error);
        showStatus('Gagal menambahkan buku baru ke Supabase.', 'error');
        return;
      }

      formBukuBaru.reset();
      setActivePage('dashboard');
      await renderData();
      showStatus('Buku baru berhasil ditambahkan dan dashboard diperbarui.', 'info');
    } catch (error) {
      console.error('Exception during insert book:', error);
      showStatus('Terjadi kesalahan saat menyimpan buku baru.', 'error');
    }
  });
}

if (formEditBuku) {
  formEditBuku.addEventListener('submit', async (event) => {
    event.preventDefault();

    const supabase = getSupabaseClient();
    if (!supabase) {
      showStatus('Client Supabase belum siap. Cek konfigurasi URL & anon key.', 'error');
      return;
    }

    const id = Number(editBookIdInput?.value || 0);
    const formData = new FormData(formEditBuku);
    const categoryId = parseInt(formData.get('category_id'), 10);
    const title = String(formData.get('title') || '').trim();
    const isbn = String(formData.get('isbn') || '').trim();
    const author = String(formData.get('author') || '').trim();
    const publisher = String(formData.get('publisher') || '').trim();
    const purchasePrice = parseFloat(formData.get('purchase_price')) || 0;
    const sellingPrice = parseFloat(formData.get('price')) || 0;

    if (!id || !title || !isbn || !author || !publisher || !categoryId || sellingPrice <= 0) {
      showStatus('Data edit buku tidak lengkap atau tidak valid.', 'error');
      return;
    }

    const payload = {
      title,
      isbn,
      author,
      publisher,
      category_id: categoryId,
      purchase_price: purchasePrice,
      price: sellingPrice
    };

    try {
      const { error } = await supabase.from('books').update(payload).eq('id', id);

      if (error) {
        console.error('Update book error:', error);
        showStatus('Gagal memperbarui data buku di Supabase.', 'error');
        return;
      }

      closeEditModal();
      await renderData();
      showStatus('Data buku berhasil diperbarui.', 'info');
    } catch (error) {
      console.error('Exception during update book:', error);
      showStatus('Terjadi kesalahan saat memperbarui buku.', 'error');
    }
  });
}

if (formKategori) {
  formKategori.addEventListener('submit', async (event) => {
    event.preventDefault();

    const supabase = getSupabaseClient();
    if (!supabase) {
      showStatus('Client Supabase belum siap. Cek konfigurasi URL & anon key.', 'error');
      return;
    }

    const formData = new FormData(formKategori);
    const name = String(formData.get('name') || '').trim();

    if (!name) {
      showStatus('Nama kategori wajib diisi.', 'error');
      return;
    }

    try {
      const { error } = await supabase.from('categories').insert([{ name }]);

      if (error) {
        console.error('Insert category error:', error);
        showStatus('Gagal menambahkan kategori.', 'error');
        return;
      }

      formKategori.reset();
      await renderData();
      showStatus('Kategori berhasil ditambahkan.', 'info');
    } catch (error) {
      console.error('Exception during insert category:', error);
      showStatus('Terjadi kesalahan saat menyimpan kategori.', 'error');
    }
  });
}

if (formSupplier) {
  formSupplier.addEventListener('submit', async (event) => {
    event.preventDefault();

    const supabase = getSupabaseClient();
    if (!supabase) {
      showStatus('Client Supabase belum siap. Cek konfigurasi URL & anon key.', 'error');
      return;
    }

    const formData = new FormData(formSupplier);
    const name = String(formData.get('name') || '').trim();
    const contactPerson = String(formData.get('contact_person') || '').trim();
    const address = String(formData.get('address') || '').trim();

    if (!name || !contactPerson || !address) {
      showStatus('Nama supplier, kontak, dan alamat wajib diisi.', 'error');
      return;
    }

    try {
      const { error } = await supabase.from('suppliers').insert([
        {
          name,
          contact_person: contactPerson,
          address,
          phone: '',
          email: ''
        }
      ]);

      if (error) {
        console.error('Insert supplier error:', error);
        showStatus('Gagal menambahkan supplier.', 'error');
        return;
      }

      formSupplier.reset();
      await renderData();
      showStatus('Supplier berhasil ditambahkan.', 'info');
    } catch (error) {
      console.error('Exception during insert supplier:', error);
      showStatus('Terjadi kesalahan saat menyimpan supplier.', 'error');
    }
  });
}

if (formMutasiStok) {
  formMutasiStok.addEventListener('submit', async (event) => {
    event.preventDefault();

    const supabase = getSupabaseClient();
    if (!supabase) {
      showStatus('Client Supabase belum siap. Cek konfigurasi URL & anon key.', 'error');
      return;
    }

    const bookId = Number(selectBukuMutasi?.value || 0);
    const mutationType = String(selectJenisMutasi?.value || '').trim().toUpperCase();
    const quantity = Number(inputJumlahMutasi?.value || 0);
    const reason = String(inputKeteranganMutasi?.value || '').trim();

    if (!bookId || !mutationType || !quantity || quantity <= 0 || !reason) {
      showStatus('Pilih buku, jenis mutasi, jumlah, dan alasan terlebih dahulu.', 'error');
      return;
    }

    try {
      const { error: mutationError } = await supabase.from('stock_mutations').insert([
        {
          book_id: bookId,
          mutation_type: mutationType,
          quantity,
          reason,
          reference_no: '',
          notes: reason
        }
      ]);

      if (mutationError) {
        console.error('Insert stock mutation error:', mutationError);
        showStatus('Gagal menyimpan transaksi mutasi ke Supabase.', 'error');
        return;
      }

      const currentBook = dashboardState.books.find((book) => Number(book.id) === bookId);
      if (currentBook) {
        const nextStock = mutationType === 'IN'
          ? Number(currentBook.stock_quantity || 0) + quantity
          : Number(currentBook.stock_quantity || 0) - quantity;

        const { error: stockError } = await supabase
          .from('books')
          .update({ stock_quantity: Math.max(nextStock, 0) })
          .eq('id', bookId);

        if (stockError) {
          console.error('Update stock quantity error:', stockError);
        }
      }

      formMutasiStok.reset();
      await renderData();
      showStatus('Transaksi mutasi berhasil disimpan.', 'info');
    } catch (error) {
      console.error('Exception during stock mutation submit:', error);
      showStatus('Terjadi kesalahan saat menyimpan transaksi mutasi.', 'error');
    }
  });
}

if (bookTableBody) {
  bookTableBody.addEventListener('click', async (event) => {
    const targetButton = event.target.closest('[data-action]');
    if (!targetButton) return;

    const action = targetButton.dataset.action;
    const bookId = Number(targetButton.dataset.bookId);

    if (action === 'edit-book') {
      if (!bookId || Number.isNaN(bookId)) {
        showStatus('ID buku tidak valid untuk diedit.', 'error');
        return;
      }

      const cachedBook = dashboardState.books.find((item) => Number(item.id) === bookId);
      if (cachedBook) {
        openEditModal(cachedBook);
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        showStatus('Client Supabase belum siap. Cek konfigurasi URL & anon key.', 'error');
        return;
      }

      try {
        const { data, error } = await supabase.from('books').select('*').eq('id', bookId).single();

        if (error) {
          console.error('Load book by id error:', error);
          showStatus('Gagal mengambil data buku untuk diedit.', 'error');
          return;
        }

        if (data) {
          openEditModal(data);
        }
      } catch (error) {
        console.error('Exception while loading book for edit:', error);
        showStatus('Terjadi kesalahan saat membuka form edit.', 'error');
      }
    }

    if (action === 'delete-book') {
      await handleDeleteBook(bookId);
    }
  });
}

document.querySelectorAll('[data-close-modal="edit"]').forEach((button) => {
  button.addEventListener('click', closeEditModal);
});

renderData();

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
});

function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.classList.remove('hidden');
}

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function renderSummary() {
  const totalBooks = dashboardState.books.length;
  const totalStock = dashboardState.books.reduce((sum, book) => sum + Number(book.stock_quantity || 0), 0);
  const totalValue = dashboardState.books.reduce((sum, book) => sum + Number(book.price || 0) * Number(book.stock_quantity || 0), 0);
  const lastMutation = dashboardState.mutations.length;

  document.getElementById('totalBooks').textContent = totalBooks;
  document.getElementById('totalStock').textContent = totalStock;
  document.getElementById('totalValue').textContent = formatCurrency(totalValue);
  document.getElementById('lastMutation').textContent = lastMutation;
}

function renderBooksTable() {
  if (!bookTableBody) return;

  if (!dashboardState.books.length) {
    bookTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; color:#6b7280; padding: 28px 12px;">Belum ada data buku.</td>
      </tr>
    `;
    return;
  }

  bookTableBody.innerHTML = dashboardState.books
    .map((book) => {
      const badgeClass = Number(book.stock_quantity || 0) > 10 ? 'good' : 'warn';
      const stockLabel = Number(book.stock_quantity || 0) > 10 ? 'Cukup' : 'Rendah';

      return `
        <tr>
          <td>${book.sku || '-'}</td>
          <td>${book.title || '-'}</td>
          <td>${book.category_name || 'Tanpa Kategori'}</td>
          <td>${book.supplier_name || 'Tanpa Supplier'}</td>
          <td>${formatCurrency(book.price)}</td>
          <td><span class="badge ${badgeClass}">${stockLabel} (${book.stock_quantity || 0})</span></td>
          <td>
            <div style="display: flex; gap: 8px; justify-content: flex-start;">
              <button type="button" data-action="edit-book" data-book-id="${book.id}" style="border: none; background: #f59e0b; color: white; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">Edit</button>
              <button type="button" data-action="delete-book" data-book-id="${book.id}" style="border: none; background: #dc2626; color: white; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">Hapus</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

}

function renderMutations() {
  const recent = dashboardState.mutations.slice(0, 5);

  mutationList.innerHTML = recent.length
    ? recent
        .map((item) => {
          const date = item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-';
          return `
            <li>
              <div>
                <strong>${item.reason || item.mutation_type}</strong>
                <small>${date}</small>
              </div>
              <span class="badge ${item.mutation_type === 'OUT' ? 'warn' : 'good'}">${item.mutation_type}</span>
            </li>
          `;
        })
        .join('')
    : '<li><small>Belum ada mutasi stok.</small></li>';
}

function renderSuppliers() {
  supplierList.innerHTML = dashboardState.suppliers.length
    ? dashboardState.suppliers
        .map(
          (supplier) => `
            <li>
              <div>
                <strong>${supplier.name}</strong>
                <small>${supplier.phone || 'No. telp belum ada'}</small>
              </div>
            </li>
          `
        )
        .join('')
    : '<li><small>Belum ada data supplier.</small></li>';
}

async function fetchDashboardData() {
  const config = window.supabase?.config || {};
  const url = config.url;
  const anonKey = config.anonKey;

  if ((!url || !anonKey || url.includes('your-project-id') || anonKey.includes('your-anon-key')) && typeof window.supabase?.getClient !== 'function') {
    showStatus('Konfigurasi Supabase belum diisi. Ganti URL dan anonKey di backend/app.js.', 'error');
    return;
  }

  const supabase = typeof window.supabase?.getClient === 'function'
    ? window.supabase.getClient()
    : window.supabase.createClient(url, anonKey);

  if (!supabase) {
    showStatus('Gagal membuat client Supabase. Cek konfigurasi URL dan anonKey.', 'error');
    return;
  }

  const [booksResult, suppliersResult, mutationsResult] = await Promise.all([
    supabase.from('books').select('*'),
    supabase.from('suppliers').select('*'),
    supabase.from('stock_mutations').select('*').order('created_at', { ascending: false }).limit(5)
  ]);

  if (booksResult.error) {
    console.error('Books error:', booksResult.error);
    showStatus('Gagal mengambil data buku dari Supabase.', 'error');
    return;
  }

  if (suppliersResult.error) {
    console.error('Suppliers error:', suppliersResult.error);
    showStatus('Gagal mengambil data supplier dari Supabase.', 'error');
    return;
  }

  if (mutationsResult.error) {
    console.error('Stock mutations error:', mutationsResult.error);
    showStatus('Gagal mengambil data mutasi stok dari Supabase.', 'error');
    return;
  }

  const bookData = booksResult.data || [];
  const supplierData = suppliersResult.data || [];
  const mutationData = mutationsResult.data || [];

  const categoriesResult = await supabase.from('categories').select('*');
  if (!categoriesResult.error) {
    const categoryMap = Object.fromEntries((categoriesResult.data || []).map((cat) => [cat.id, cat.name]));
    const supplierMap = Object.fromEntries((supplierData || []).map((s) => [s.id, s.name]));

    dashboardState.books = bookData.map((book) => ({
      ...book,
      category_name: categoryMap[book.category_id] || 'Tanpa Kategori',
      supplier_name: supplierMap[book.supplier_id] || 'Tanpa Supplier'
    }));
  } else {
    dashboardState.books = bookData;
  }

  dashboardState.suppliers = supplierData;
  dashboardState.mutations = mutationData;
  populateMutationBookSelect(dashboardState.books);

  renderSummary();
  renderBooksTable();
  renderMutations();
  renderSuppliers();
  showStatus('Data dashboard berhasil dimuat dari Supabase.', 'info');
}

populateMutationBookSelect();
fetchDashboardData();
