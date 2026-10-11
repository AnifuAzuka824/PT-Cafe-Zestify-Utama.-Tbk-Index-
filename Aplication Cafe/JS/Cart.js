const CART_KEY = 'zestifyCart';

/** Safely load cart from localStorage. Returns [] on any error. */
function loadCartFromStorage() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            item => item && typeof item.id === 'number' &&
                    typeof item.name === 'string' &&
                    typeof item.price === 'number' &&
                    typeof item.quantity === 'number' &&
                    item.quantity > 0
        );
    } catch {
        return [];
    }
}

/** Persist cart to localStorage. */
function saveCartToStorage(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Add a product to cart. Returns a NEW array (immutable update).
 * @param {Array} cart - current cart
 * @param {Array} products - product catalog
 * @param {number} productId
 */
function addToCart(cart, products, productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return cart;
    const copy = cart.map(item => ({ ...item }));
    const existing = copy.find(item => item.id === productId);
    if (existing) {
        existing.quantity++;
    } else {
        copy.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    return copy;
}

/** Sum all prices × quantities. */
function getCartTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Sum all quantities. */
function getCartCount(cart) {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Show a toast notification at bottom-right.
 * Requires .toast element with id="globalToast" in the page,
 * or creates one if absent.
 * @param {string} message
 * @param {string} [icon] - Font Awesome class e.g. 'fa-check-circle'
 */
function showToast(message, icon) {
    icon = icon || 'fa-check-circle';
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = '<i class="fas ' + icon + '"></i> ' + escapeHtml(message);
    toast.classList.add('show');
    clearTimeout(toast._tid);
    toast._tid = setTimeout(function () { toast.classList.remove('show'); }, 3200);
}

/**
 * Escape HTML special chars to prevent XSS when inserting into innerHTML.
 */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/** Format number as Indonesian Rupiah string, e.g. 50000 → "Rp50.000" */
function formatRupiah(amount) {
    return 'Rp' + amount.toLocaleString('id-ID');
}
