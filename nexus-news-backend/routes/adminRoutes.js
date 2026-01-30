const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Ads = require('../models/Ads'); 
const auth = require('../middleware/auth'); 
const admin = require('../middleware/admin'); 
const multer = require('multer'); 
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// --- CLOUDINARY CONFIGURATION ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nexus-news-uploads',
    resource_type: 'auto',
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});

const upload = multer({ storage: storage });

// ==========================================
// 1. INKURU MANAGEMENTS (ARTICLES)
// ==========================================

// Kubona inkuru zose zitarasuzumwa (Pending)
router.get('/pending-articles', [auth, admin], async (req, res) => {
    try {
        const articles = await Article.find({ 
            status: { $in: ['pending', 'Pending'] } 
        }).sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Kubona inkuru zose zemejwe (Approved)
router.get('/approved-articles', [auth, admin], async (req, res) => {
    try {
        const articles = await Article.find({ 
            status: { $in: ['approved', 'Approved'] } 
        }).sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Kwemeza inkuru (Approve)
router.put('/articles/:id/approve', [auth, admin], async (req, res) => {
    try {
        const article = await Article.findByIdAndUpdate(
            req.params.id, 
            { status: 'Approved' }, 
            { new: true }
        );
        res.json(article);
    } catch (err) { 
        res.status(500).send('Server Error'); 
    }
});

// Gusiba inkuru burundu
router.delete('/articles/:id', [auth, admin], async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Article deleted' });
    } catch (err) { 
        res.status(500).send('Server Error'); 
    }
});

// ==========================================
// 2. ADS MANAGEMENT (KUREBA & GUSIBA)
// ==========================================

// Kohereza Ad nshya
router.post('/ads', [auth, admin, upload.single('mediaFile')], async (req, res) => {
    const { title, description, mediaType, placement } = req.body;
    const mediaUrl = req.file ? req.file.path : null; 

    try {
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
        res.status(500).send('Server Error');
    }
});

// Kureba Ads zose ziriho (Iyi niyo yari ibura ituma utazibona)
router.get('/ads', [auth, admin], async (req, res) => {
    try {
        const ads = await Ads.find().sort({ createdAt: -1 });
        res.json(ads);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Gusiba Ad (Iyi niyo yari ibura ituma utayisiba)
router.delete('/ads/:id', [auth, admin], async (req, res) => {
    try {
        const ad = await Ads.findByIdAndDelete(req.params.id);
        if (!ad) return res.status(404).json({ msg: 'Ad not found' });
        res.json({ msg: 'Ad deleted successfully' });
    } catch (err) { 
        res.status(500).send('Server Error'); 
    }
});

module.exports = router;
