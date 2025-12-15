
// UPDATE CART BADGE DI NAVBAR

function updateCartBadge() {
    // Ambil data keranjang dari localStorage
    const cart = JSON.parse(localStorage.getItem('kriukKitaCart') || '[]');

    // Hitung total item 
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Cari semua link yang mengarah ke halaman keranjang
    const cartLinks = document.querySelectorAll('a[href*="keranjang"]');

    cartLinks.forEach(link => {
        // Hapus badge lama jika ada
        const existingBadge = link.querySelector('.cart-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Tambahkan badge baru jika item > 0
        if (totalItems > 0) {
            const badge = document.createElement('span');
            badge.className = 'badge bg-danger rounded-pill ms-1';
            badge.textContent = totalItems;
            badge.style.fontSize = '0.7rem';
            link.appendChild(badge);
        }
    });
}

// AMBIL & SIMPAN CART

// Ambil cart dari localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('kriukKitaCart') || '[]');
}

// Simpan cart ke localStorage
function saveCart(cart) {
    localStorage.setItem('kriukKitaCart', JSON.stringify(cart));

    // Update badge setelah cart berubah
    updateCartBadge();
}


// FORMAT DATA (RUPIAH & ANGKA)

// Format angka ke mata uang Rupiah
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format angka biasa (1.000.000)
function formatNumber(number) {
    return new Intl.NumberFormat('id-ID').format(number);
}


// ===============================
// FETCH DATA PRODUK
// ===============================

// Ambil semua produk
async function fetchProducts() {
    try {
        // Cek localStorage dulu (jika ada hasil CRUD)
        const localProducts = localStorage.getItem('kriukKitaProducts');
        if (localProducts) {
            return JSON.parse(localProducts);
        }
        
        // Jika tidak ada, ambil dari file JSON
        const response = await fetch('../data/products.json');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        return data.products;

    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Ambil produk berdasarkan ID
async function fetchProductById(id) {
    const products = await fetchProducts();
    return products.find(p => p.id === id);
}


// ===============================
// SEARCH & SORT PRODUK
// ===============================

// Cari produk berdasarkan keyword
function searchProducts(products, query) {
    const lowerQuery = query.toLowerCase();

    return products.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );
}

// Urutkan produk
function sortProducts(products, sortBy) {
    const sorted = [...products]; // copy array agar data asli tidak berubah
    
    switch (sortBy) {
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name-asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'rating-desc':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'stock-asc':
            return sorted.sort((a, b) => a.stock - b.stock);
        default:
            return sorted;
    }
}


// ===============================
// ANIMASI ELEMENT
// ===============================

// Tambahkan animasi ke elemen
function animateElement(element, animationName) {
    element.style.animation = `${animationName} 0.6s ease-out`;

    // Hapus animasi setelah selesai
    element.addEventListener('animationend', () => {
        element.style.animation = '';
    }, { once: true });
}


// ===============================
// TOAST NOTIFICATION
// ===============================

// Tampilkan notifikasi toast
function showToast(message, type = 'success') {
    // Cari container toast atau buat baru
    const toastContainer =
        document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.role = 'alert';
    toast.style.minWidth = '250px';

    toast.innerHTML = `
        <strong>${type === 'success' ? '✅' : '❌'}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Toast otomatis hilang
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Buat container toast jika belum ada
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.position = 'fixed';
    container.style.top = '100px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';

    document.body.appendChild(container);
    return container;
}


// ===============================
// SCROLL & UTILITAS
// ===============================

// Scroll halus ke elemen tertentu
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Debounce → mencegah fungsi dipanggil terlalu sering
function debounce(func, wait) {
    let timeout;

    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}


// ===============================
// VALIDASI INPUT
// ===============================

// Validasi email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validasi nomor HP Indonesia
function isValidPhone(phone) {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}


// ===============================
// INISIALISASI SAAT HALAMAN DIMUAT
// ===============================

document.addEventListener('DOMContentLoaded', function () {

    // Update badge keranjang
    updateCartBadge();
    
    // Smooth scroll untuk anchor link (#)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();

                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Animasi muncul saat scroll (IntersectionObserver)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe card & category
    document.querySelectorAll('.category-card, .card').forEach(el => {
        observer.observe(el);
    });
});
