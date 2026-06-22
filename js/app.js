/* ============================================
   WEAVE KATHA BOUTIQUE — Main Application
   ============================================ */

'use strict';

/* ——— Constants ——— */
const WA_NUMBER = '919810976296';
const ADMIN_PASS = 'Weave Katha@2024';
const STORAGE_KEY = 'weave_katha_products';

/* ——— Default Products ——— */
const DEFAULT_PRODUCTS = [
  {
    id: '1', name: 'Zari Border Lawn Suit', category: 'Lawn',
    price: 2200, originalPrice: 2800,
    fabric: 'Pure Lawn', pieces: '3 Piece',
    description: 'Exquisite zari border work on soft lawn fabric. Perfect for festive occasions.',
    image: '', badge: 'new', inStock: true
  },
  {
    id: '2', name: 'Hand Block Print Cotton', category: 'Cotton',
    price: 1800, originalPrice: 0,
    fabric: 'Pure Cotton', pieces: '3 Piece',
    description: 'Traditional hand block printed cotton fabric with intricate floral motifs.',
    image: '', badge: '', inStock: true
  },
  {
    id: '3', name: 'Embroidered Chiffon Set', category: 'Chiffon',
    price: 4500, originalPrice: 5500,
    fabric: 'Pure Chiffon', pieces: '3 Piece',
    description: 'Delicate chiffon with fine thread embroidery. Ideal for weddings and parties.',
    image: '', badge: 'hot', inStock: true
  },
  {
    id: '4', name: 'Silk Dupatta Suit', category: 'Silk',
    price: 5800, originalPrice: 7000,
    fabric: 'Pure Silk', pieces: '3 Piece',
    description: 'Luxurious silk fabric with matching silk dupatta. A timeless choice.',
    image: '', badge: 'sale', inStock: true
  },
  {
    id: '5', name: 'Georgette Party Wear', category: 'Georgette',
    price: 3200, originalPrice: 4000,
    fabric: 'Georgette', pieces: '3 Piece',
    description: 'Flowing georgette with sequin embellishments perfect for evening wear.',
    image: '', badge: '', inStock: true
  },
  {
    id: '6', name: 'Kantha Work Linen', category: 'Linen',
    price: 2600, originalPrice: 3200,
    fabric: 'Premium Linen', pieces: '2 Piece',
    description: 'Breathable linen with traditional Kantha embroidery. Casual elegance.',
    image: '', badge: 'new', inStock: true
  },
  {
    id: '7', name: 'Phulkari Cotton Dupatta', category: 'Cotton',
    price: 1500, originalPrice: 0,
    fabric: 'Cotton', pieces: '2 Piece',
    description: 'Vibrant Phulkari embroidery on soft cotton. A Punjab heritage piece.',
    image: '', badge: '', inStock: true
  },
  {
    id: '8', name: 'Banarasi Silk Saree Suit', category: 'Silk',
    price: 8500, originalPrice: 10500,
    fabric: 'Banarasi Silk', pieces: '3 Piece',
    description: 'Opulent Banarasi weave with gold zari. The finest for bridal occasions.',
    image: '', badge: 'hot', inStock: true
  }
];

/* ——— State ——— */
let products = [];
let cart = [];
let activeCategory = 'All';

/* ============================================
   STORAGE
   ============================================ */
function loadProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    products = stored ? JSON.parse(stored) : [...DEFAULT_PRODUCTS];
  } catch {
    products = [...DEFAULT_PRODUCTS];
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem('weave_katha_cart') || '[]');
  } catch { cart = []; }
}

function saveCart() {
  localStorage.setItem('weave_katha_cart', JSON.stringify(cart));
}

