
// FUNGSi Logic untuk halaman kontak.html


// Event listener saat halaman dimuat
document.addEventListener('DOMContentLoaded', async function () {
    console.log(' Kontak.js loaded');

    // 1. Update navbar sesuai status login
    await updateNavbarBasedOnSession();

    // 2. Setup form submit
    setupContactForm();
});


// FUNGSI  UPDATE NAVBAR SESUAI STATUS LOGIN
async function updateNavbarBasedOnSession() {
    try {
        console.log('Checking session...');

        // Cek apakah fungsi checkSession tersedia
        if (typeof checkSession !== 'function') {
            console.warn('checkSession function not available yet, using default navbar');
            renderDefaultNavbar();
            return;
        }

        const session = await checkSession();
        const navbarList = document.getElementById('navbarList');

        if (!navbarList) {
            console.error(' Element navbarList tidak ditemukan!');
            return;
        }

        if (session && session.user) {
            // === USER SUDAH LOGIN ===
            console.log(' User logged in');

            const userName = session.user.user_metadata?.full_name ||
                session.user.email?.split('@')[0] ||
                'User';

            navbarList.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="produk.html">Produk</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="keranjang.html">Keranjang</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link active" href="kontak.html">Kontak</a>
                </li>
                <li class="nav-item ms-lg-3 d-flex align-items-center gap-2">
                    <span class="text-muted small">Hi, <b>${userName}</b></span>
                    <button class="btn btn-outline-danger btn-sm" onclick="handleLogout()">
                        Logout
                    </button>
                </li>
            `;
        } else {
            // USER BELUM LOGIN 
            console.log('ℹ User not logged in');
            renderDefaultNavbar();
        }
    } catch (error) {
        console.error(' Error update navbar:', error);
        renderDefaultNavbar();
    }
}


// FUNGSI HELPER: RENDER DEFAULT NAVBAR
function renderDefaultNavbar() {
    const navbarList = document.getElementById('navbarList');

    if (!navbarList) {
        console.error(' Element navbarList tidak ditemukan!');
        return;
    }

    navbarList.innerHTML = `
        <li class="nav-item">
            <a class="nav-link" href="produk.html">Produk</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="keranjang.html">Keranjang</a>
        </li>
        <li class="nav-item">
            <a class="nav-link active" href="kontak.html">Kontak</a>
        </li>
        <li class="nav-item ms-lg-3">
            <a class="btn btn-orange" href="../login.html">Login</a>
        </li>
    `;

    console.log(' Default navbar rendered');
}


// ==========================================
// FUNGSI 2: HANDLE LOGOUT
// ==========================================
async function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        try {
            if (typeof logout === 'function') {
                await logout(); // Dari auth.js, redirect ke home.html
            } else {
                console.error(' Fungsi logout tidak tersedia!');
                alert('Terjadi kesalahan saat logout');
            }
        } catch (error) {
            console.error(' Error saat logout:', error);
            alert('Terjadi kesalahan saat logout');
        }
    }
}


// ==========================================
// FUNGSI 3: SETUP CONTACT FORM
// ==========================================
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (!contactForm) {
        console.error(' Contact form tidak ditemukan!');
        return;
    }

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Ambil nilai dari form
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // Tampilkan konfirmasi
        const confirmMessage = `
 PESAN TERKIRIM!

Terima kasih, ${name}!

Detail pesan Anda:
━━━━━━━━━━━━━━━━━━━━━
 Subjek: ${subject}
 Email: ${email}
 Telepon: ${phone}

Kami akan menghubungi Anda dalam 1x24 jam.

Terima kasih telah menghubungi Food Court Kita! 
        `.trim();

        alert(confirmMessage);

        // Reset form
        contactForm.reset();
    });
}


// ==========================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ==========================================
window.handleLogout = handleLogout;
window.updateNavbarBasedOnSession = updateNavbarBasedOnSession;