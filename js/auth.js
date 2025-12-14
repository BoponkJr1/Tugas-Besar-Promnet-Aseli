// ==========================================
// FILE: js/auth.js
// FUNGSI: Menangani autentikasi
// ==========================================

// KONFIGURASI SUPABASE
const SUPABASE_URL = 'https://wqmkufqfdeixsvwqxwmm.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbWt1ZnFmZGVpeHN2d3F4d21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTQ4NDQsImV4cCI6MjA4MDY5MDg0NH0.xnFjjAtPmhyVlf19eKrr8mwRc2h5OXMwaplziQ5cc_I';

// Cek library Supabase
if (typeof supabase === 'undefined') {
    console.error('❌ Library Supabase belum dimuat!');
}

// Inisialisasi Supabase Client
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase client berhasil diinisialisasi');


// ==========================================
// FUNGSI 1: REGISTER USER BARU
// ==========================================
async function registerUser(name, email, password) {
    try {
        const { data, error } = await db.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (error) throw error;
        return true;

    } catch (error) {
        console.error('Register error:', error);
        alert("Gagal Daftar: " + error.message);
        return false;
    }
}


// ==========================================
// FUNGSI 2: LOGIN DENGAN EMAIL & PASSWORD
// ==========================================
async function loginWithEmail(email, password) {
    try {
        const { data, error } = await db.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;
        console.log('✅ Login berhasil:', data);
        return true;

    } catch (error) {
        console.error('Login error:', error);
        alert("Gagal Login: " + error.message);
        return false;
    }
}


// ==========================================
// FUNGSI 3: CEK SESSION
// ==========================================
async function checkSession() {
    try {
        const { data: { session } } = await db.auth.getSession();
        return session;
    } catch (error) {
        console.error('Error cek session:', error);
        return null;
    }
}


// ==========================================
// FUNGSI 4: LOGOUT - REDIRECT KE HOME
// ==========================================
async function logout() {
    try {
        const { error } = await db.auth.signOut();
        if (error) throw error;
        
        console.log('✅ Logout berhasil');
        
        // REDIRECT KE HOME.HTML (BUKAN LOGIN.HTML)
        window.location.href = 'home.html'; 
        
    } catch (error) {
        console.error('Logout error:', error);
        alert("Error saat logout: " + error.message);
    }
}