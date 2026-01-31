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

// 2. Cloudinary Storage Config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'nexus-news-uploads',
      resource_type: 'auto', 
      upload_preset: 'nexus_news_preset',
      public_id: `admin-${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage: storage });

// --- ADS MANAGEMENT ---

// Kohereza Ad Nshya
router.post('/ads', [auth, admin, upload.single('mediaFile')], async (req, res) => {
    try {
        const { title, description, mediaType, placement } = req.body;
        const mediaUrl = req.file ? req.file.path : null; 

        const newAd = new Ads({ 
            title, 
            description, 
            mediaUrl, 
            mediaType, 
            placement: placement || 'slider',
            isActive: true 
        });
        await newAd.save();
        res.status(201).json({ msg: 'Ad yashyizweho neza' });
    } catch (err) {
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
        await Ads.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Ad yasibwe neza' });
    } catch (err) { 
        res.status(500).json({ msg: 'Server Error' }); 
    }
});

// --- ARTICLE MANAGEMENT ---

// Kuzana izitegereje (Pending)
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

// Kuzana izemejwe (Approved)
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

// Kwemeza Inkuru (Approve)
router.put('/articles/:id/approve', [auth, admin], async (req, res) => {
    try {
        await Article.findByIdAndUpdate(req.params.id, { status: 'Approved' });
        res.json({ msg: 'Inkuru yemejwe' });
    } catch (err) { 
        res.status(500).json({ msg: 'Server Error' }); 
    }
});

// Guhindura Inkuru (Edit)
router.put('/articles/:id', [auth, admin, upload.single('mediaFile')], async (req, res) => {
    try {
        const { title, content, category, author, status, mediaType } = req.body;
        let article = await Article.findById(req.params.id);
        
        if (title) article.title = title;
        if (content) article.content = content;
        if (category) article.category = category;
        if (author) article.author = author;
        if (status) article.status = status;
        if (mediaType) article.mediaType = mediaType;
        if (req.file) article.mediaUrl = req.file.path;

        await article.save();
        res.json({ msg: 'Inkuru yahinduwe neza' });
    } catch (err) {
        res.status(500).json({ msg: 'Update failed', error: err.message });
    }
});

// Gusiba Inkuru
router.delete('/articles/:id', [auth, admin], async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Inkuru yasibwe' });
    } catch (err) { 
        res.status(500).json({ msg: 'Server Error' }); 
    }
});

module.exports = router;
