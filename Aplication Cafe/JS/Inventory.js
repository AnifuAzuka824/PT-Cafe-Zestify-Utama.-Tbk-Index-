const INV_KEY  = 'zestifyInventory';
const LOG_KEY  = 'zestifyStockLog';

const ITEM_NAMES = [
    'Avocado Toast', 'Pasta Truffle', 'Matcha Latte', 'Cold Brew',
    'Salmon Croissant', 'Berry Hibiscus', 'Beef Wellington Bowl',
    'Fried Rice Truffle', 'Smashed Avo Burger', 'Kyoto Dirty Matcha',
    'Iced Lychee Rose', 'Churros Ice Cream'
];

const MONTH_LABELS = (function () {
    var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
    var now = new Date();
    var result = [];
    for (var i = 5; i >= 0; i--) {
        var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        result.push(months[d.getMonth()] + " '" + d.getFullYear().toString().slice(2));
    }
    return result;
})();

const REVENUE_DATA   = [8400000, 9200000, 7800000, 10500000, 11200000, 9800000];
const STOCK_IN_DATA  = [320, 280, 310, 400, 380, 350];
const STOCK_OUT_DATA = [295, 260, 300, 385, 360, 330];

function getDefaultInventory() {
    return ITEM_NAMES.map(function (name, i) {
        return { id: i + 1, name: name, stock: 40 + (i * 7 % 60), unit: 'Porsi' };
    });
}

function loadInventory() {
    try {
        var raw = localStorage.getItem(INV_KEY);
        if (!raw) return getDefaultInventory();
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : getDefaultInventory();
    } catch (e) { return getDefaultInventory(); }
}

function saveInventory(inv) { localStorage.setItem(INV_KEY, JSON.stringify(inv)); }

function loadLog() {
    try {
        var raw = localStorage.getItem(LOG_KEY);
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
}

function saveLog(log) { localStorage.setItem(LOG_KEY, JSON.stringify(log)); }

/* ─── Initialisation ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
    populateItemSelects();
    refreshAll();
    initChart();
    initForms();
    highlightActiveNav();
});

/* ─── Real-time sync across browser tabs ────────────────── */
window.addEventListener('storage', function (e) {
    if (e.key === INV_KEY || e.key === LOG_KEY) refreshAll();
});

function refreshAll() {
    renderStats();
    renderStockOverview();
    renderTable((document.getElementById('tableSearch') || {}).value || '');
}

/* ─── Populate item dropdowns ────────────────────────────── */
function populateItemSelects() {
    ['receiptItem', 'issueItem'].forEach(function (id) {
        var sel = document.getElementById(id);
        if (!sel) return;
        sel.innerHTML = '<option value="">— Pilih Nama Barang —</option>';
        ITEM_NAMES.forEach(function (name, i) {
            var opt = document.createElement('option');
            opt.value = String(i + 1);
            opt.textContent = name;
            sel.appendChild(opt);
        });
    });
}

/* ─── Stats cards ────────────────────────────────────────── */
function renderStats() {
    var inv = loadInventory();
    var log = loadLog();
    var totalIn    = log.filter(function (l) { return l.type === 'in'; }).reduce(function (s, l) { return s + l.qty; }, 0);
    var totalOut   = log.filter(function (l) { return l.type === 'out'; }).reduce(function (s, l) { return s + l.qty; }, 0);
    var totalStock = inv.reduce(function (s, i) { return s + i.stock; }, 0);
    var todayTxn   = log.filter(function (l) { return new Date(l.timestamp).toDateString() === new Date().toDateString(); }).length;
    setText('statIn',    totalIn    + ' Porsi');
    setText('statOut',   totalOut   + ' Porsi');
    setText('statStock', totalStock + ' Porsi');
    setText('statToday', todayTxn   + ' Transaksi');
}

function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ─── Stock overview mini-cards ──────────────────────────── */
function renderStockOverview() {
    var body = document.getElementById('stockOverviewBody');
    if (!body) return;
    var inv = loadInventory();
    body.innerHTML = '';
    inv.forEach(function (item) {
        var div    = document.createElement('div');
        div.className = 'stock-mini-card';
        var nameEl = document.createElement('div');
        nameEl.className = 'stock-mini-name';
        nameEl.textContent = item.name;
        var qtyEl  = document.createElement('div');
        qtyEl.className = 'stock-mini-qty' + (item.stock < 10 ? ' critical' : item.stock < 20 ? ' low' : '');
        qtyEl.textContent = item.stock + ' ' + item.unit;
        div.appendChild(nameEl);
        div.appendChild(qtyEl);
        body.appendChild(div);
    });
}

/* ─── Chart (Chart.js) ───────────────────────────────────── */
var trafficChart = null;

function initChart() {
    var canvas = document.getElementById('trafficChart');
    if (!canvas) return;
    if (typeof Chart === 'undefined') {
        canvas.parentElement.innerHTML = '<p style="text-align:center;color:#555;padding:48px 20px;"><i class="fas fa-wifi" style="font-size:2rem;display:block;margin-bottom:12px;color:#333;"></i>Chart.js memerlukan koneksi internet. Sambungkan jaringan dan muat ulang halaman.</p>';
        return;
    }
    Chart.defaults.color = '#888';
    Chart.defaults.font.family = "'Inter', sans-serif";
    trafficChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: MONTH_LABELS,
            datasets: [
                { label: 'Pendapatan (Rp)', data: REVENUE_DATA, backgroundColor: 'rgba(212,175,55,0.72)', borderColor: '#D4AF37', borderWidth: 1, borderRadius: 6, yAxisID: 'yRevenue' },
                { label: 'Penerimaan Barang', data: STOCK_IN_DATA, type: 'line', borderColor: '#27ae60', backgroundColor: 'rgba(39,174,96,0.1)', borderWidth: 2, pointBackgroundColor: '#27ae60', pointRadius: 4, tension: 0.4, fill: true, yAxisID: 'yStock' },
                { label: 'Pengeluaran Barang', data: STOCK_OUT_DATA, type: 'line', borderColor: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.07)', borderWidth: 2, pointBackgroundColor: '#e74c3c', pointRadius: 4, tension: 0.4, fill: true, yAxisID: 'yStock' }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', borderWidth: 1, padding: 12,
                    callbacks: {
                        label: function (ctx) {
                            if (ctx.datasetIndex === 0) return '  Pendapatan: Rp' + ctx.raw.toLocaleString('id-ID');
                            return '  ' + ctx.dataset.label + ': ' + ctx.raw + ' porsi';
                        }
                    }
                }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#666' } },
                yRevenue: { position: 'left', grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#D4AF37', callback: function (v) { return 'Rp' + (v / 1000000).toFixed(1) + 'jt'; } } },
                yStock: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#666', callback: function (v) { return v + ' prs'; } } }
            }
        }
    });
}

