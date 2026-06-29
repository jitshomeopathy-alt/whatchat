const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const Article = require('../models/Article');

/**
 * GET /api/stories
 * Public list of published success stories (newest first) for the website.
 */
router.get('/stories', async (req, res) => {
  try {
    const stories = await Story.find({ published: true })
      .sort({ createdAt: -1 })
      .select('name photoUrl description rating createdAt')
      .lean();

    return res.json({ total: stories.length, data: stories });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/articles
 * Public list of published blog articles (newest first). Optional ?category=
 * filters to one category. The full body is omitted to keep the list light.
 */
router.get('/articles', async (req, res) => {
  try {
    const query = { status: 'published' };
    if (req.query.category && Article.CATEGORIES.includes(req.query.category)) {
      query.category = req.query.category;
    }
    const articles = await Article.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .select('title slug category thumbnailUrl description publishedAt createdAt')
      .lean();

    return res.json({ total: articles.length, data: articles, categories: Article.CATEGORIES });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/articles/:slug
 * Public single published article (full body) for the blog detail page.
 */
router.get('/articles/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, status: 'published' }).lean();
    if (!article) return res.status(404).json({ error: 'Article not found' });
    return res.json(article);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
