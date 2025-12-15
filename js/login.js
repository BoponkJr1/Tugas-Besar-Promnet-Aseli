        // Cek apakah user sudah login saat halaman dibuka
        document.addEventListener('DOMContentLoaded', async () => {
            if (typeof checkSession === 'function') {
                const session = await checkSession();
                if (session) {
                    window.location.href = '../dashboard.html';
                }
            } else {
                console.error("File auth.js belum dimuat dengan benar!");
            }
        });

        //  HANDLE LOGIN 
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            const btn = document.getElementById('btnLoginSubmit');

            const originalText = btn.innerText;
            btn.innerText = 'Memproses...';
            btn.disabled = true;
            
            const success = await loginWithEmail(email, password);
            
            if (success) {
                alert('Login berhasil!');
                window.location.href = 'dashboard.html';
            } else {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });

        // HANDLE REGISTER 
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('nameRegInput').value;
            const email = document.getElementById('emailRegInput').value;
            const password = document.getElementById('passwordRegInput').value;
            const btn = document.getElementById('btnRegSubmit');
            
            const originalText = btn.innerText;
            btn.innerText = 'Mendaftar...';
            btn.disabled = true;

            const success = await registerUser(name, email, password);

            if (success) {
                alert('Registrasi berhasil! Silakan Login.');
                showLoginForm();
                document.getElementById('registerForm').reset();
            } else {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });

        //  TOGGLE TAMPILAN 
        function showRegisterForm() {
            document.querySelector('.login-card:first-child').style.display = 'none';
            document.getElementById('registerCard').style.display = 'block';
        }

        function showLoginForm() {
            document.querySelector('.login-card:first-child').style.display = 'block';
            document.getElementById('registerCard').style.display = 'none';
        }
