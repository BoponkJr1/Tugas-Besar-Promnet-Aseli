// ==========================================
// FILE: js/home.js
// FUNGSI: Logic untuk halaman home.html
// ==========================================

// Event listener yang dipanggil saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', async function() {
    // A. Cek status login dan update navbar
    await updateNavbarBasedOnSession();
    
    // B. Load produk unggulan dari database
    await loadFeaturedProducts();
});


// ==========================================
// FUNGSI 1: UPDATE NAVBAR SESUAI STATUS LOGIN
// Mengubah tampilan navbar berdasarkan apakah user sudah login atau belum
// ==========================================
async function updateNavbarBasedOnSession() {
    try {
        // Cek session menggunakan fungsi dari auth.js
        const session = await checkSession();
        
        // Ambil element navbar list
        const navbarList = document.getElementById('navbarList');
        
        if (session) {
            // === USER SUDAH LOGIN ===
            // Ambil nama dari metadata user, jika tidak ada gunakan email
            const userName = session.user.user_metadata.full_name || 
                           session.user.email.split('@')[0];
            
            // Ubah navbar: tampilkan "Hi [Nama]" dan tombol Logout
            navbarList.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="pages/produk.html">Produk</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="pages/keranjang.html">Keranjang</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="pages/kontak.html">Kontak</a>
                </li>
                <li class="nav-item ms-lg-3 d-flex align-items-center gap-2">
                    <span class="text-muted small">Hi, <b>${userName}</b></span>
                    <button class="btn btn-outline-danger btn-sm" onclick="handleLogout()">
                        Logout
                    </button>
                </li>
            `;
        } else {
            // === USER BELUM LOGIN ===
            // Tampilkan menu normal dengan tombol Login
            navbarList.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link active" href="home.html">Tentang Kami</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="pages/produk.html">Produk</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="pages/keranjang.html">Keranjang</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="pages/kontak.html">Kontak</a>
                </li>
                <li class="nav-item ms-lg-3">
                    <a class="btn btn-orange" href="login.html">Login</a>
                </li>
            `;
        }
    } catch (error) {
        console.error('Error saat cek session:', error);
    }
}


// ==========================================
// FUNGSI 2: HANDLE LOGOUT
// Dipanggil saat user klik tombol Logout
// ==========================================
async function handleLogout() {
    // Konfirmasi dulu sebelum logout
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        // Panggil fungsi logout dari auth.js
        await logout();
    }
}


// ==========================================
// FUNGSI 3: LOAD PRODUK UNGGULAN
// Mengambil 4 produk unggulan dari database dan menampilkannya
// ==========================================
async function loadFeaturedProducts() {
    // Ambil element container
    const container = document.getElementById('featuredProducts');
    const loading = document.getElementById('loadingProducts');

    try {
        // Query ke tabel 'products' di Supabase
        // .select('*') = ambil semua kolom
        // .eq('featured', true) = filter yang featured saja
        // .limit(4) = ambil maksimal 4 produk
        // .order() = urutkan berdasarkan id terbaru
        const { data, error } = await db
            .from('products')
            .select('*')
            .eq('featured', true)
            .limit(4)
            .order('id', { ascending: false });

        // Jika ada error, lempar ke catch block
        if (error) throw error;

        // Sembunyikan loading, tampilkan container
        loading.style.display = 'none';
        container.style.display = 'flex';

        // Jika tidak ada produk
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">Belum ada produk unggulan saat ini.</p>
                </div>
            `;
            return;
        }

        // Render produk ke HTML
        // map() untuk loop setiap produk
        // join('') untuk gabungkan semua HTML jadi satu string
        container.innerHTML = data.map(product => `
            <div class="col-md-6 col-lg-3">
                <div class="product-card h-100">
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         class="product-image" 
                         onerror="this.src='https://placehold.co/400?text=No+Image'">
                    
                    <div class="p-3 d-flex flex-column">
                        <h5 class="product-title text-truncate">${product.name}</h5>
                        
                        <p class="product-price text-orange fw-bold">
                            Rp ${parseInt(product.price).toLocaleString('id-ID')}
                        </p>
                        
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <span class="badge bg-warning text-dark">
                                ⭐ ${product.rating || 5.0}
                            </span>
                            <a href="pages/produk.html" class="btn btn-sm btn-outline-orange">
                                Lihat
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        // Jika terjadi error, tampilkan pesan
        console.error('Error loading products:', error);
        loading.innerHTML = `
            <div class="col-12 text-center text-danger">
                <p>Gagal memuat produk dari server.</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}