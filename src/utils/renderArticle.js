/*
 * Server-side renderer for a single blog article.
 *
 * Social/scraper crawlers (and many search bots) do NOT run client-side fetches,
 * so the SEO/Open-Graph meta tags must be present in the HTML the server sends.
 * This builds that full document from a DB article — title, description, OG and
 * Twitter cards, canonical URL, JSON-LD Article schema — with the body inlined.
 */

const SITE_URL = (process.env.SITE_URL || 'https://astrovaidhya.com').replace(/\/$/, '');
const SITE_NAME = 'Astro Vaidhya';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

// Escape for use inside HTML attribute values / text nodes.
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Trim a string to a clean meta-description length.
function clip(s, n) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trim()}…` : t;
}

function renderArticlePage(article) {
  const url = `${SITE_URL}/blog/${article.slug}`;
  const metaTitle = (article.seoTitle || article.title || '').trim();
  const pageTitle = `${metaTitle} — ${SITE_NAME}`;
  const metaDesc = clip(article.seoDescription || article.description || article.title, 160);
  const image = article.thumbnailUrl || DEFAULT_OG_IMAGE;
  const published = article.publishedAt || article.createdAt;
  const isoDate = published ? new Date(published).toISOString() : '';
  const dateLabel = published
    ? new Date(published).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: metaDesc,
    image: image ? [image] : undefined,
    articleSection: article.category,
    datePublished: isoDate || undefined,
    dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    publisher: { '@type': 'Organization', name: SITE_NAME },
  });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(pageTitle)}</title>
    <meta name="description" content="${esc(metaDesc)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${esc(url)}" />

    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${esc(SITE_NAME)}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:title" content="${esc(metaTitle)}" />
    <meta property="og:description" content="${esc(metaDesc)}" />
    <meta property="og:image" content="${esc(image)}" />
    ${isoDate ? `<meta property="article:published_time" content="${esc(isoDate)}" />` : ''}
    <meta property="article:section" content="${esc(article.category)}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(metaTitle)}" />
    <meta name="twitter:description" content="${esc(metaDesc)}" />
    <meta name="twitter:image" content="${esc(image)}" />

    <script type="application/ld+json">${jsonLd}</script>

    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%230b0e1a'/%3E%3Ctext x='32' y='44' font-size='38' text-anchor='middle' fill='%23c99a4b' font-family='Georgia,serif'%3EA%3C/text%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&amp;family=Inter:wght@400;500;600;700&amp;family=IBM+Plex+Mono:wght@400;500&amp;display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/site.css" />
    <style>
      .article-wrap { max-width: 760px; margin: 0 auto; padding: 40px 22px 70px; }
      .article-back { color: var(--brass, #c99a4b); text-decoration: none; font-size: 0.92rem; }
      .article-cat {
        display: inline-block; margin: 22px 0 10px; padding: 5px 12px; border-radius: 999px;
        background: rgba(201, 154, 75, 0.14); color: var(--brass, #c99a4b);
        font-size: 0.78rem; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase;
      }
      .article-title { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.9rem, 4vw, 2.7rem); line-height: 1.15; margin: 0 0 12px; }
      .article-meta { color: var(--muted, #8b8b8b); font-size: 0.9rem; margin-bottom: 24px; }
      .article-hero { width: 100%; border-radius: 16px; margin: 8px 0 30px; object-fit: cover; }
      .article-body { font-size: 1.08rem; line-height: 1.75; color: var(--ink, #25303a); }
      .article-body h2 { font-family: 'Fraunces', Georgia, serif; font-size: 1.6rem; margin: 1.8em 0 0.5em; }
      .article-body h3 { font-size: 1.25rem; margin: 1.5em 0 0.4em; }
      .article-body p { margin: 0 0 1.1em; }
      .article-body ul, .article-body ol { margin: 0 0 1.1em; padding-left: 1.4em; }
      .article-body li { margin: 0.3em 0; }
      .article-body img { max-width: 100%; border-radius: 12px; margin: 1em 0; }
      .article-body a { color: var(--brass, #c99a4b); }
      .article-body blockquote {
        margin: 1.2em 0; padding: 0.6em 1.1em; border-left: 3px solid var(--brass, #c99a4b);
        background: rgba(201, 154, 75, 0.08); border-radius: 0 10px 10px 0; color: var(--ink, #25303a);
      }
    </style>
  </head>
  <body>
    <nav class="nav"></nav>

    <main class="article-wrap">
      <a class="article-back" href="/blog">← Back to blog</a>
      <span class="article-cat">${esc(article.category)}</span>
      <h1 class="article-title">${esc(article.title)}</h1>
      <div class="article-meta">${dateLabel ? esc(dateLabel) : ''}</div>
      ${article.thumbnailUrl ? `<img class="article-hero" src="${esc(article.thumbnailUrl)}" alt="${esc(article.title)}" />` : ''}
      <article class="article-body">${article.body || ''}</article>
    </main>

    <footer class="site-footer">
      <div class="footer-row">
        <span>&copy; 2026 ${esc(SITE_NAME)}.</span>
        <div class="footer-links">
          <a href="/about">About</a><a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a>
        </div>
      </div>
    </footer>

    <script src="/site-nav.js" defer></script>
  </body>
</html>`;
}

module.exports = { renderArticlePage };
