// server/routes/publicRoutes.js

const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Ads = require('../models/Ads'); 

// 1. GET /api/public/articles: Inkuru zose zo kuri Landing page
router.get('/articles', async (req, res) => {
  try {
    // HANO NIHO HAKOSOWE: Ushaka 'approved' CYANGWA 'Approved' kugira ngo zose zize
    const articles = await Article.find({ 
      status: { $in: ['approved', 'Approved'] } 
    }).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. GET /api/public/articles/category/:categoryName: Inkuru za Category runaka
router.get('/articles/category/:categoryName', async (req, res) => {
    try {
        const categoryName = req.params.categoryName;
        const articles = await Article.find({ 
            status: { $in: ['approved', 'Approved'] }, 
            category: new RegExp(categoryName, 'i') // 'i' bituma itandukanya inyuguti nini n'into
        }).sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching category');
    }
});


// 3. GET /api/public/articles/:id: Inkuru imwe (Single Article View)
router.get('/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        // Genzura niba status ihuye n'uburyo bwose bwaba bwanditsemo
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


// 4. GET /api/public/tv: Inkuru za TV (Video)
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

// 5. GET /api/public/ads: Amatangazo yose akora
router.get('/ads', async (req, res) => {
    try {
      const ads = await Ads.find({ isActive: true }).sort({ createdAt: -1 }); 
      res.json(ads);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error: Failed to fetch public ads');
    }
});

module.exports = router;
