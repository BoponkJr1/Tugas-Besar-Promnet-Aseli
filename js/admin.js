// ==========================================
// KRIUK KITA - ADMIN.JS
// Admin panel & CRUD Operations
// ==========================================

// CRUD Functions for Products

/**
 * CREATE - Add new product
 */
function createProduct(productData) {
    try {
        let products = getProducts();
        
        // Generate new ID
        const newId = products.length > 0 
            ? Math.max(...products.map(p => p.id)) + 1 
            : 1;
        
        const newProduct = {
            id: newId,
            ...productData,
            variants: productData.variants || [
                { size: "100g", price: productData.price }
            ]
        };
        
        products.push(newProduct);
        saveProducts(products);
        
        console.log('Product created:', newProduct);
        return { success: true, product: newProduct };
    } catch (error) {
        console.error('Error creating product:', error);
        return { success: false, error: error.message };
    }
}

/**
 * READ - Get all products
 */
function getProducts() {
    const products = localStorage.getItem('kriukKitaProducts');
    return products ? JSON.parse(products) : [];
}

/**
 * READ - Get product by ID
 */
function getProductById(id) {
    const products = getProducts();
    return products.find(p => p.id === id);
}

/**
 * UPDATE - Update existing product
 */
function updateProduct(id, updatedData) {
    try {
        let products = getProducts();
        const index = products.findIndex(p => p.id === id);
        
        if (index === -1) {
            return { success: false, error: 'Product not found' };
        }
        
        // Merge existing data with updates
        products[index] = {
            ...products[index],
            ...updatedData,
            id: id // Preserve ID
        };
        
        saveProducts(products);
        
        console.log('Product updated:', products[index]);
        return { success: true, product: products[index] };
    } catch (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }
}

/**
 * DELETE - Remove product
 */
function deleteProduct(id) {
    try {
        let products = getProducts();
        const initialLength = products.length;
        
        products = products.filter(p => p.id !== id);
        
        if (products.length === initialLength) {
            return { success: false, error: 'Product not found' };
        }
        
        saveProducts(products);
        
        console.log('Product deleted:', id);
        return { success: true, id: id };
    } catch (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Helper function to save products to localStorage
 */
function saveProducts(products) {
    localStorage.setItem('kriukKitaProducts', JSON.stringify(products));
}

/**
 * Initialize products from JSON if localStorage is empty
 */
async function initializeProducts() {
    const localProducts = localStorage.getItem('kriukKitaProducts');
    
    if (!localProducts) {
        try {
            const response = await fetch('../data/products.json');
            const data = await response.json();
            localStorage.setItem('kriukKitaProducts', JSON.stringify(data.products));
            console.log('Products initialized from JSON');
            return data.products;
        } catch (error) {
            console.error('Error initializing products:', error);
            return [];
        }
    }
    
    return JSON.parse(localProducts);
}

/**
 * Search products
 */
function searchProducts(query) {
    const products = getProducts();
    const lowerQuery = query.toLowerCase();
    
    return products.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Filter products by category
 */
function filterProductsByCategory(category) {
    const products = getProducts();
    
    if (category === 'all') {
        return products;
    }
    
    return products.filter(p => p.category === category);
}

/**
 * Sort products
 */
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
        case 'stock-desc':
            return sorted.sort((a, b) => b.stock - a.stock);
        default:
            return sorted;
    }
}

/**
 * Get product statistics
 */
function getProductStats() {
    const products = getProducts();
    
    return {
        total: products.length,
        totalStock: products.reduce((sum, p) => sum + p.stock, 0),
        averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
        averageRating: products.reduce((sum, p) => sum + p.rating, 0) / products.length,
        byCategory: products.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {}),
        lowStock: products.filter(p => p.stock < 20).length,
        featured: products.filter(p => p.featured).length
    };
}

/**
 * Validate product data
 */
function validateProductData(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 3) {
        errors.push('Nama produk minimal 3 karakter');
    }
    
    if (!data.category) {
        errors.push('Kategori harus dipilih');
    }
    
    if (!data.price || data.price < 1000) {
        errors.push('Harga minimal Rp 1.000');
    }
    
    if (!data.stock || data.stock < 0) {
        errors.push('Stok tidak boleh negatif');
    }
    
    if (!data.rating || data.rating < 0 || data.rating > 5) {
        errors.push('Rating harus antara 0-5');
    }
    
    if (!data.image || !data.image.startsWith('http')) {
        errors.push('URL gambar tidak valid');
    }
    
    if (!data.description || data.description.trim().length < 10) {
        errors.push('Deskripsi minimal 10 karakter');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Export products to JSON (for backup)
 */
function exportProducts() {
    const products = getProducts();
    const dataStr = JSON.stringify({ products }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = `kriuk-kita-products-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
}

/**
 * Import products from JSON file
 */
function importProducts(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.products && Array.isArray(data.products)) {
                    localStorage.setItem('kriukKitaProducts', JSON.stringify(data.products));
                    resolve(data.products);
                } else {
                    reject(new Error('Format file tidak valid'));
                }
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Gagal membaca file'));
        };
        
        reader.readAsText(file);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initializeProducts();
});