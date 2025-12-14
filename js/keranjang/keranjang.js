  const SHIPPING_COST = 15000;
        let cart = [];
        let checkoutModal;

        // 1. Inisialisasi
        document.addEventListener('DOMContentLoaded', async function () {
            checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));

            // Navbar Logic
            if (typeof checkSession === 'function') {
                try {
                    const session = await checkSession();
                    updateNavbar(session); 
                } catch (e) { console.log("Guest Mode"); }
            }
            
            loadCart();
        });

        // 2. Load Cart
        function loadCart() {
            const savedCart = localStorage.getItem('kriukKitaCart');
            cart = savedCart ? JSON.parse(savedCart) : [];
            cart.forEach(item => { if (typeof item.selected === 'undefined') item.selected = false; });
            renderCart();
            calculateTotal();
        }

        // 3. Render Cart
        function renderCart() {
            const container = document.getElementById('cartItems');
            const emptyEl = document.getElementById('emptyCart');
            const selectAllBox = document.getElementById('selectAll');

            if (cart.length === 0) {
                container.innerHTML = '';
                emptyEl.style.display = 'block';
                if(selectAllBox) { selectAllBox.disabled = true; selectAllBox.checked = false; }
                return;
            }

            emptyEl.style.display = 'none';
            if(selectAllBox) {
                selectAllBox.disabled = false;
                selectAllBox.checked = cart.every(item => item.selected);
            }

            container.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <input class="form-check-input custom-checkbox" type="checkbox" 
                                onchange="toggleItem(${index})" ${item.selected ? 'checked' : ''}>
                        </div>
                        <div class="me-3">
                            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://placehold.co/80'">
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="mb-1 text-truncate" style="max-width: 200px;">${item.name}</h6>
                            <p class="text-orange fw-bold mb-0">Rp ${item.price.toLocaleString('id-ID')}</p>
                        </div>
                        <div class="d-flex align-items-center mx-3">
                            <button class="quantity-btn" onclick="changeQty(${index}, -1)">-</button>
                            <span class="mx-3 fw-bold" style="width: 20px; text-align: center;">${item.quantity}</span>
                            <button class="quantity-btn" onclick="changeQty(${index}, 1)">+</button>
                        </div>
                        <div>
                            <button class="btn btn-sm text-danger" onclick="deleteItem(${index})"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // 4. Kalkulasi Total
        function calculateTotal() {
            const selectedItems = cart.filter(item => item.selected);
            const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const count = selectedItems.reduce((sum, item) => sum + item.quantity, 0); 
            const ongkir = selectedItems.length > 0 ? SHIPPING_COST : 0;
            const total = subtotal + ongkir;

            document.getElementById('selectedCount').innerText = count;
            document.getElementById('subtotal').innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
            document.getElementById('shipping').innerText = `Rp ${ongkir.toLocaleString('id-ID')}`;
            document.getElementById('total').innerText = `Rp ${total.toLocaleString('id-ID')}`;
            document.getElementById('btnCount').innerText = count;

            const btnCheckout = document.getElementById('btnCheckout');
            if(btnCheckout) btnCheckout.disabled = selectedItems.length === 0;
            
            localStorage.setItem('kriukKitaCart', JSON.stringify(cart));
        }

        // 5. Interaksi User
        function toggleItem(index) { cart[index].selected = !cart[index].selected; renderCart(); calculateTotal(); }
        function toggleSelectAll() {
            const isChecked = document.getElementById('selectAll').checked;
            cart.forEach(item => item.selected = isChecked);
            renderCart(); calculateTotal();
        }
        function changeQty(index, change) {
            const newQty = cart[index].quantity + change;
            if (newQty < 1) { deleteItem(index); return; }
            cart[index].quantity = newQty;
            renderCart(); calculateTotal();
        }
        function deleteItem(index) {
            if (confirm(`Hapus ${cart[index].name}?`)) { cart.splice(index, 1); renderCart(); calculateTotal(); }
        }
        function deleteSelected() {
            if (!cart.some(i => i.selected)) return alert("Pilih barang dulu.");
            if (confirm("Hapus barang terpilih?")) { cart = cart.filter(i => !i.selected); renderCart(); calculateTotal(); }
        }

        // ==========================================
        // 6. LOGIKA MODAL CHECKOUT
        // ==========================================

        function openCheckoutModal() {
            const selectedItems = cart.filter(item => item.selected);
            if (selectedItems.length === 0) return;

            // Hitung Ulang untuk Modal
            const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const total = subtotal + SHIPPING_COST;

            // Render List
            const listContainer = document.getElementById('checkoutList');
            listContainer.innerHTML = selectedItems.map(item => `
                <div class="order-summary-item">
                    <div><span class="fw-bold">${item.name}</span> <small class="text-muted">x${item.quantity}</small></div>
                    <div class="fw-bold">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
                </div>
            `).join('');

            // Update Angka
            document.getElementById('modalSubtotal').innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
            document.getElementById('modalShipping').innerText = `Rp ${SHIPPING_COST.toLocaleString('id-ID')}`;
            document.getElementById('modalTotal').innerText = `Rp ${total.toLocaleString('id-ID')}`;

            // Reset View
            document.getElementById('stepSummary').style.display = 'block';
            document.getElementById('stepPayment').style.display = 'none';
            document.getElementById('modalTitle').innerText = 'Konfirmasi Pesanan';
            
            // Kosongkan alamat jika belum ada (opsional)
            // document.getElementById('addressInput').value = '';

            checkoutModal.show();
        }

        function showPayment() {
            // 1. Validasi Alamat
            const address = document.getElementById('addressInput').value.trim();
            if (!address) {
                alert("Mohon isi alamat pengiriman terlebih dahulu!");
                document.getElementById('addressInput').focus();
                return;
            }

            // Ganti Judul
            document.getElementById('modalTitle').innerText = 'Pembayaran';
            
            // Generate QR Random
            const randomRef = 'INV-' + Math.floor(Math.random() * 1000000);
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY-${randomRef}`;
            
            document.getElementById('qrImage').src = qrUrl;
            document.getElementById('qrRef').innerText = `Ref: ${randomRef}`;
            
            // Tampilkan Alamat di halaman Pembayaran
            document.getElementById('displayAddress').innerText = address;

            // Switch View
            document.getElementById('stepSummary').style.display = 'none';
            document.getElementById('stepPayment').style.display = 'block';
        }

        function backToSummary() {
            document.getElementById('stepSummary').style.display = 'block';
            document.getElementById('stepPayment').style.display = 'none';
            document.getElementById('modalTitle').innerText = 'Konfirmasi Pesanan';
        }

        function completeOrder() {
            const btn = event.target;
            const oldText = btn.innerHTML;
            btn.innerHTML = 'Memproses...';
            btn.disabled = true;

            setTimeout(() => {
                // 1. Hapus item yang dibeli
                cart = cart.filter(item => !item.selected);
                
                // 2. Simpan
                localStorage.setItem('kriukKitaCart', JSON.stringify(cart));
                
                // 3. Tutup Modal
                checkoutModal.hide();
                
                // 4. Alert & Refresh
                alert("✅ Pembayaran Berhasil!\nTerima kasih telah berbelanja.");
                renderCart();
                calculateTotal();

                btn.innerHTML = oldText;
                btn.disabled = false;
            }, 1500);
        }

        // 7. Navbar Logic
        function updateNavbar(session) {
            const navbarList = document.getElementById('navbarList');
            if (!navbarList) return;
            if (session) {
                const userName = session.user.user_metadata.full_name || session.user.email.split('@')[0];
                navbarList.innerHTML = `
                    <li class="nav-item"><a class="nav-link" href="produk.html">Lanjut Belanja</a></li>
                    <li class="nav-item"><a class="nav-link active" href="keranjang.html">Keranjang</a></li>
                    <li class="nav-item ms-lg-3 d-flex align-items-center gap-2">
                        <span class="text-muted small">Halo, <b>${userName}</b></span>
                        <button class="btn btn-outline-danger btn-sm" onclick="logout().then(()=>window.location.reload())">Logout</button>
                    </li>
                `;
            } else {
                navbarList.innerHTML = `
                    <li class="nav-item"><a class="nav-link" href="../index.html">Tentang Kami</a></li>
                    <li class="nav-item"><a class="nav-link" href="produk.html">Produk</a></li>
                    <li class="nav-item"><a class="nav-link active" href="keranjang.html">Keranjang</a></li>
                    <li class="nav-item"><a class="nav-link" href="kontak.html">Kontak</a></li>
                    <li class="nav-item ms-lg-3"><a class="btn btn-orange" href="../login.html">Login</a></li>
                `;
            }
        }