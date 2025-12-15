// ==========================================
// FILE: auth/supabase-config.js
// FUNGSI: Konfigurasi Supabase
// ==========================================

// Konfigurasi Supabase
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