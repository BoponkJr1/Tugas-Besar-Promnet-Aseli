// ==========================================
// FILE: js/keranjang.js
// FUNGSI: Logic untuk halaman keranjang.html
// ==========================================

const SHIPPING_COST = 15000;
let cart = [];

// Event listener saat halaman dimuat
document.addEventListener('DOMContentLoaded', async function() {
    // 1. Update navbar sesuai status login
    await updateNavbarBasedOnSession();
    
    // 2. Load cart dari localStorage
    loadCart();
});


// ==========================================
// FUNGSI 1: UPDATE NAVBAR SESUAI STATUS LOGIN
// SAMA SEPERTI DI HOME.HTML & PRODUK.HTML
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
                    <a class="nav-link active" href="keranjang.html">Keranjang</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="kontak.html">Kontak</a>
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
                    <a class="nav-link active" href="keranjang.html">Keranjang</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="kontak.html">Kontak</a>
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
// FUNGSI 3: LOAD CART DARI LOCALSTORAGE
// ==========================================
function loadCart() {
    const savedCart = localStorage.getItem('kriukKitaCart');
    cart = savedCart ? JSON.parse(savedCart) : [];
    
    // Set default selected jika belum ada
    cart.forEach(item => {
        if (typeof item.selected === 'undefined') {
            item.selected = false;
        }
    });
    
    renderCart();
    calculateTotal();
}


// ==========================================
// FUNGSI 4: RENDER CART KE HTML
// ==========================================
function renderCart() {
    const container = document.getElementById('cartItems');
    const emptyEl = document.getElementById('emptyCart');
    const selectAllBox = document.getElementById('selectAll');

    if (cart.length === 0) {
        container.innerHTML = '';
        emptyEl.style.display = 'block';
        if(selectAllBox) {
            selectAllBox.disabled = true;
            selectAllBox.checked = false;
        }
        return;
    }

    emptyEl.style.display = 'none';
    if(selectAllBox) {
        selectAllBox.disabled = false;
        selectAllBox.checked = cart.every(item => item.selected);
    }

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item mb-3">
            <div class="d-flex align-items-center">
                <div class="me-3">
                    <input class="form-check-input" type="checkbox" 
                        onchange="toggleItem(${index})" ${item.selected ? 'checked' : ''}>
                </div>
                <div class="me-3">
                    <img src="${item.image}" alt="${item.name}" 
                         class="cart-item-image"
                         onerror="this.src='https://placehold.co/80'">
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.name}</h6>
                    <p class="text-orange fw-bold mb-0">
                        Rp ${item.price.toLocaleString('id-ID')}
                    </p>
                </div>
                <div class="d-flex align-items-center mx-3">
                    <button class="quantity-btn" onclick="changeQty(${index}, -1)">-</button>
                    <span class="mx-3 fw-bold">${item.quantity}</span>
                    <button class="quantity-btn" onclick="changeQty(${index}, 1)">+</button>
                </div>
                <div>
                    <button class="btn btn-sm text-danger" onclick="deleteItem(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}


// ==========================================
// FUNGSI 5: KALKULASI TOTAL
// ==========================================
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


// ==========================================
// FUNGSI 6: TOGGLE ITEM
// ==========================================
function toggleItem(index) {
    cart[index].selected = !cart[index].selected;
    renderCart();
    calculateTotal();
}

function toggleSelectAll() {
    const isChecked = document.getElementById('selectAll').checked;
    cart.forEach(item => item.selected = isChecked);
    renderCart();
    calculateTotal();
}


// ==========================================
// FUNGSI 7: CHANGE QUANTITY
// ==========================================
function changeQty(index, change) {
    const newQty = cart[index].quantity + change;
    if (newQty < 1) {
        deleteItem(index);
        return;
    }
    cart[index].quantity = newQty;
    renderCart();
    calculateTotal();
}


// ==========================================
// FUNGSI 8: DELETE ITEM
// ==========================================
function deleteItem(index) {
    if (confirm(`Hapus ${cart[index].name}?`)) {
        cart.splice(index, 1);
        renderCart();
        calculateTotal();
    }
}

function deleteSelected() {
    if (!cart.some(i => i.selected)) {
        alert('Pilih barang dulu.');
        return;
    }
    if (confirm('Hapus barang terpilih?')) {
        cart = cart.filter(i => !i.selected);
        renderCart();
        calculateTotal();
    }
}