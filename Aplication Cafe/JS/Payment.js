var cart = [];
var pendingReceipt = null;

document.addEventListener('DOMContentLoaded', function () {
    cart = loadCartFromStorage();
    renderPaymentCart();
    document.getElementById('checkoutBtn')?.addEventListener('click', processPayment);
    document.getElementById('printReceiptBtn')?.addEventListener('click', printReceipt);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);

    var overlay = document.getElementById('receiptModal');
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });
    }
    highlightActiveNav();
});

/* ─── Render cart on payment page ───────────────────────── */
function renderPaymentCart() {
    var listEl  = document.getElementById('cart-list');
    var totalEl = document.getElementById('cart-total');
    if (!listEl) return;

    if (cart.length === 0) {
        listEl.innerHTML = '<div class="empty-cart-msg">🛒 Keranjang kosong.<br><a href="Dashboard Zestify.html#menu">Kembali ke Menu?</a></div>';
        if (totalEl) totalEl.style.display = 'none';
        return;
    }

    listEl.innerHTML = '';
    var total = 0;

    cart.forEach(function (item, idx) {
        total += item.price * item.quantity;

        var div = document.createElement('div');
        div.className = 'cart-item';

        /* Info */
        var info = document.createElement('div');
        info.className = 'cart-item-info';
        var nameEl = document.createElement('div');
        nameEl.className = 'cart-item-name';
        nameEl.textContent = item.name;
        var priceEl = document.createElement('div');
        priceEl.className = 'cart-item-price';
        priceEl.textContent = formatRupiah(item.price) + ' \u00d7 ' + item.quantity;
        info.appendChild(nameEl);
        info.appendChild(priceEl);

        /* Qty controls */
        var qtyDiv = document.createElement('div');
        qtyDiv.className = 'cart-qty';

        var minusBtn = makeQtyBtn('\u2212', 'Kurangi', function () {
            if (cart[idx].quantity > 1) cart[idx].quantity--;
            else cart.splice(idx, 1);
            saveCartToStorage(cart);
            renderPaymentCart();
        });

        var qtySpan = document.createElement('span');
        qtySpan.textContent = item.quantity;

        var plusBtn = makeQtyBtn('+', 'Tambah', function () {
            cart[idx].quantity++;
            saveCartToStorage(cart);
            renderPaymentCart();
        });

        var removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item';
        removeBtn.setAttribute('aria-label', 'Hapus ' + item.name);
        removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        removeBtn.addEventListener('click', function () {
            cart.splice(idx, 1);
            saveCartToStorage(cart);
            renderPaymentCart();
        });

        qtyDiv.appendChild(minusBtn);
        qtyDiv.appendChild(qtySpan);
        qtyDiv.appendChild(plusBtn);
        qtyDiv.appendChild(removeBtn);

        div.appendChild(info);
        div.appendChild(qtyDiv);
        listEl.appendChild(div);
    });

    if (totalEl) {
        totalEl.style.display = 'block';
        totalEl.textContent = 'Total: ' + formatRupiah(total);
    }
}

function makeQtyBtn(label, ariaLabel, onClick) {
    var btn = document.createElement('button');
    btn.textContent = label;
    btn.setAttribute('aria-label', ariaLabel);
    btn.addEventListener('click', onClick);
    return btn;
}

/* ─── Process payment ────────────────────────────────────── */
function processPayment() {
    if (cart.length === 0) {
        showToast('Keranjang masih kosong!', 'fa-exclamation-circle');
        return;
    }
    var selected = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selected) {
        showToast('Pilih metode pembayaran terlebih dahulu.', 'fa-exclamation-circle');
        return;
    }

    var METHOD_LABELS = {
        'CASH':         'Tunai (Cash)',
        'QRIS':         'QRIS',
        'DEBIT_BCA':    'Kartu Debit BCA',
        'DEBIT_MANDIRI':'Kartu Debit Mandiri',
        'TRANSFER':     'Transfer Bank'
    };

    pendingReceipt = {
        items:       cart.map(function (i) { return Object.assign({}, i); }),
        total:       getCartTotal(cart),
        method:      METHOD_LABELS[selected.value] || selected.value,
        date:        new Date(),
        orderNumber: 'ZST-' + Date.now().toString().slice(-6)
    };

    /* Clear cart before showing modal */
    cart = [];
    saveCartToStorage(cart);
    renderPaymentCart();

    showReceiptModal(pendingReceipt);
}

/* ─── Receipt modal ──────────────────────────────────────── */
function showReceiptModal(data) {
    var modal = document.getElementById('receiptModal');
    if (!modal) return;

    var dateStr = data.date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    var timeStr = data.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    var itemRows = data.items.map(function (item) {
        return '<div class="receipt-item">' +
               '<span class="receipt-item-name">' + escapeHtml(item.name) + '</span>' +
               '<span class="receipt-item-qty">x' + item.quantity + '</span>' +
               '<span class="receipt-item-price">' + formatRupiah(item.price * item.quantity) + '</span>' +
               '</div>';
    }).join('');

    var content = document.getElementById('receiptContent');
    if (content) {
        content.innerHTML =
            '<div class="receipt-header">' +
                '<div class="receipt-logo">ZESTIFY CAF\u00c9</div>' +
                '<div class="receipt-tagline">PREMIUM COFFEE &amp; FINE DINING</div>' +
                '<p class="receipt-meta">Jl. Sudirman No. 88, Jakarta</p>' +
                '<p class="receipt-meta">Tel: +62 812-354-450-15</p>' +
            '</div>' +
            '<p class="receipt-meta">No. Order : ' + escapeHtml(data.orderNumber) + '</p>' +
            '<p class="receipt-meta">Tanggal  : ' + dateStr + '</p>' +
            '<p class="receipt-meta">Waktu    : ' + timeStr + ' WIB</p>' +
            '<div class="receipt-items" style="margin-top:10px;">' + itemRows + '</div>' +
            '<div class="receipt-total"><span>TOTAL</span><span>' + formatRupiah(data.total) + '</span></div>' +
            '<p class="receipt-method">Metode  : ' + escapeHtml(data.method) + '</p>' +
            '<div class="receipt-footer">' +
                '<p>Terima kasih telah berbelanja!</p>' +
                '<p>Selamat menikmati \u2728</p>' +
                '<p style="margin-top:8px;font-size:0.68rem;">Simpan struk ini sebagai bukti transaksi.</p>' +
            '</div>';
    }

    modal.classList.add('show');
}

function closeModal() {
    var modal = document.getElementById('receiptModal');
    if (modal) modal.classList.remove('show');
    setTimeout(function () {
        window.location.href = 'Dashboard Zestify.html';
    }, 500);
}

function printReceipt() {
    window.print();
}

/* ─── Highlight active nav ───────────────────────────────── */
function highlightActiveNav() {
    var path = window.location.pathname.split('/').pop();
    document.querySelectorAll('nav ul li a').forEach(function (a) {
        var href = (a.getAttribute('href') || '').split('/').pop().split('#')[0];
        if (href && href === path) a.classList.add('active');
    });
}
