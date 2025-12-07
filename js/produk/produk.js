// ==========================================
// KRIUK KITA - PRODUK.JS
// JavaScript khusus untuk Halaman Produk
// ==========================================

let allProducts = [];
let currentCategory = 'all';

// Load products from JSON
async function loadProducts() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const productsGrid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');

    try {
        loadingIndicator.style.display = 'block';
        productsGrid.style.display = 'none';
        noProducts.style.display = 'none';

        const response = await fetch('../data/products.json');
        const data = await response.json();
        allProducts = data.products;

        // Check localStorage for updated products (from CRUD)
        const localProducts = localStorage.getItem('kriukKitaProducts');
        if (localProducts) {
            allProducts = JSON.parse(localProducts);
        }

        loadingIndicator.style.display = 'none';
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        loadingIndicator.innerHTML = '<p class="text-danger">Gagal memuat produk. Silakan refresh halaman.</p>';
    }
}

// Display products using Bootstrap Cards
function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');

    if (products.length === 0) {
        productsGrid.style.display = 'none';
        noProducts.style.display = 'block';
        return;
    }

    productsGrid.style.display = 'flex';
    noProducts.style.display = 'none';

    productsGrid.innerHTML = products.map(product => `
        <div class="col-sm-6 col-md-4 col-lg-3">
            <div class="card">
                <img src="${product.image}" class="card-img-top" alt="${product.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400'">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-price">Rp ${product.price.toLocaleString('id-ID')}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="badge bg-warning text-dark">⭐ ${product.rating}</span>
                        <span class="text-muted small">Stok: ${product.stock}</span>
                    </div>
                    <button class="btn btn-orange w-100" onclick="addToCart(${product.id})">
                        🛒 Tambah ke Keranjang
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter products by category
function filterProducts(category) {
    currentCategory = category;
    const filtered = category === 'all' 
        ? allProducts 
        : allProducts.filter(p => p.category === category);
    
    displayProducts(filtered);

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
}

// Add to cart
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // Check if user is logged in
    if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
        alert('Silakan login terlebih dahulu untuk menambah produk ke keranjang!');
        window.location.href = '../login.html';
        return;
    }

    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('kriukKitaCart') || '[]');
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity + 1 > product.stock) {
            alert(`Stok ${product.name} tidak mencukupi. Stok tersedia: ${product.stock}`);
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    // Save cart
    localStorage.setItem('kriukKitaCart', JSON.stringify(cart));
    
    // Show success message with better UX
    const toast = document.createElement('div');
    toast.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-5';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <strong>✅ Berhasil!</strong><br>
        ${product.name} ditambahkan ke keranjang
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
    
    // Update cart badge if function exists
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
}

// Initialize filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        filterProducts(btn.dataset.category);
    });
});

// Load products on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});