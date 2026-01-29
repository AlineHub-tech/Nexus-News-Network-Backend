// server/routes/adminRoutes.js (Code Yuzuye Yakosowe na Cloudinary)

const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Ads = require('../models/Ads'); 
const auth = require('../middleware/auth'); 
const admin = require('../middleware/admin'); 
const multer = require('multer'); 
// Injizamo Cloudinary na Multer Storage Cloudinary
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary from .env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Tegura uburyo Cloudinary ibika files (Aho kuba diskStorage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nexus-news-uploads', // Folder mu Cloudinary dashboard
    format: async (req, file) => 'jpg', 
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});
const upload = multer({ storage: storage });


// POST /api/admin/articles: Kohereza inkuru nshya 
router.post('/articles', [auth, admin, upload.single('mediaFile')], async (req, res) => {
  const { title, content, category, mediaType } = req.body; 
  const mediaUrl = req.file ? req.file.path : null; // URL yuzuye ya Cloudinary

  try {
    const newArticle = new Article({ title, content, category, mediaUrl, mediaType, author: req.user.username, status: 'approved' });
    const article = await newArticle.save();
    res.status(201).json(article);
  } catch (err) {
    console.error(err.message); res.status(500).send('Server Error');
  }
});


// POST /api/admin/ads: Kohereza Ad nshya
router.post('/ads', [auth, admin, upload.single('mediaFile')], async (req, res) => {
    const { title, description, mediaType } = req.body;
    const mediaUrl = req.file ? req.file.path : null; // URL yuzuye ya Cloudinary

    try {
        const newAd = new Ads({ title, description, mediaUrl, mediaType, isActive: true });
        const savedAd = await newAd.save();
        res.status(201).json(savedAd);
    } catch (err) {
        console.error(err.message); res.status(500).send('Server Error: Ad upload failed');
    }
});


// GET /api/admin/pending-articles: Kubona inkuru zitarasuzumwa
router.get('/pending-articles', [auth, admin], async (req, res) => {
    try {
        const articles = await Article.find({ status: 'pending' }).sort({ date: -1 });
        res.json(articles);
    } catch (err) { 
        console.error(err.message); res.status(500).send('Server Error'); 
    }
});

// GET /api/admin/approved-articles: Kubona inkuru zemejwe
router.get('/approved-articles', [auth, admin], async (req, res) => {
    try {
        const articles = await Article.find({ status: 'approved' }).sort({ date: -1 });
        res.json(articles);
    } catch (err) {
        console.error(err.message); res.status(500).send('Server Error');
    }
});

// PUT /api/admin/articles/:id/approve: Kwemeza inkuru (guhindura status)
router.put('/articles/:id/approve', [auth, admin], async (req, res) => {
    try {
        const article = await Article.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        if (!article) return res.status(404).json({ msg: 'Inkuru ntabonetse' });
        res.json(article);
    } catch (err) { 
        console.error(err.message); res.status(500).send('Server Error'); 
    }
});


// PUT /api/admin/articles/:id: GUHINDURA (EDIT/UPDATE) INKURU 
router.put('/articles/:id', [auth, admin], async (req, res) => {
    const { title, content, category } = req.body; 
    try {
        const article = await Article.findById(req.params.id);
        if (!article) { return res.status(404).json({ msg: 'Inkuru ntabonetse' }); }
        article.title = title !== undefined ? title : article.title;
        article.content = content !== undefined ? content : article.content; 
        article.category = category !== undefined ? category : article.category;
        const updatedArticle = await article.save();
        res.json(updatedArticle); 
    } catch (err) { 
        console.error(err.message); res.status(500).send('Server Error during article update'); 
    }
});


// DELETE /api/admin/articles/:id: GUSIBA INKURU BURUNDU
router.delete('/articles/:id', [auth, admin], async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Inkuru ntabonetse' });
        res.json({ msg: 'Inkuru yasibwe' });
    } catch (err) { 
        console.error(err.message); res.status(500).send('Server Error'); 
    }
});


// DELETE /api/admin/ads/:id: GUSIBA ADS
router.delete('/ads/:id', [auth, admin], async (req, res) => {
    try {
        const ad = await Ads.findByIdAndDelete(req.params.id);
        if (!ad) return res.status(404).json({ msg: 'Ad ntabonetse' });
        res.json({ msg: 'Ad yasibwe' });
    } catch (err) { 
        console.error(err.message); 
        res.status(500).send('Server Error'); 
    }
});


module.exports = router;
