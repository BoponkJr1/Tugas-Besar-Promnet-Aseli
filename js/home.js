// ==========================================
// FILE: js/home.js
// FUNGSI: Logic untuk halaman home.html
// ==========================================

// Event listener yang dipanggil saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🏠 Home.js loaded');
    
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
        console.log('🔍 Checking session...');
        
        // Cek apakah fungsi checkSession tersedia
        if (typeof checkSession !== 'function') {
            console.warn('⚠️ checkSession function not available yet, using default navbar');
            renderDefaultNavbar();
            return;
        }
        
        // Cek session menggunakan fungsi dari auth.js
        const session = await checkSession();
        
        console.log('Session result:', session);
        
        // Ambil element navbar list
        const navbarList = document.getElementById('navbarList');
        
        if (!navbarList) {
            console.error('❌ Element navbarList tidak ditemukan!');
            return;
        }
        
        if (session && session.user) {
            // === USER SUDAH LOGIN ===
            console.log('✅ User logged in:', session.user.email);
            
            // Ambil nama dari metadata user, jika tidak ada gunakan email
            const userName = session.user.user_metadata?.full_name || 
                           session.user.email?.split('@')[0] || 
                           'User';
            
            // Ubah navbar: Dashboard di posisi kanan (sebelum user info)
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
                <li class="nav-item ms-lg-2">
                    <a class="nav-link" href="dashboard.html">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </a>
                </li>
                <li class="nav-item ms-lg-2 d-flex align-items-center gap-2">
                    <span class="text-muted small">Hi, <b>${userName}</b></span>
                    <button class="btn btn-outline-danger btn-sm" onclick="handleLogout()">
                        Logout
                    </button>
                </li>
            `;
        } else {
            // === USER BELUM LOGIN ===
            console.log('ℹ️ User not logged in, showing default navbar');
            renderDefaultNavbar();
        }
    } catch (error) {
        console.error('❌ Error saat cek session:', error);
        // Jika error, tampilkan navbar default
        renderDefaultNavbar();
    }
}


// ==========================================
// FUNGSI HELPER: RENDER DEFAULT NAVBAR
// ==========================================
function renderDefaultNavbar() {
    const navbarList = document.getElementById('navbarList');
    
    if (!navbarList) {
        console.error('❌ Element navbarList tidak ditemukan!');
        return;
    }
    
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
    
    console.log('✅ Default navbar rendered');
}


// ==========================================
// FUNGSI 2: HANDLE LOGOUT
// Dipanggil saat user klik tombol Logout
// ==========================================
async function handleLogout() {
    // Konfirmasi dulu sebelum logout
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        try {
            // Cek apakah fungsi logout tersedia
            if (typeof logout === 'function') {
                // Panggil fungsi logout dari auth.js
                await logout();
            } else {
                console.error('Fungsi logout tidak tersedia!');
                alert('Terjadi kesalahan saat logout');
            }
        } catch (error) {
            console.error('Error saat logout:', error);
            alert('Terjadi kesalahan saat logout');
        }
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
        // Cek apakah db (Supabase client) tersedia
        if (typeof db === 'undefined') {
            throw new Error('Database client belum tersedia');
        }

        // Query ke tabel 'products' di Supabase
        const { data, error } = await db
            .from('products')
            .select('*')
            .eq('featured', true)
            .limit(4)
            .order('id', { ascending: false });

        // Jika ada error, lempar ke catch block
        if (error) throw error;

        // Sembunyikan loading, tampilkan container
        if (loading) loading.style.display = 'none';
        if (container) container.style.display = 'flex';

        // Jika tidak ada produk
        if (!data || data.length === 0) {
            if (container) {
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <p class="text-muted">Belum ada produk unggulan saat ini.</p>
                    </div>
                `;
            }
            return;
        }

        // Render produk ke HTML
        if (container) {
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
        }

    } catch (error) {
        // Jika terjadi error, tampilkan pesan
        console.error('Error loading products:', error);
        if (loading) {
            loading.innerHTML = `
                <div class="col-12 text-center text-danger">
                    <p>Gagal memuat produk dari server.</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
}


// ==========================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ==========================================
window.handleLogout = handleLogout;
window.updateNavbarBasedOnSession = updateNavbarBasedOnSession;