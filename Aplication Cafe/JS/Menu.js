const PRODUCTS = [
    {
        id: 1, name: 'Avocado Toast', category: 'food', bestSeller: false,
        price: 50000, originalPrice: 90000,
        desc: 'Ingredients artisan sourdough bread smashed avocado fresh microgreens lemon zest premium olive oil. Taste natural savory crunchy toast with a subtle refreshing acidity from the lemon.',
        image: 'IMAGES/avocado-toast.jpg'
    },
    {
        id: 2, name: 'Pasta Truffle', category: 'food', bestSeller: true,
        price: 80000, originalPrice: 185000,
        desc: 'Ingredients homemade fettuccine Italian black truffle sauce shiitake mushrooms authentic parmesan. The flavor is icredibly savory and creamy, featuring the rich, distinctive aroma of truffle.',
        image: 'https://www.wenthere8this.com/wp-content/uploads/2023/11/black-truffle-pasta-11-1.jpg'
    },
    {
        id: 3, name: 'Matcha Latte', category: 'drink', bestSeller: false,
        price: 45000, originalPrice: 85000,
        desc: 'Ingredients ceremonial grade mathca from Uji Kyoto barista oat milk. Taste smooth earthy authentic green tea mild sweetness soothing flavor.',
        image: 'IMAGES/matcha-latte.jpg'
    },
    {
        id: 4, name: 'Cold Brew', category: 'drink', bestSeller: true,
        price: 45000, originalPrice: 66000,
        desc: 'Igrendients single origin Sumatra Mandheling 24 hour clod drip. Taste refreshing cold with subtle dark chocolate and dried fruit notes without bitterness.',
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop'
    },
    {
        id: 5, name: 'Salmon Croissant', category: 'food', bestSeller: true,
        price: 78000, originalPrice: 115000,
        desc: 'Ingredients flaky croissant premium smoked salmon dill cream cheese capers rocket lettuce. Taste savory salty smoked salmon creamy flaky layered with a touch of fresh herbs.',
        image: 'IMAGES/salmon-croissant.jpg'
    },
    {
        id: 6, name: 'Berry Hibiscus', category: 'drink', bestSeller: false,
        price: 42000, originalPrice: 58000,
        desc: 'Ingredients infused hibiscus flower fresh mixed berries artisan soda raw honey. Taste sweet sour refreshing fizzy caffeine-free invigorating drink.',
        image: 'IMAGES/berry-hibiscus.jpg'
    },
    {
        id: 7, name: 'Beef Wellington Bowl', category: 'food', bestSeller: false,
        price: 150000, originalPrice: 385000,
        desc: 'Ingredients tenderloin steak duxelles mushroom paste puff pastry velvety mashed. Taste tender succulent beef paired with umami mushrooms and a rich savory reduction.',
        image: 'IMAGES/beef-wellington.jpg'
    },
    {
        id: 8, name: 'Fried Rice Truffle', category: 'food', bestSeller: false,
        price: 85000, originalPrice: 95000,
        desc: 'Ingredients traditional village fried rice black truffle oil golden fried egg grilled shrimp.',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop'
    },
    {
        id: 9, name: 'Smashed Avo Burger', category: 'food', bestSeller: true,
        price: 75000, originalPrice: 110000,
        desc: 'Plant-based patty juicy, alpukat smashed lemon, smoked cheese, salsa verde homemade, dan toasted brioche bun.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop'
    },
    {
        id: 10, name: 'Coffe Espresso Latte', category: 'drink', bestSeller: true,
        price: 55000, originalPrice: 80000,
        desc: 'Ingredients double shot espresso iced ceremonial grade matcha specialty oat milk.',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop'
    },
    {
        id: 11, name: 'Iced Lychee Rose', category: 'drink', bestSeller: false,
        price: 48000, originalPrice: 65000,
        desc: 'Ingredients fresh lychee reduction premium rose essence artisan sparkling water infused rosemary. Taste elegant floral perfume coupled eith sweet tropical lychee notes and light effervescence.',
        image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop'
    },
    {
        id: 12, name: 'Churros Ice Cream', category: 'food', bestSeller: false,
        price: 52000, originalPrice: 75000,
        desc: 'Ingredients artisanal fried churros cinnamon sugar vanilla bean gelato Belgian chocolate. The warm, crispy sweetness blends perfectly with the smoothness of the cold ice cream.',
        image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&auto=format&fit=crop'
    }
];

