/*
 * Mobile navigation for the admin dashboard.
 *
 * On narrow screens the sidebar is hidden off-canvas. This script adds a
 * hamburger button to the page header and a dim overlay, and toggles a
 * `nav-open` class on <body> to slide the sidebar in. Each admin page just
 * includes <script src="/admin/admin-nav.js" defer></script>.
 */
(function () {
  function init() {
    var header = document.querySelector('.header');
    var sidebar = document.querySelector('.sidebar');
    if (!header || !sidebar) return; // e.g. the login page has no sidebar

    var btn = document.createElement('button');
    btn.className = 'nav-toggle-admin';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = '<span></span><span></span><span></span>';
    header.insertBefore(btn, header.firstChild);

    var overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    function close() {
      document.body.classList.remove('nav-open');
      btn.setAttribute('aria-label', 'Open menu');
    }
    btn.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    overlay.addEventListener('click', close);
    // Tapping a destination should dismiss the drawer.
    sidebar.querySelectorAll('.nav-item').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
