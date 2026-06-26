/*
 * Shared site header for all public website pages.
 *
 * Each page just includes <script src="/site-nav.js" defer></script>. This
 * script replaces the page's <nav class="nav"> with a single canonical header
 * (same links, same brand, same active-state logic everywhere) and adds a
 * hamburger menu for narrow screens. It also injects its own responsive styles
 * so it behaves identically on pages that don't load site.css (e.g. index.html).
 */
(function () {
  var BRAND_SVG =
    '<svg class="brand-mark" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<circle cx="20" cy="20" r="17" fill="none" stroke="#c99a4b" stroke-width="1" opacity="0.55" />' +
    '<g stroke="#e8c57e" stroke-width="1.4" stroke-linecap="round">' +
    '<line x1="20" y1="20" x2="20" y2="6" />' +
    '<line x1="20" y1="20" x2="31.3" y2="13" />' +
    '<line x1="20" y1="20" x2="31.3" y2="27" />' +
    '<line x1="20" y1="20" x2="20" y2="34" />' +
    '<line x1="20" y1="20" x2="8.7" y2="27" />' +
    '<line x1="20" y1="20" x2="8.7" y2="13" />' +
    '</g>' +
    '<circle cx="20" cy="20" r="3.4" fill="#e8c57e" />' +
    '</svg>';

  var LINKS = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/stories', label: 'Stories' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  // Normalise the current path: strip trailing slash and ".html".
  var path = location.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';

  function isActive(href) {
    if (href === '/') return path === '/';
    return path === href || path.indexOf(href + '/') === 0;
  }

  var linksHtml = LINKS.map(function (l) {
    return '<a href="' + l.href + '"' + (isActive(l.href) ? ' class="active"' : '') + '>' + l.label + '</a>';
  }).join('');

  var rowHtml =
    '<div class="wrap nav-row">' +
    '<a class="brand" href="/">' +
    BRAND_SVG +
    '<span class="brand-text">' +
    '<span class="brand-word">Astro&nbsp;Vaidhya</span>' +
    '<span class="brand-tag">AI Homeopathic Wellness</span>' +
    '</span>' +
    '</a>' +
    '<button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false">' +
    '<span></span><span></span><span></span>' +
    '</button>' +
    '<div class="nav-links">' + linksHtml + '</div>' +
    '</div>';

  // Responsive styles for the hamburger + mobile dropdown. Injected here (with
  // !important) so they win even over a page's own inline .nav-links rules.
  var STYLE =
    '.nav{position:relative;}' +
    '.nav-toggle{display:none;flex-direction:column;justify-content:center;gap:5px;' +
    'width:42px;height:42px;padding:9px;background:none;border:0;cursor:pointer;}' +
    '.nav-toggle span{display:block;height:2px;width:100%;background:#e8c57e;border-radius:2px;' +
    'transition:transform .2s ease,opacity .2s ease;}' +
    '.nav.open .nav-toggle span:nth-child(1){transform:translateY(7px) rotate(45deg);}' +
    '.nav.open .nav-toggle span:nth-child(2){opacity:0;}' +
    '.nav.open .nav-toggle span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}' +
    '@media (max-width:900px){' +
    '.nav .nav-row{height:64px !important;flex-direction:row !important;align-items:center !important;' +
    'padding-top:0 !important;padding-bottom:0 !important;}' +
    '.nav .nav-toggle{display:flex !important;}' +
    '.nav .brand-tag{display:none !important;}' +
    '.nav .nav-links{display:none !important;position:absolute;top:100%;left:0;right:0;' +
    'flex-direction:column;align-items:stretch;gap:0;font-size:1rem;' +
    'background:rgba(11,14,26,0.98);backdrop-filter:blur(10px);' +
    'border-bottom:1px solid rgba(201,154,75,0.35);}' +
    '.nav.open .nav-links{display:flex !important;}' +
    '.nav .nav-links a{padding:15px 24px;border-top:1px solid rgba(255,255,255,0.06);}' +
    '}';

  function init() {
    var style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);

    var nav = document.querySelector('nav.nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'nav';
      document.body.insertBefore(nav, document.body.firstChild);
    }
    nav.innerHTML = rowHtml;

    var toggle = nav.querySelector('.nav-toggle');
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