/* ─── History Stock table ────────────────────────────────── */
function renderTable(query) {
    var tbody = document.getElementById('logTableBody');
    if (!tbody) return;
    var log = loadLog();
    if (query && query.trim()) {
        var q = query.trim().toLowerCase();
        log = log.filter(function (l) {
            return l.itemName.toLowerCase().indexOf(q) !== -1 ||
                   l.operator.toLowerCase().indexOf(q) !== -1;
        });
    }
    if (log.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#555;padding:40px 20px;"><i class="fas fa-inbox" style="font-size:1.8rem;display:block;margin-bottom:10px;color:#333;"></i>Belum ada riwayat transaksi stok.</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    log.slice().reverse().slice(0, 100).forEach(function (entry) {
        var badge = entry.type === 'in'
            ? '<span class="badge badge-in">Penerimaan</span>'
            : '<span class="badge badge-out">Pengeluaran</span>';
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td style="color:#aaa;font-size:0.82rem;">' + escapeHtml(entry.dateLabel || entry.date || '') + '</td>' +
            '<td style="color:#eee;font-weight:500;">'   + escapeHtml(entry.itemName || entry.name || '') + '</td>' +
            '<td>' + badge + '</td>' +
            '<td style="font-weight:600;">' + entry.qty + ' Porsi</td>' +
            '<td style="color:#aaa;">'      + escapeHtml(entry.operator) + '</td>' +
            '<td style="color:#777;font-size:0.82rem;">' + escapeHtml(entry.note || '\u2014') + '</td>';
        tbody.appendChild(tr);
    });
}

/* ─── Form handlers ──────────────────────────────────────── */
function initForms() {
    var rb = document.getElementById('btnReceipt');
    var ib = document.getElementById('btnIssue');
    if (rb) rb.addEventListener('click', function () { handleForm('in'); });
    if (ib) ib.addEventListener('click', function () { handleForm('out'); });
    var se = document.getElementById('tableSearch');
    if (se) se.addEventListener('input', function () { renderTable(this.value); });
}

function handleForm(type) {
    var pfx     = type === 'in' ? 'receipt' : 'issue';
    var itemSel = document.getElementById(pfx + 'Item');
    var qtyEl   = document.getElementById(pfx + 'Qty');
    var opEl    = document.getElementById(pfx + 'Operator');
    var noteEl  = document.getElementById(pfx + 'Note');

    var itemId   = itemSel ? parseInt(itemSel.value) : 0;
    var qty      = qtyEl   ? parseInt(qtyEl.value)   : 0;
    var operator = ((opEl  ? opEl.value.trim() : '') || 'Admin');
    var note     = noteEl  ? noteEl.value.trim()     : '';

    if (!itemId || isNaN(itemId)) { showToast('Pilih nama barang terlebih dahulu.', 'fa-exclamation-circle'); return; }
    if (!qty    || qty < 1)       { showToast('Kuantitas harus minimal 1.',          'fa-exclamation-circle'); return; }

    var inv  = loadInventory();
    var item = inv.find(function (i) { return i.id === itemId; });
    if (!item) return;

    if (type === 'out' && item.stock < qty) {
        showToast('Stok ' + item.name + ' tidak mencukupi. Tersedia: ' + item.stock + ' porsi.', 'fa-exclamation-triangle');
        return;
    }

    if (type === 'in') item.stock += qty;
    else               item.stock -= qty;
    saveInventory(inv);

    var now = new Date();
    var log = loadLog();
    log.push({
        timestamp: now.getTime(),
        dateLabel: now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        itemName: item.name, type: type, qty: qty, operator: operator, note: note
    });
    saveLog(log);
    refreshAll();

    showToast(
        qty + ' porsi ' + item.name + (type === 'in' ? ' berhasil diterima.' : ' berhasil dicatat keluar.'),
        type === 'in' ? 'fa-check-circle' : 'fa-minus-circle'
    );

    if (itemSel) itemSel.selectedIndex = 0;
    if (qtyEl)   qtyEl.value  = '';
    if (noteEl)  noteEl.value = '';
}

/* ─── Active nav ─────────────────────────────────────────── */
function highlightActiveNav() {
    var path = window.location.pathname.split('/').pop();
    document.querySelectorAll('nav ul li a').forEach(function (a) {
        var href = (a.getAttribute('href') || '').split('/').pop().split('#')[0];
        if (href && href === path) a.classList.add('active');
    });
}
