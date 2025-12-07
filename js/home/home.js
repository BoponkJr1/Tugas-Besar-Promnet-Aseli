// ==========================================
// KRIUK KITA - HOME.JS
// JavaScript khusus untuk Homepage
// ==========================================

// Load featured products on home page
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProducts();
});

async function loadFeaturedProducts() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        const featured = data.products.filter(p => p.featured).slice(0, 4);
        
        const container = document.getElementById('featuredProducts');
        container.innerHTML = featured.map(product => `
            <div class="col-md-6 col-lg-3">
                <div class="card">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description.substring(0, 60)}...</p>
                        <p class="card-price">Rp ${product.price.toLocaleString('id-ID')}</p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge bg-warning text-dark">⭐ ${product.rating}</span>
                            <span class="text-muted small">Stok: ${product.stock}</span>
                        </div>
                        <a href="pages/produk.html" class="btn btn-orange w-100">Lihat Detail</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('featuredProducts').innerHTML = `
            <div class="col-12 text-center">
                <p class="text-danger">Gagal memuat produk. Silakan refresh halaman.</p>
            </div>
        `;
    }
}