let cart = [];
let activeCategory = 'all';

/* ─── Initialisation ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
    cart = loadCartFromStorage();
    renderCategoryTabs();
    renderMenu('all');
    updateCartSummary();
    initPaymentRedirect();
    initLoginForm();
    initCSForm();
    initSmoothScroll();
    highlightActiveNav();
});

/* ─── Category tabs ──────────────────────────────────────── */
function renderCategoryTabs() {
    var tabsEl = document.getElementById('menu-tabs');
    if (!tabsEl) return;
    tabsEl.innerHTML = '';

    var tabs = [
        { cat: 'all',        icon: 'fa-th',          label: 'Semua Menu' },
        { cat: 'bestseller', icon: 'fa-fire',         label: 'Best Seller' },
        { cat: 'food',       icon: 'fa-utensils',     label: 'Makanan' },
        { cat: 'drink',      icon: 'fa-coffee',       label: 'Minuman' }
    ];

    tabs.forEach(function (t) {
        var btn = document.createElement('button');
        btn.className = 'menu-tab' + (t.cat === activeCategory ? ' active' : '');
        btn.setAttribute('data-cat', t.cat);
        btn.innerHTML = '<i class="fas ' + t.icon + '"></i> ' + t.label;

        if (t.cat === 'bestseller') {
            var bsCount = PRODUCTS.filter(function (p) { return p.bestSeller; }).length;
            btn.innerHTML += ' <span class="tab-count">' + bsCount + '</span>';
        } else if (t.cat === 'food') {
            var foodCount = PRODUCTS.filter(function (p) { return p.category === 'food'; }).length;
            btn.innerHTML += ' <span class="tab-count">' + foodCount + '</span>';
        } else if (t.cat === 'drink') {
            var drinkCount = PRODUCTS.filter(function (p) { return p.category === 'drink'; }).length;
            btn.innerHTML += ' <span class="tab-count">' + drinkCount + '</span>';
        }

        btn.addEventListener('click', function () {
            activeCategory = t.cat;
            tabsEl.querySelectorAll('.menu-tab').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            renderMenu(t.cat);
        });

        tabsEl.appendChild(btn);
    });
}

/* ─── Menu rendering ─────────────────────────────────────── */
function renderMenu(category) {
    var container = document.getElementById('menu-container');
    if (!container) return;
    container.innerHTML = '';

    var filtered = PRODUCTS.filter(function (p) {
        if (category === 'bestseller') return p.bestSeller;
        if (category === 'food')       return p.category === 'food';
        if (category === 'drink')      return p.category === 'drink';
        return true;
    });

    if (filtered.length === 0) {
        var noResult = document.createElement('div');
        noResult.className = 'no-results';
        noResult.innerHTML = '<i class="fas fa-search" style="font-size:2rem;color:#333;display:block;margin-bottom:12px;"></i>Tidak ada menu di kategori ini.';
        container.appendChild(noResult);
        return;
    }

    filtered.forEach(function (prod) {
        var card = buildCard(prod);
        container.appendChild(card);
    });
}

