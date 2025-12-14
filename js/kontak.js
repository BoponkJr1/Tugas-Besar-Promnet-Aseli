// ==========================================
// FILE: js/kontak.js
// FUNGSI: Logic untuk halaman kontak.html
// ==========================================

// Event listener saat halaman dimuat
document.addEventListener('DOMContentLoaded', async function() {
    // 1. Update navbar sesuai status login
    await updateNavbarBasedOnSession();
    
    // 2. Setup form submit
    setupContactForm();
});


// ==========================================
// FUNGSI 1: UPDATE NAVBAR SESUAI STATUS LOGIN
// SAMA SEPERTI DI HOME, PRODUK, KERANJANG
// ==========================================
async function updateNavbarBasedOnSession() {
    try {
        const session = await checkSession();
        const navbarList = document.getElementById('navbarList');
        
        if (session) {
            // === USER SUDAH LOGIN ===
            const userName = session.user.user_metadata.full_name || 
                           session.user.email.split('@')[0];
            
            navbarList.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="../home.html">Home</a>
                </li>
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
            // === USER BELUM LOGIN ===
            navbarList.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="../home.html">Home</a>
                </li>
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
        }
    } catch (error) {
        console.error('Error update navbar:', error);
    }
}


// ==========================================
// FUNGSI 2: HANDLE LOGOUT
// ==========================================
async function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        await logout(); // Dari auth.js, redirect ke home.html
    }
}


// ==========================================
// FUNGSI 3: SETUP CONTACT FORM
// ==========================================
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ambil nilai dari form
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // Tampilkan konfirmasi
        const confirmMessage = `
📧 PESAN TERKIRIM!

Terima kasih, ${name}!

Detail pesan Anda:
━━━━━━━━━━━━━━━━━━━━━
📝 Subjek: ${subject}
📧 Email: ${email}
📱 Telepon: ${phone}

Kami akan menghubungi Anda dalam 1x24 jam.

Terima kasih telah menghubungi Kriuk Kita! 🔥
        `.trim();

        alert(confirmMessage);
        
        // Reset form
        contactForm.reset();
    });
}