
// Fungsi Logic untuk halaman produk.html


let allProducts = [];

// Event listener saat halaman dimuat
document.addEventListener('DOMContentLoaded', async function () {
    // Update navbar sesuai status login
    await updateNavbarBasedOnSession();

    // Load semua produk
    await fetchAllProducts();
});

// FUNGSI UPDATE NAVBAR
async function updateNavbarBasedOnSession() {
    try {
        const session = await checkSession();
        const navbarList = document.getElementById('navbarList');

        if (session) {
            // KEtika user sudah login
            const userName = session.user.user_metadata.full_name ||
                session.user.email.split('@')[0];

            navbarList.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link active" href="produk.html">Produk</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="keranjang.html">Keranjang</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="kontak.html">Kontak</a>
                </li>
                <li class="nav-item ms-lg-3 d-flex align-items-center gap-2">
                    <span class="text-muted small">Hi, <b>${userName}</b></span>
                    <button class="btn btn-outline-danger btn-sm" onclick="handleLogout()">
                        Logout
                    </button>
                </li>
            `;
        } else {
            // Ketika user belum login
            navbarList.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link active" href="produk.html">Produk</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="keranjang.html">Keranjang</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="kontak.html">Kontak</a>
                </li>
                <li class="nav-item ms-lg-3">
                    <a class="btn btn-orange" href="../login.html">Login</a>
                </li>
            `;
        }
    } catch (error) {
        console.error('Error update navbar:', error);
    }
}


// Fungsi hanlde log out
async function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        await logout();
    }
}


// Fungsi fetch semua produk di database
async function fetchAllProducts() {
    const loading = document.getElementById('loadingIndicator');
    const grid = document.getElementById('productsGrid');

    try {
        // Query ke database
        const { data, error } = await db
            .from('products')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        // Simpan ke variabel global
        allProducts = data;

        // Render produk
        renderProducts(allProducts);

    } catch (err) {
        console.error('Error fetch products:', err);
        grid.innerHTML = `
            <div class="col-12 text-center text-danger">
                Gagal memuat produk: ${err.message}
            </div>
        `;
    } finally {
        loading.style.display = 'none';
        grid.style.display = 'flex';
    }
}


// RENDER PRODUK ke file html
function renderProducts(productsToRender) {
    const grid = document.getElementById('productsGrid');
    const empty = document.getElementById('noProducts');

    if (productsToRender.length === 0) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    grid.style.display = 'flex';

    grid.innerHTML = productsToRender.map(product => `
        <div class="col-md-6 col-lg-3">
            <div class="product-card h-100">
                <img src="${product.image}" 
                     class="product-image" 
                     alt="${product.name}"
                     onerror="this.src='https://placehold.co/400?text=No+Image'">
                
                <div class="p-3 d-flex flex-column">
                    <h5 class="product-title text-truncate" title="${product.name}">
                        ${product.name}
                    </h5>
                    <p class="product-desc text-muted small" style="min-height: 40px;">
                        ${product.description ? product.description.substring(0, 50) + '...' : ''}
                    </p>
                    
                    <div class="mt-auto">
                        <h5 class="product-price mb-3">
                            Rp ${parseInt(product.price).toLocaleString('id-ID')}
                        </h5>
                        <button class="btn btn-orange w-100" onclick="addToCart(${product.id})">
                            <i class="bi bi-cart-plus"></i> Tambah ke Keranjang
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}


// FUNGSI FILTER PRODUK BY KATEGORI
function filterProducts(category, btnElement) {
    // Update tombol active
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    btnElement.classList.add('active');

    // Filter data
    if (category === 'all') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProducts(filtered);
    }
}



// FUNGSI ADD TO CART
function addToCart(id) {
    // Cari produk
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    // Ambil cart dari localStorage
    let cart = JSON.parse(localStorage.getItem('kriukKitaCart') || '[]');

    // Cek apakah sudah ada di cart
    const existingIndex = cart.findIndex(item => item.id === id);

    if (existingIndex > -1) {
        // Sudah ada, tambah quantity
        cart[existingIndex].quantity += 1;
        cart[existingIndex].selected = true;
    } else {
        // Belum ada, push baru
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock,
            description: product.description,
            quantity: 1,
            selected: true
        });
    }

    // Simpan kembali
    localStorage.setItem('kriukKitaCart', JSON.stringify(cart));

    // Alert feedback
    alert(`"${product.name}" berhasil ditambahkan ke keranjang!`);
}