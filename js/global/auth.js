// ==========================================
// KRIUK KITA - AUTHENTICATION
// File ini menangani koneksi ke Supabase
// ==========================================

// --- 1. KONFIGURASI SUPABASE ---
// Ganti kedua variabel ini dengan milik Anda dari Dashboard Supabase
const SUPABASE_URL = 'https://wqmkufqfdeixsvwqxwmm.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbWt1ZnFmZGVpeHN2d3F4d21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTQ4NDQsImV4cCI6MjA4MDY5MDg0NH0.xnFjjAtPmhyVlf19eKrr8mwRc2h5OXMwaplziQ5cc_I'; // Masukkan ANON KEY (bukan service_role)

// Cek apakah library Supabase sudah dimuat di HTML
if (typeof supabase === 'undefined') {
    console.error('CRITICAL ERROR: Supabase script belum dimuat di HTML head!');
}

// Inisialisasi Client Supabase
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);


// --- 2. FUNGSI LOGIN & REGISTER ---

/**
 * Fungsi Mendaftar Akun Baru (Email & Password)
 */
async function registerUser(name, email, password) {
    try {
        const { data, error } = await db.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name, // Simpan nama lengkap ke metadata user
                }
            }
        });

        if (error) throw error;
        return true; // Berhasil

    } catch (error) {
        alert("Gagal Daftar: " + error.message);
        return false;
    }
}

/**
 * Fungsi Login dengan Email & Password
 */
async function loginWithEmail(email, password) {
    try {
        const { data, error } = await db.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;
        return true; // Berhasil login

    } catch (error) {
        alert("Gagal Login: " + error.message);
        return false;
    }
}

/**
 * Fungsi Login dengan Google
 * Syarat: Google Auth harus sudah aktif di Dashboard Supabase
 */
async function loginWithGoogle() {
    try {
        const { data, error } = await db.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Redirect kembali ke halaman index setelah login Google sukses
                redirectTo: window.location.origin + '/index.html' 
            }
        });

        if (error) throw error;
        return true;

    } catch (error) {
        alert("Gagal Google Login: " + error.message);
        return false;
    }
}


// --- 3. FUNGSI SESSION (PENTING UNTUK INDEX.HTML) ---

/**
 * Cek apakah user sedang login saat ini
 * Digunakan di index.html untuk mengubah tombol Login jadi Logout
 */
async function checkSession() {
    const { data: { session } } = await db.auth.getSession();
    return session;
}

/**
 * Fungsi Logout
 */
async function logout() {
    try {
        const { error } = await db.auth.signOut();
        if (error) throw error;
        
        // Redirect ke login atau reload halaman
        window.location.href = 'login.html'; 
        
    } catch (error) {
        alert("Error saat logout: " + error.message);
    }
}