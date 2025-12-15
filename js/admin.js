
// Menyimpan semua produk dari database
let products = [];

// Menyimpan ID produk yang sedang diedit
// Jika null  mode tambah produk
let editingProductId = null;

// Instance modal Bootstrap KEtika DOM ready
let productModal = null;


// Pengeceakn liblary supabase

// Pastikan variabel `db` dari auth.js tersedia
if (typeof db === 'undefined') {
    console.error(
        "CRITICAL: Variabel 'db' tidak ditemukan. " +
        "Pastikan auth.js dimuat SEBELUM admin.js"
    );
}



// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', async function () {

    // Ambil elemen modal dari HTML
    const modalElement = document.getElementById('productModal');

    if (modalElement) {
        productModal = bootstrap.Modal.getOrCreateInstance(modalElement);
    }

    // Cek apakah tabel produk ada
    // Jika ada  berarti kita di halaman dashboard admin
    const tableExists = document.getElementById('productsTableBody');
    if (tableExists) {
        await loadProducts();
    }
});


// Load data dari data base

async function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    // Tampilkan indikator loading di tabel
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-5">
                <div class="spinner-border text-orange"></div>
                <div class="mt-2 text-muted">Sedang memuat data...</div>
            </td>
        </tr>
    `;

    try {
        // Query ke tabel products di Supabase
        const { data, error } = await db
            .from('products')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        // Simpan hasil query ke variabel global
        products = data;

        // Tampilkan ke tabel HTML
        displayProducts();

        // Update statistik dashboard (jika fungsi tersedia)
        if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
        }

    } catch (error) {
        console.error('Error loadProducts:', error);

        // Tampilkan pesan error ke tabel
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    Gagal memuat: ${error.message}
                </td>
            </tr>
        `;
    }
}


// Tampilkan data tabel dashboard

function displayProducts() {
    const tbody = document.getElementById('productsTableBody');

    // Jika belum ada produk sama sekali
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    Belum ada produk.
                    Klik tombol <b>"Tambah Produk"</b>.
                </td>
            </tr>
        `;
        return;
    }

    // Render setiap produk ke baris tabel
    tbody.innerHTML = products.map(product => `
        <tr>
            <td class="ps-4">
                <div class="d-flex align-items-center">
                    <img src="${product.image}"
                        class="img-thumb-admin me-3"
                        style="width:50px;height:50px;object-fit:cover;border-radius:6px;"
                        onerror="this.src='https://placehold.co/50?text=No+Img'">
                    <div>
                        <span class="fw-bold d-block">${product.name}</span>
                        <small class="text-muted">ID: ${product.id}</small>
                    </div>
                </div>
            </td>

            <td>
                <span class="badge bg-light text-dark border">
                    ${getCategoryName(product.category)}
                </span>
            </td>

            <td class="fw-bold text-secondary">
                Rp ${parseInt(product.price).toLocaleString('id-ID')}
            </td>

            <td>
                <span class="badge ${product.stock < 10 ? 'bg-danger' : 'bg-success'} rounded-pill">
                    ${product.stock} pcs
                </span>
            </td>

            <td>
                ${product.featured
                    ? '<span class="badge bg-warning text-dark">Ya</span>'
                    : '<span class="text-muted small">Tidak</span>'
                }
            </td>

            <td class="text-end pe-4">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary"
                            onclick="editProduct(${product.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="deleteProduct(${product.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}
//  Update statistik Dashboard

function updateDashboardStats() {
    const totalEl = document.getElementById('statTotal');
    const lowStockEl = document.getElementById('statLowStock');

    // Total produk
    if (totalEl) totalEl.innerText = products.length;

    // Produk stok rendah (<10)
    if (lowStockEl) {
        lowStockEl.innerText = products.filter(p => p.stock < 10).length;
    }
}



//  Simpan Produk insert/update

async function saveProduct() {
    const form = document.getElementById('productForm');

    // Validasi HTML form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Ubah tombol jadi loading
    const btnSave = document.querySelector('#productModal .btn-primary');
    const oldText = btnSave.innerHTML;
    btnSave.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';
    btnSave.disabled = true;

    // Ambil data dari input form
    const productData = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value) || 0,
        image: document.getElementById('productImage').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        stock: parseInt(document.getElementById('productStock').value) || 0,
        rating: parseFloat(document.getElementById('productRating').value) || 5.0,
        featured: document.getElementById('productFeatured').checked
    };

    try {
        let error;

        if (editingProductId) {
            // MODE EDIT (UPDATE)
            const response = await db
                .from('products')
                .update(productData)
                .eq('id', editingProductId);

            error = response.error;
        } else {
            // MODE TAMBAH (INSERT)
            const response = await db
                .from('products')
                .insert([productData]);

            error = response.error;
        }

        if (error) throw error;

        alert(' Data berhasil disimpan!');

        // Tutup modal
        if (productModal) productModal.hide();

        // Reset form & reload data
        resetForm();
        await loadProducts();

    } catch (err) {
        console.error("Gagal simpan:", err);

        if (err.message.includes("row-level security")) {
            alert(" Izin ditolak oleh database (RLS Policy).");
        } else {
            alert(' Terjadi kesalahan: ' + err.message);
        }

    } finally {
        // Kembalikan tombol
        btnSave.innerHTML = oldText;
        btnSave.disabled = false;
    }
}


// HAPUS PRODUK

async function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (confirm(`Apakah Anda yakin ingin menghapus "${product.name}"?`)) {
        try {
            const { error } = await db
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('✅ Produk berhasil dihapus.');
            await loadProducts();

        } catch (err) {
            console.error("Gagal hapus:", err);

            if (err.message.includes("row-level security")) {
                alert(" Anda tidak memiliki izin menghapus data ini.");
            } else {
                alert(' Gagal menghapus: ' + err.message);
            }
        }
    }
}

// EDIT PRODUK

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;

    // Ubah judul modal
    document.getElementById('modalTitle').innerText = 'Edit Produk';

    // Isi form dengan data lama
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productRating').value = product.rating;
    document.getElementById('productFeatured').checked = product.featured;

    // Tampilkan modal
    if (productModal) productModal.show();
}


// 8. RESET FORM

function resetForm() {
    editingProductId = null;

    document.getElementById('modalTitle').innerText = 'Tambah Produk Baru';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';

    // Nilai default
    document.getElementById('productStock').value = 10;
    document.getElementById('productRating').value = 5.0;
}



// Ubah kode kategori menjadi nama yang ramah
function getCategoryName(cat) {
    const list = {
        keripik: 'Keripik',
        makaroni: 'mie',
        kerupuk: 'daging',
        kacang: 'Kacang',
        paket: 'Paket'
    };
    return list[cat] || cat;
}

// (Opsional) Icon kategori
function getCategoryIcon(cat) {
    const list = {
        keripik: '🥔',
        makaroni: '🍝',
        kerupuk: '🦐',
        kacang: '🥜',
        paket: '📦'
    };
    return list[cat] || '📦';
}
