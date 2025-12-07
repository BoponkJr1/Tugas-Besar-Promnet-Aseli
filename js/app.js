// ==========================================
// KRIUK KITA - APP.JS
// Main application logic & Asynchronous operations
// ==========================================

// Update cart badge in navbar
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('kriukKitaCart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update badge if it exists
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
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

// Fetch products from JSON
async function fetchProducts() {
    try {
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
        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating);
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

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    notification.style.zIndex = '9999';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
    
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});