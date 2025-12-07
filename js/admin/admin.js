// ==========================================
// KRIUK KITA - ADMIN.JS
// JavaScript khusus untuk Admin Panel (CRUD)
// ==========================================

let products = [];
let editingProductId = null;
const modal = new bootstrap.Modal(document.getElementById('productModal'));

// Load products on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

// Load products from localStorage or JSON
async function loadProducts() {
    try {
        // Check localStorage first (for CRUD updates)
        const localProducts = localStorage.getItem('kriukKitaProducts');
        
        if (localProducts) {
            products = JSON.parse(localProducts);
        } else {
            // Load from JSON file first time
            const response = await fetch('../data/products.json');
            const data = await response.json();
            products = data.products;
            localStorage.setItem('kriukKitaProducts', JSON.stringify(products));
        }
        
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsTableBody').innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    ❌ Gagal memuat produk. Silakan refresh halaman.
                </td>
            </tr>
        `;
    }
}

// Display products in table
function displayProducts() {
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    📦 Belum ada produk. Klik "Tambah Produk Baru" untuk memulai.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td data-label="ID">${product.id}</td>
            <td data-label="Gambar">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100'">
            </td>
            <td data-label="Nama">${product.name}</td>
            <td data-label="Kategori">
                <span class="badge bg-secondary">${getCategoryIcon(product.category)} ${getCategoryName(product.category)}</span>
            </td>
            <td data-label="Harga"><strong>Rp ${product.price.toLocaleString('id-ID')}</strong></td>
            <td data-label="Stok">
                <span class="badge ${product.stock < 20 ? 'bg-danger' : 'bg-success'}">${product.stock}</span>
            </td>
            <td data-label="Rating">⭐ ${product.rating}</td>
            <td data-label="Aksi">
                <div class="table-actions">
                    <button class="btn-action btn-edit" onclick="editProduct(${product.id})" title="Edit Produk">
                        ✏️ Edit
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})" title="Hapus Produk">
                        🗑️ Hapus
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get category name
function getCategoryName(category) {
    const categories = {
        'keripik': 'Keripik',
        'makaroni': 'Makaroni',
        'kerupuk': 'Kerupuk',
        'kacang': 'Kacang',
        'paket': 'Paket'
    };
    return categories[category] || category;
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'keripik': '🥔',
        'makaroni': '🍝',
        'kerupuk': '🦐',
        'kacang': '🥜',
        'paket': '📦'
    };
    return icons[category] || '📦';
}

// Reset form (for adding new product)
function resetForm() {
    editingProductId = null;
    document.getElementById('modalTitle').innerHTML = '➕ Tambah Produk Baru';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
}

// Edit product (populate form with existing data)
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) {
        alert('❌ Produk tidak ditemukan!');
        return;
    }

    editingProductId = id;
    document.getElementById('modalTitle').innerHTML = '✏️ Edit Produk';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productRating').value = product.rating;
    document.getElementById('productFeatured').checked = product.featured || false;

    modal.show();
}

// Save product (CREATE or UPDATE)
function saveProduct() {
    const form = document.getElementById('productForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Get form data
    const productData = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        image: document.getElementById('productImage').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        stock: parseInt(document.getElementById('productStock').value),
        rating: parseFloat(document.getElementById('productRating').value),
        featured: document.getElementById('productFeatured').checked
    };

    // Additional validation
    if (productData.name.length < 3) {
        alert('❌ Nama produk minimal 3 karakter!');
        return;
    }

    if (productData.price < 1000) {
        alert('❌ Harga minimal Rp 1.000!');
        return;
    }

    if (productData.stock < 0) {
        alert('❌ Stok tidak boleh negatif!');
        return;
    }

    if (productData.rating < 0 || productData.rating > 5) {
        alert('❌ Rating harus antara 0-5!');
        return;
    }

    if (editingProductId) {
        // UPDATE existing product
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                ...productData
            };
            alert('✅ Produk berhasil diupdate!');
        }
    } else {
        // CREATE new product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId,
            ...productData,
            variants: [
                { size: "100g", price: productData.price }
            ]
        };
        products.push(newProduct);
        alert('✅ Produk baru berhasil ditambahkan!');
    }

    // Save to localStorage
    localStorage.setItem('kriukKitaProducts', JSON.stringify(products));
    
    // Refresh table
    displayProducts();
    
    // Close modal and reset form
    modal.hide();
    resetForm();
}

// Delete product
function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) {
        alert('❌ Produk tidak ditemukan!');
        return;
    }

    const confirmMessage = `🗑️ HAPUS PRODUK

Apakah Anda yakin ingin menghapus produk ini?

Nama: ${product.name}
Kategori: ${getCategoryName(product.category)}
Harga: Rp ${product.price.toLocaleString('id-ID')}

⚠️ Tindakan ini tidak dapat dibatalkan!`;

    if (confirm(confirmMessage)) {
        // Remove product from array
        products = products.filter(p => p.id !== id);
        
        // Save to localStorage
        localStorage.setItem('kriukKitaProducts', JSON.stringify(products));
        
        // Refresh table
        displayProducts();
        
        alert('✅ Produk berhasil dihapus!');
    }
}

// Export products to JSON (bonus feature)
function exportProducts() {
    const dataStr = JSON.stringify({ products }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportName = `kriuk-kita-products-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
    
    alert('✅ Data produk berhasil diekspor!');
}

// Reset all products (for testing)
function resetProducts() {
    if (confirm('⚠️ RESET DATA\n\nApakah Anda yakin ingin mereset semua produk ke data awal?\n\nSemua perubahan akan hilang!')) {
        localStorage.removeItem('kriukKitaProducts');
        window.location.reload();
    }
}