/* ============================================
   CART LOGIC
   ============================================ */
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
    toast(`Quantity updated — ${product.name}`, 'info');
  } else {
    cart.push({ id: product.id, qty: 1 });
    toast(`Added to cart — ${product.name}`, 'success');
  }
  saveCart();
  renderCart();
  updateCartBadge();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(productId);
  else { saveCart(); renderCart(); updateCartBadge(); }
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  renderCart();
  updateCartBadge();
  toast('Item removed from cart', 'info');
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const p = products.find(x => x.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function cartItemCount() {
  return cart.reduce((n, i) => n + i.qty, 0);
}

/* ============================================
   WHATSAPP ORDER
   ============================================ */
function buildWhatsAppMessage() {
  const lines = ['Hello *Weave Katha Boutique!* 🛍️', '', "I'd like to place an order:", ''];
  cart.forEach((item, i) => {
    const p = products.find(x => x.id === item.id);
    if (!p) return;
    const sub = p.price * item.qty;
    lines.push(`${i + 1}. *${p.name}* (${p.fabric || p.category})`);
    lines.push(`   Qty: ${item.qty} × ₹${p.price.toLocaleString('en-IN')} = ₹${sub.toLocaleString('en-IN')}`);
    lines.push('');
  });
  lines.push(`💰 *Total: ₹${cartTotal().toLocaleString('en-IN')}*`);
  lines.push('');
  lines.push('Please confirm availability and share payment & delivery details. Thank you! 🙏');
  return encodeURIComponent(lines.join('\n'));
}

function openWhatsApp() {
  if (cart.length === 0) {
    toast('Your cart is empty!', 'error');
    return;
  }
  const msg = buildWhatsAppMessage();
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
}

/* ============================================
   RENDER: PRODUCTS
   ============================================ */
function categoryColor(cat) {
  const map = {
    Lawn: '#6dbf67', Cotton: '#e67e22', Chiffon: '#9b59b6',
    Silk: '#c0392b', Georgette: '#3498db', Linen: '#8e6b2b', Embroidered: '#d35400'
  };
  return map[cat] || '#B5674D';
}

function productCardHTML(p) {
  const hasDiscount = p.originalPrice > p.price;
  const discount = hasDiscount
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : 0;

  const badgeHTML = p.badge
    ? `<span class="product-card__badge badge-${p.badge}">${p.badge}</span>`
    : hasDiscount ? `<span class="product-card__badge badge-sale">-${discount}%</span>` : '';

  const imgHTML = p.image
    ? `<img class="product-card__img" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'product-card__img-placeholder\\'><i class=\\'fas fa-gem\\'></i><span>${escapeHtml(p.category)}</span></div>'">`
    : `<div class="product-card__img-placeholder"><i class="fas fa-gem"></i><span>${escapeHtml(p.category)}</span></div>`;

  return `
  <article class="product-card" data-id="${p.id}">
    <div class="product-card__img-wrap">
      ${imgHTML}
      ${badgeHTML}
      <button class="product-card__wish" title="Wishlist"><i class="far fa-heart"></i></button>
    </div>
    <div class="product-card__body">
      <span class="product-card__category">${escapeHtml(p.category)}</span>
      <h3 class="product-card__name">${escapeHtml(p.name)}</h3>
      <div class="product-card__meta">
        ${p.fabric ? `<span><i class="fas fa-circle-dot" style="color:${categoryColor(p.category)};font-size:.5rem"></i>${escapeHtml(p.fabric)}</span>` : ''}
        ${p.pieces ? `<span><i class="fas fa-layer-group" style="font-size:.6rem;color:var(--text-3)"></i>${escapeHtml(p.pieces)}</span>` : ''}
      </div>
      <div class="product-card__price-row">
        <div class="product-card__price">
          <span class="price-current">₹${p.price.toLocaleString('en-IN')}</span>
          ${hasDiscount ? `<span class="price-original">₹${p.originalPrice.toLocaleString('en-IN')}</span>` : ''}
        </div>
        <button class="btn-add-cart" onclick="addToCart('${p.id}');openCart()" title="Add to cart">
          <i class="fas fa-shopping-bag"></i>
        </button>
      </div>
    </div>
  </article>`;
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const filtered = activeCategory === 'All'
    ? products.filter(p => p.inStock !== false)
    : products.filter(p => p.category === activeCategory && p.inStock !== false);

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="products-empty">
      <i class="fas fa-search"></i>
      <h3>No items found</h3>
      <p>Try a different category or check back soon.</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(productCardHTML).join('');
}

/* ——— Category pills ——— */
function renderCategories() {
  const container = document.getElementById('category-pills');
  if (!container) return;

  const cats = ['All', ...new Set(products.map(p => p.category))];
  container.innerHTML = cats.map(c => `
    <button class="pill ${c === activeCategory ? 'active' : ''}" onclick="setCategory('${c}')">
      ${c}
    </button>`).join('');
}

function setCategory(cat) {
  activeCategory = cat;
  renderCategories();
  renderProducts();
}

/* ============================================
   RENDER: CART DRAWER
   ============================================ */
function renderCart() {
  const body = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  const titleCount = document.getElementById('cart-count-label');
  if (!body) return;

  const count = cartItemCount();
  if (titleCount) titleCount.textContent = count;

  if (cart.length === 0) {
    body.innerHTML = `<div class="cart-empty">
      <i class="fas fa-shopping-bag"></i>
      <h3>Your bag is empty</h3>
      <p>Add some beautiful pieces to get started.</p>
      <button class="btn btn-primary btn-sm" onclick="closeCart()">Shop Now</button>
    </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  body.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return '';
    const thumb = p.image
      ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.parentElement.innerHTML='<div class=\\'thumb-placeholder\\'><i class=\\'fas fa-gem\\'></i></div>'">`
      : `<div class="thumb-placeholder"><i class="fas fa-gem"></i></div>`;

    return `<div class="cart-item" data-id="${p.id}">
      <div class="cart-item__thumb">${thumb}</div>
      <div class="cart-item__info">
        <div class="cart-item__category">${escapeHtml(p.category)}</div>
        <div class="cart-item__name">${escapeHtml(p.name)}</div>
        <div class="cart-item__price">₹${(p.price * item.qty).toLocaleString('en-IN')}</div>
        <div class="cart-item__qty">
          <button class="qty-btn" onclick="changeQty('${p.id}',-1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${p.id}',1)">+</button>
        </div>
      </div>
      <button class="cart-item__delete" onclick="removeFromCart('${p.id}')" title="Remove">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>`;
  }).join('');

  const total = cartTotal();
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = cartItemCount();
  badges.forEach(b => {
    b.textContent = count;
    b.classList.toggle('visible', count > 0);
  });
}

/* ——— Open/Close cart ——— */
function openCart() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================
   TOAST
   ============================================ */
function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> <span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 350);
  }, 2800);
}

/* ============================================
   UTILITY
   ============================================ */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ——— Mobile nav ——— */
function toggleMobileNav() {
  document.getElementById('nav-links')?.classList.toggle('mobile-open');
}

/* ——— Scroll-based header shrink ——— */
function handleScroll() {
  const header = document.querySelector('.header');
  if (header) header.classList.toggle('scrolled', window.scrollY > 40);
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCart();
  renderCategories();
  renderProducts();
  renderCart();
  updateCartBadge();

  window.addEventListener('scroll', handleScroll, { passive: true });

  /* Close cart on overlay click */
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

  /* Close cart on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCart();
  });

  /* Wishlist heart toggle */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.product-card__wish');
    if (!btn) return;
    const icon = btn.querySelector('i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
    btn.style.color = icon.classList.contains('fas') ? '#e74c3c' : '';
  });
});
