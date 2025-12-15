// ==========================================
// FILE: script/dashboard.js
// FUNGSI: Logic untuk halaman dashboard.html
// ==========================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('📊 Dashboard.js loaded');
    
    // 1. Double-check authentication
    await verifyAccess();
});

// ==========================================
// FUNGSI: VERIFY ACCESS (Double Protection)
// ==========================================
async function verifyAccess() {
    try {
        console.log('🔍 Verifying access...');
        
        // Cek apakah fungsi checkSession tersedia
        if (typeof checkSession !== 'function') {
            console.error('❌ checkSession function not available!');
            redirectToLogin();
            return;
        }
        
        // Cek session
        const session = await checkSession();
        
        if (!session || !session.user) {
            // Belum login, redirect ke login
            console.warn('⚠️ User not logged in, redirecting to login...');
            redirectToLogin();
            return;
        }
        
        // User sudah login
        console.log('✅ User authenticated:', session.user.email);
        
        // Update welcome message jika ada
        updateWelcomeMessage(session.user);
        
    } catch (error) {
        console.error('❌ Error verifying access:', error);
        redirectToLogin();
    }
}

// ==========================================
// FUNGSI: UPDATE WELCOME MESSAGE
// ==========================================
function updateWelcomeMessage(user) {
    const welcomeMsg = document.getElementById('welcomeMsg');
    
    if (welcomeMsg) {
        const userName = user.user_metadata?.full_name || 
                       user.email?.split('@')[0] || 
                       'Admin';
        welcomeMsg.textContent = `Selamat datang, ${userName}.`;
    }
}

function redirectToLogin() {
    console.log('➡️ Redirecting to login page...');
    
    // Tambah timeout kecil agar console log bisa terbaca
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 100);
}

window.verifyAccess = verifyAccess;