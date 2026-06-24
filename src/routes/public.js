const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

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

module.exports = router;
