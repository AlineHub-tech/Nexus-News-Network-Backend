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
  params: {
    folder: 'nexus-news-uploads',
    resource_type: 'auto', // IBI NI INGENZI KURI VIDEO NA FOTO
    // Koresha upload_preset niba ariyo washyizeho muri Cloudinary Dashboard
    upload_preset: 'nexus_news_preset', 
    public_id: (req, file) => `file-${Date.now()}`,
  },
});
const upload = multer({ storage: storage });

// --- ADS MANAGEMENT ---

// Kohereza Ad Nshya (Slider cyangwa Sidebar)
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
        const savedAd = await newAd.save();
        res.status(201).json(savedAd);
    } catch (err) {
        console.error("Ad Error:", err.message);
        res.status(500).json({ msg: 'Server Error: Ad upload failed' });
    }
});

// Kubona Ads zose
router.get('/ads', [auth, admin], async (req, res) => {
    try {
        const ads = await Ads.find().sort({ createdAt: -1 });
        res.json(ads);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Gusiba Ad
router.delete('/ads/:id', [auth, admin], async (req, res) => {
    try {
        const ad = await Ads.findByIdAndDelete(req.params.id);
        if (!ad) return res.status(404).json({ msg: 'Ad ntabonetse' });
        res.json({ msg: 'Ad yasibwe neza' });
    } catch (err) { 
        res.status(500).send('Server Error'); 
    }
});

// --- ARTICLE MANAGEMENT ---

// 1. Kuzana inkuru zitegereje kwemezwa (Pending)
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

// 2. Kuzana inkuru zemejwe (Approved)
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

// 3. KWEMEZA INKURU (Approve)
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

// 4. GUHINDURA INKURU (Edit/Update) - YAKOSOWE MEDIAURL
router.put('/articles/:id', [auth, admin, upload.single('mediaFile')], async (req, res) => {
    try {
        const { title, content, category, author, status, mediaType } = req.body;
        
        let article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Inkuru ntabonetse' });

        // Update fields
        if (title) article.title = title;
        if (content) article.content = content;
        if (category) article.category = category;
        if (author) article.author = author;
        if (status) article.status = status;
        if (mediaType) article.mediaType = mediaType;
        
        // Hano twakosoye izina ngo rihure n'ibindi: mediaUrl aho kuba imageUrl
        if (req.file) article.mediaUrl = req.file.path;

        const updatedArticle = await article.save();
        res.json(updatedArticle);
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ msg: 'Server Error: Guhindura inkuru byanze' });
    }
});

// 5. GUSIBA INKURU
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
