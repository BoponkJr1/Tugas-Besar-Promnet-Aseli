// ==========================================
// KRIUK KITA - ADMIN.JS (FIXED VERSION)
// ==========================================

// Variabel Global
let products = [];
let editingProductId = null;
let productModal = null; // Kita inisialisasi nanti

// Cek Library Supabase
if (typeof db === 'undefined') {
    console.error("CRITICAL: Variabel 'db' tidak ditemukan. Pastikan auth.js dimuat SEBELUM admin.js");
}

// 1. INISIALISASI SAAT HALAMAN DIMUAT
document.addEventListener('DOMContentLoaded', async function() {
    // Inisialisasi Modal Bootstrap dengan cara yang aman
    const modalElement = document.getElementById('productModal');
    if (modalElement) {
        // Gunakan getOrCreateInstance agar tidak bentrok dengan data-bs-toggle di HTML
        productModal = bootstrap.Modal.getOrCreateInstance(modalElement);
    }

    // Cek apakah tabel ada, jika ada berarti kita di halaman dashboard
    const tableExists = document.getElementById('productsTableBody');
    if (tableExists) {
        await loadProducts();
    }
});

// 2. LOAD DATA DARI SUPABASE
async function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    // Tampilkan Loading
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-orange"></div><div class="mt-2 text-muted">Sedang memuat data...</div></td></tr>';

    try {
        // Ambil data terbaru dari database
        const { data, error } = await db
            .from('products')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        products = data;
        displayProducts();
        
        // Update statistik angka di atas dashboard
        if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
        }

    } catch (error) {
        console.error('Error loadProducts:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">❌ Gagal memuat: ${error.message}</td></tr>`;
    }
}

// 3. TAMPILKAN DATA KE TABEL
function displayProducts() {
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">📦 Belum ada produk. Klik tombol <b>"Tambah Produk"</b>.</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td class="ps-4">
                <div class="d-flex align-items-center">
                    <img src="${product.image}" class="img-thumb-admin me-3" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;"
                         onerror="this.src='https://placehold.co/50?text=No+Img'">
                    <div>
                        <span class="fw-bold text-dark d-block">${product.name}</span>
                        <small class="text-muted">ID: ${product.id}</small>
                    </div>
                </div>
            </td>
            <td><span class="badge bg-light text-dark border">${getCategoryName(product.category)}</span></td>
            <td class="fw-bold text-secondary">Rp ${parseInt(product.price).toLocaleString('id-ID')}</td>
            <td><span class="badge ${product.stock < 10 ? 'bg-danger' : 'bg-success'} rounded-pill">${product.stock} pcs</span></td>
            <td>${product.featured ? '<span class="badge bg-warning text-dark">Ya</span>' : '<span class="text-muted small">Tidak</span>'}</td>
            <td class="text-end pe-4">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${product.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id})" title="Hapus">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 4. FUNGSI UPDATE STATISTIK (JIKA ADA ELEMENNYA)
function updateDashboardStats() {
    const totalEl = document.getElementById('statTotal');
    const lowStockEl = document.getElementById('statLowStock');
    
    if (totalEl) totalEl.innerText = products.length;
    if (lowStockEl) lowStockEl.innerText = products.filter(p => p.stock < 10).length;
}

// 5. SIMPAN DATA (CREATE / UPDATE)
async function saveProduct() {
    const form = document.getElementById('productForm');
    
    // Validasi input HTML (required, type number, dll)
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Ubah tombol jadi loading
    const btnSave = document.querySelector('#productModal .btn-primary');
    const oldText = btnSave.innerHTML;
    btnSave.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';
    btnSave.disabled = true;

    // Siapkan data object
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
            // === MODE UPDATE ===
            console.log("Mengupdate ID:", editingProductId); // Debugging
            const response = await db
                .from('products')
                .update(productData)
                .eq('id', editingProductId); // Pastikan ID cocok
            
            error = response.error;
        } else {
            // === MODE INSERT ===
            console.log("Menambah produk baru"); // Debugging
            const response = await db
                .from('products')
                .insert([productData]);
            
            error = response.error;
        }

        if (error) throw error;

        alert('✅ Data berhasil disimpan!');
        
        // Tutup modal
        if (productModal) productModal.hide();
        
        // Reset form dan reload data
        resetForm();
        await loadProducts();

    } catch (err) {
        console.error("Gagal simpan:", err);
        // Pesan error khusus jika kena RLS Policy
        if (err.message.includes("row-level security")) {
            alert("❌ GAGAL: Izin ditolak oleh Database. Cek RLS Policy di Supabase.");
        } else {
            alert('❌ Terjadi kesalahan: ' + err.message);
        }
    } finally {
        // Kembalikan tombol
        btnSave.innerHTML = oldText;
        btnSave.disabled = false;
    }
}

// 6. HAPUS DATA
async function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (confirm(`Apakah Anda yakin ingin menghapus "${product.name}"?`)) {
        try {
            console.log("Menghapus ID:", id); // Debugging
            
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
                alert("❌ GAGAL: Anda tidak memiliki izin menghapus data ini (Cek RLS).");
            } else {
                alert('❌ Gagal menghapus: ' + err.message);
            }
        }
    }
}

// 7. SIAPKAN FORM UNTUK EDIT
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;
    
    // Ubah judul modal
    const title = document.getElementById('modalTitle');
    if (title) title.innerText = 'Edit Produk';
    
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

    // Buka modal
    if (productModal) productModal.show();
}

// 8. RESET FORM (Dipanggil saat klik Tambah Produk atau setelah simpan)
function resetForm() {
    editingProductId = null;
    
    const title = document.getElementById('modalTitle');
    if (title) title.innerText = 'Tambah Produk Baru';
    
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    
    // Set default values
    document.getElementById('productStock').value = 10;
    document.getElementById('productRating').value = 5.0;
}

// HELPER: Format Kategori
function getCategoryName(cat) { 
    const list = {'keripik':'Keripik', 'makaroni':'Makaroni', 'kerupuk':'Kerupuk', 'kacang':'Kacang', 'paket':'Paket'}; 
    return list[cat] || cat; 
}

function getCategoryIcon(cat) { 
    const list = {'keripik':'🥔', 'makaroni':'🍝', 'kerupuk':'🦐', 'kacang':'🥜', 'paket':'📦'}; 
    return list[cat] || '📦'; 
}