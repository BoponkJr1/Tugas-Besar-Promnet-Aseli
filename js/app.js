// ==========================================
// KRIUK KITA - APP.JS (GLOBAL)
// Main application logic & Utilities
// ==========================================

// Update cart badge in navbar
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('kriukKitaCart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Find or create cart badge
    const cartLinks = document.querySelectorAll('a[href*="keranjang"]');
    cartLinks.forEach(link => {
        // Remove existing badge if any
        const existingBadge = link.querySelector('.cart-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Add new badge if items > 0
        if (totalItems > 0) {
            const badge = document.createElement('span');
            badge.className = 'badge bg-danger rounded-pill ms-1';
            badge.textContent = totalItems;
            badge.style.fontSize = '0.7rem';
            link.appendChild(badge);
        }
    });
}

// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('kriukKitaCart') || '[]');
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('kriukKitaCart', JSON.stringify(cart));
    updateCartBadge();
}

// Format currency to IDR
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format number
function formatNumber(number) {
    return new Intl.NumberFormat('id-ID').format(number);
}

// Fetch products from JSON
async function fetchProducts() {
    try {
        // Check localStorage first (for CRUD updates)
        const localProducts = localStorage.getItem('kriukKitaProducts');
        if (localProducts) {
            return JSON.parse(localProducts);
        }
        
        // Fetch from JSON file
        const response = await fetch('../data/products.json');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        return data.products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Fetch product by ID
async function fetchProductById(id) {
    const products = await fetchProducts();
    return products.find(p => p.id === id);
}

// Search products
function searchProducts(products, query) {
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );
}

// Sort products
function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch(sortBy) {
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name-asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'rating-desc':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'stock-asc':
            return sorted.sort((a, b) => a.stock - b.stock);
        default:
            return sorted;
    }
}

// Add animation to elements
function animateElement(element, animationName) {
    element.style.animation = `${animationName} 0.6s ease-out`;
    element.addEventListener('animationend', () => {
        element.style.animation = '';
    }, { once: true });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.role = 'alert';
    toast.style.minWidth = '250px';
    toast.innerHTML = `
        <strong>${type === 'success' ? '✅' : '❌'}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Create toast container if not exists
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.position = 'fixed';
    container.style.top = '100px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    document.body.appendChild(container);
    return container;
}

// Smooth scroll to element
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number (Indonesian)
function isValidPhone(phone) {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    // Update cart badge
    updateCartBadge();
    
    // Add smooth scroll behavior for hash links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Animate elements on scroll (optional)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.category-card, .card').forEach(el => {
        observer.observe(el);
    });
});