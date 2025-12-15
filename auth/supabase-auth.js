
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
        console.log('Login berhasil:', data);
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
        
        console.log('Logout berhasil');
        
        // REDIRECT KE HOME
        window.location.href = 'home.html'; 
        
    } catch (error) {
        console.error('Logout error:', error);
        alert("Error saat logout: " + error.message);
    }
}