const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Ads = require('../models/Ads'); 
const auth = require('../middleware/auth'); 
const admin = require('../middleware/admin'); 
const multer = require('multer'); 
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// --- CLOUDINARY CONFIG ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nexus-news-uploads',
    // resource_type: 'auto' ni ingenzi kugira ngo Cloudinary yakire amafoto na videos icyarimwe
    resource_type: 'auto', 
    // Twakuyemo format: 'jpg' kugira ngo bitica videos cyangwa gif
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});
const upload = multer({ storage: storage });

// ==========================================
// 1. ARTICLE MANAGEMENT
// ==========================================

// A. Kubona izitarasuzumwa (Pending)
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

// B. Kubona izemejwe (Approved)
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

// C. Kwemeza inkuru (Approve)
router.put('/articles/:id/approve', [auth, admin], async (req, res) => {
    try {
        const article = await Article.findByIdAndUpdate(
            req.params.id, 
            { status: 'Approved' }, 
            { new: true }
        );
        if (!article) return res.status(404).json({ msg: 'Inkuru ntabonetse' });
        res.json(article);
    } catch (err) { 
        res.status(500).send('Server Error'); 
    }
});

// D. Gusiba Inkuru
router.delete('/articles/:id', [auth, admin], async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Inkuru ntabonetse' });
        res.json({ msg: 'Inkuru yasibwe' });
    } catch (err) { res.status(500).send('Server Error'); }
});

// ==========================================
// 2. ADS MANAGEMENT
// ==========================================

// A. Kohereza Ad Nshya
router.post('/ads', [auth, admin, upload.single('mediaFile')], async (req, res) => {
    const { title, description, mediaType, placement } = req.body;
    // req.file.path itanga URL yuzuye ya Cloudinary (https://...)
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
        console.error(err.message); 
        res.status(500).send('Server Error: Ad upload failed');
    }
});

// B. Kubona Ads zose kuri Admin
router.get('/ads', [auth, admin], async (req, res) => {
    try {
        const ads = await Ads.find().sort({ createdAt: -1 });
        res.json(ads);
    } catch (err) { res.status(500).send('Server Error'); }
});

// C. Gusiba Ad
router.delete('/ads/:id', [auth, admin], async (req, res) => {
    try {
        const ad = await Ads.findByIdAndDelete(req.params.id);
        if (!ad) return res.status(404).json({ msg: 'Ad ntabonetse' });
        res.json({ msg: 'Ad yasibwe' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
