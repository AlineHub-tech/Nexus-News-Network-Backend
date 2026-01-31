// server/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Ads = require('../models/Ads'); 
const auth = require('../middleware/auth'); 
const admin = require('../middleware/admin'); 
const multer = require('multer'); 
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Tegura Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'nexus-news-uploads',
      // 'auto' ifasha kwakira video n'amafoto icyarimwe
      resource_type: 'auto', 
      upload_preset: 'nexus_news_preset', // Emeza ko iyi ari 'Unsigned' muri Cloudinary
      public_id: `file-${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage: storage });

// --- ADS MANAGEMENT ---

// Kohereza Ad Nshya
router.post('/ads', [auth, admin, upload.single('mediaFile')], async (req, res) => {
    try {
        const { title, description, mediaType, placement } = req.body;
        // Cloudinary itanga secure_url (https)
        const mediaUrl = req.file ? req.file.path : null; 

        const newAd = new Ads({ 
            title, 
            description, 
            mediaUrl, 
            mediaType, 
            placement: placement || 'slider',
            isActive: true 
        });
        const savedAd = await newAd.save();
        res.status(201).json(savedAd);
    } catch (err) {
        console.error("Ad Upload Error:", err);
        res.status(500).json({ msg: 'Ad upload failed', error: err.message });
    }
});

// Kubona Ads zose
router.get('/ads', [auth, admin], async (req, res) => {
    try {
        const ads = await Ads.find().sort({ createdAt: -1 });
        res.json(ads);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Gusiba Ad
router.delete('/ads/:id', [auth, admin], async (req, res) => {
    try {
        const ad = await Ads.findByIdAndDelete(req.params.id);
        if (!ad) return res.status(404).json({ msg: 'Ad ntabonetse' });
        res.json({ msg: 'Ad yasibwe neza' });
    } catch (err) { 
        res.status(500).json({ msg: 'Server Error' }); 
    }
});

// --- ARTICLE MANAGEMENT ---

// 1. Pending Articles
router.get('/pending-articles', [auth, admin], async (req, res) => {
    try {
        const articles = await Article.find({ 
            status: { $regex: /^pending$/i } 
        }).sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// 2. Approved Articles
router.get('/approved-articles', [auth, admin], async (req, res) => {
    try {
        const articles = await Article.find({ 
            status: { $regex: /^approved$/i } 
        }).sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// 3. Approve Article
router.put('/articles/:id/approve', [auth, admin], async (req, res) => {
    try {
        const article = await Article.findByIdAndUpdate(
            req.params.id, 
            { status: 'approved' }, 
            { new: true }
        );
        if (!article) return res.status(404).json({ msg: 'Inkuru ntabonetse' });
        res.json(article);
    } catch (err) { 
        res.status(500).json({ msg: 'Server Error' }); 
    }
});

// 4. Update Article (Edit)
router.put('/articles/:id', [auth, admin, upload.single('mediaFile')], async (req, res) => {
    try {
        const { title, content, category, author, status, mediaType } = req.body;
        
        let article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Inkuru ntabonetse' });

        if (title) article.title = title;
        if (content) article.content = content;
        if (category) article.category = category;
        if (author) article.author = author;
        if (status) article.status = status;
        if (mediaType) article.mediaType = mediaType;
        if (req.file) article.mediaUrl = req.file.path;

        const updatedArticle = await article.save();
        res.json(updatedArticle);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ msg: 'Guhindura inkuru byanze', error: err.message });
    }
});

// 5. Delete Article
router.delete('/articles/:id', [auth, admin], async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Inkuru ntabonetse' });
        res.json({ msg: 'Inkuru yasibwe neza' });
    } catch (err) { 
        res.status(500).json({ msg: 'Server Error' }); 
    }
});

module.exports = router;
