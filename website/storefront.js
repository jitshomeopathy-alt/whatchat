/* ── Shared storefront client: auth token + cart in localStorage ───────────── */
(function (global) {
  const TOKEN_KEY = 'wc_token';
  const CUSTOMER_KEY = 'wc_customer';
  const CART_KEY = 'wc_cart';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
    );
  }
  function inr(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }

  // ── Auth ──────────────────────────────────────────────────────────────────
  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function getCustomer() {
    try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || 'null'); }
    catch { return null; }
  }
  function setAuth(token, customer) {
    localStorage.setItem(TOKEN_KEY, token);
    if (customer) localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  }
  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
  }
  function isLoggedIn() { return !!getToken(); }
  function requireAuth() {
    if (isLoggedIn()) return true;
    const next = encodeURIComponent(location.pathname + location.search);
    location.href = '/login?next=' + next;
    return false;
  }

  // Authenticated fetch. On 401/403 the token is stale → clear and bounce to login.
  async function api(path, opts = {}) {
    const headers = Object.assign({}, opts.headers || {});
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

    const res = await fetch(path, Object.assign({}, opts, { headers }));
    if (res.status === 401 || res.status === 403) {
      clearAuth();
      const next = encodeURIComponent(location.pathname + location.search);
      location.href = '/login?next=' + next;
      throw new Error('Session expired');
    }
    return res;
  }

  // ── Cart ────────────────────────────────────────────────────────────────────
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateNavCart();
  }
  function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) existing.quantity += quantity;
    else cart.push({
      productId: product.id, name: product.name, price: product.price,
      imageUrl: product.imageUrl || '', quantity,
    });
    saveCart(cart);
  }
  function setQty(productId, quantity) {
    const cart = getCart();
    const item = cart.find((i) => i.productId === productId);
    if (!item) return;
    item.quantity = Math.max(1, quantity);
    saveCart(cart);
  }
  function removeFromCart(productId) {
    saveCart(getCart().filter((i) => i.productId !== productId));
  }
  function clearCart() { saveCart([]); }
  function cartCount() { return getCart().reduce((n, i) => n + i.quantity, 0); }
  function cartTotal() { return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0); }

  function updateNavCart() {
    const el = document.getElementById('cartCount');
    if (!el) return;
    const n = cartCount();
    el.textContent = n;
    el.style.display = n > 0 ? 'inline-grid' : 'none';
  }

  // Render the right-hand account/cart links based on login state.
  function renderNavAuth() {
    const el = document.getElementById('navAuth');
    if (!el) return;
    const cart = `<a href="/cart">Cart<span class="cart-count" id="cartCount" style="display:none">0</span></a>`;
    el.innerHTML = isLoggedIn()
      ? `<a href="/account">Account</a>${cart}`
      : `<a href="/login">Login</a>${cart}`;
    updateNavCart();
  }

  document.addEventListener('DOMContentLoaded', renderNavAuth);

  global.Store = {
    esc, inr,
    getToken, getCustomer, setAuth, clearAuth, isLoggedIn, requireAuth, api,
    getCart, addToCart, setQty, removeFromCart, clearCart, cartCount, cartTotal,
    updateNavCart, renderNavAuth,
  };
})(window);
