const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Ads = require('../models/Ads'); 

// 1. GET /api/public/articles: Landing page news
router.get('/articles', async (req, res) => {
  try {
    // Gushaka izifite 'approved' cyangwa 'Approved' (Case Insensitive Fix)
    const articles = await Article.find({ 
      status: { $in: ['approved', 'Approved'] } 
    }).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. GET /api/public/articles/category/:categoryName: Filter by Category
router.get('/articles/category/:categoryName', async (req, res) => {
    try {
        const categoryName = req.params.categoryName;
        const articles = await Article.find({ 
            status: { $in: ['approved', 'Approved'] }, 
            category: new RegExp(categoryName, 'i') 
        }).sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching category');
    }
});

// 3. GET /api/public/articles/:id: Single Article Details
router.get('/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article || !['approved', 'Approved'].includes(article.status)) {
            return res.status(404).json({ msg: 'Inkuru ntibonetse cyangwa ntiremezwa' });
        }

        res.json(article);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Inkuru ntibonetse' });
        }
        res.status(500).send('Server Error');
    }
});

// 4. PUT /api/public/articles/:id/view: Update View Count (Fixes 404 & Popularity)
router.put('/articles/:id/view', async (req, res) => {
    try {
        const article = await Article.findByIdAndUpdate(
            req.params.id, 
            { $inc: { views: 1 } }, 
            { new: true }
        );
        if (!article) return res.status(404).json({ msg: 'Article not found' });
        res.json({ msg: 'View updated', views: article.views });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error updating views');
    }
});

// 5. GET /api/public/tv: Video articles only
router.get('/tv', async (req, res) => {
    try {
      const tvArticles = await Article.find({ 
          status: { $in: ['approved', 'Approved'] }, 
          category: 'TV', 
          mediaType: 'video' 
      }).sort({ createdAt: -1 });
      res.json(tvArticles);
    } catch (err) {
      res.status(500).send('Server Error');
    }
});

// 6. GET /api/public/ads: Get all active ads for Landing Page
router.get('/ads', async (req, res) => {
    try {
      // Shaka ads zose ziriho (isActive)
      const ads = await Ads.find({ isActive: true }).sort({ createdAt: -1 }); 
      res.json(ads);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

module.exports = router;