/* ─── Build a single menu card ───────────────────────────── */
function buildCard(prod) {
    var card = document.createElement('div');
    card.className = 'menu-card';

    /* Best Seller badge */
    if (prod.bestSeller) {
        var badge = document.createElement('div');
        badge.className = 'card-badge';
        badge.innerHTML = '<i class="fas fa-fire"></i> Best Seller';
        card.appendChild(badge);
    }

    /* Category chip */
    var catChip = document.createElement('div');
    catChip.className = 'card-cat-chip cat-' + prod.category;
    catChip.textContent = prod.category === 'food' ? 'Makanan' : 'Minuman';

    var img = document.createElement('img');
    img.src = prod.image;
    img.alt = prod.name;
    img.className = 'menu-img';
    img.loading = 'lazy';
    img.onerror = function () {
        this.src = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop';
    };

    var h3 = document.createElement('h3');
    h3.textContent = prod.name;

    var desc = document.createElement('div');
    desc.className = 'menu-desc';
    desc.textContent = prod.desc;

    var priceDiv = document.createElement('div');
    priceDiv.className = 'price';
    var s = document.createElement('s');
    s.textContent = formatRupiah(prod.originalPrice);
    priceDiv.appendChild(s);
    priceDiv.appendChild(document.createTextNode(' ' + formatRupiah(prod.price)));

    var btn = document.createElement('button');
    btn.className = 'btn-add';
    btn.textContent = 'Tambah ke Keranjang';
    btn.setAttribute('data-id', String(prod.id));
    btn.addEventListener('click', function () {
        cart = addToCart(cart, PRODUCTS, prod.id);
        saveCartToStorage(cart);
        updateCartSummary();
        showToast(prod.name + ' ditambahkan ke keranjang', 'fa-shopping-bag');
    });

    card.appendChild(img);
    card.appendChild(catChip);
    card.appendChild(h3);
    card.appendChild(desc);
    card.appendChild(priceDiv);
    card.appendChild(btn);
    return card;
}

/* ─── Cart summary bar ───────────────────────────────────── */
function updateCartSummary() {
    var bar     = document.getElementById('cartSummary');
    var countEl = document.getElementById('cartCount');
    var totalEl = document.getElementById('cartTotalPrice');
    if (!bar) return;

    if (cart.length === 0) {
        bar.style.display = 'none';
        return;
    }
    bar.style.display = 'flex';
    if (countEl) countEl.textContent = getCartCount(cart);
    if (totalEl) totalEl.textContent = formatRupiah(getCartTotal(cart));
}

/* ─── Payment redirect ───────────────────────────────────── */
function initPaymentRedirect() {
    var btn = document.getElementById('goToPaymentBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
        if (cart.length === 0) {
            showToast('Keranjang kosong — tambahkan menu terlebih dahulu.', 'fa-exclamation-circle');
        } else {
            window.location.href = 'Payment zestify.html';
        }
    });
}

/* ─── Login form ─────────────────────────────────────────── */
function initLoginForm() {
    var btn = document.getElementById('loginBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
        var email = (document.getElementById('loginEmail') || {}).value || '';
        var pass  = (document.getElementById('loginPassword') || {}).value || '';
        email = email.trim();
        if (!email || !pass) {
            showToast('Isi email dan password terlebih dahulu.', 'fa-exclamation-circle');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Format email tidak valid.', 'fa-exclamation-circle');
            return;
        }
        if (pass.length < 6) {
            showToast('Password minimal 6 karakter.', 'fa-exclamation-circle');
            return;
        }
        showToast('Selamat datang, ' + email.split('@')[0] + '!', 'fa-user-check');
    });
}

/* ─── CS form ────────────────────────────────────────────── */
function initCSForm() {
    var btn = document.getElementById('sendCsBtn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        var name  = ((document.getElementById('csName')    || {}).value || '').trim();
        var email = ((document.getElementById('csEmail')   || {}).value || '').trim();
        var msg   = ((document.getElementById('csMessage') || {}).value || '').trim();
        if (!name || !email || !msg) {
            showToast('Harap lengkapi semua kolom.', 'fa-exclamation-circle');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Format email tidak valid.', 'fa-exclamation-circle');
            return;
        }
        showToast('Pesan terkirim! CS akan balas ke ' + email.split('@')[0], 'fa-paper-plane');
        document.getElementById('csName').value    = '';
        document.getElementById('csEmail').value   = '';
        document.getElementById('csMessage').value = '';
    });
}

/* ─── Smooth scroll ──────────────────────────────────────── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var hash = this.getAttribute('href');
            if (!hash || hash.length < 2) return;
            var target = document.querySelector(hash);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* ─── Active nav ─────────────────────────────────────────── */
function highlightActiveNav() {
    var path = window.location.pathname.split('/').pop();
    document.querySelectorAll('nav ul li a').forEach(function (a) {
        var href = (a.getAttribute('href') || '').split('/').pop().split('#')[0];
        if (href && href === path) a.classList.add('active');
    });
}
