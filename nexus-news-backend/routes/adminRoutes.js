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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Tegura Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nexus-news-uploads',
    // Hano twakuyemo format: 'jpg' kugira ngo na Videos zibashe kwakirwa neza
    resource_type: 'auto', 
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});
const upload = multer({ storage: storage });

// --- ADS MANAGEMENT (YAKOSOWE) ---

// 1. Kohereza Ad Nshya (Harimo Placement & mediaUrl)
router.post('/ads', [auth, admin, upload.single('mediaFile')], async (req, res) => {
    // HANO NIHO HAKOSOWE: Twongereye 'placement'
    const { title, description, mediaType, placement } = req.body;
    const mediaUrl = req.file ? req.file.path : null; 

    try {
        const newAd = new Ads({ 
            title, 
            description, 
            mediaUrl, 
            mediaType, 
            placement: placement || 'slider', // Ibi ni ingenzi kuri Frontend
            isActive: true 
        });
        const savedAd = await newAd.save();
        res.status(201).json(savedAd);
    } catch (err) {
        console.error(err.message); 
        res.status(500).send('Server Error: Ad upload failed');
    }
});

// 2. Gusiba Ad (Yakosowe)
router.delete('/ads/:id', [auth, admin], async (req, res) => {
    try {
        const ad = await Ads.findByIdAndDelete(req.params.id);
        if (!ad) return res.status(404).json({ msg: 'Ad ntabonetse' });
        res.json({ msg: 'Ad yasibwe neza' });
    } catch (err) { 
        console.error(err.message); 
        res.status(500).send('Server Error'); 
    }
});

// 3. Kubona Ads zose
router.get('/ads', [auth, admin], async (req, res) => {
    try {
        const ads = await Ads.find().sort({ createdAt: -1 });
        res.json(ads);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// --- ARTICLE MANAGEMENT (YAKOSOWE) ---

// Guhamagara inkuru zemejwe (Case Sensitive Fix)
router.get('/approved-articles', [auth, admin], async (req, res) => {
    try {
        // Hano twongereye 'Approved' kugira ngo ihure n'uko state ya Frontend ibishaka
        const articles = await Article.find({ 
            $or: [{ status: 'approved' }, { status: 'Approved' }] 
        }).sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Kwemeza inkuru (Approved Fix)
router.put('/articles/:id/approve', [auth, admin], async (req, res) => {
    try {
        // Hindura uburyo ubyandika bibe 'Approved'
        const article = await Article.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
        if (!article) return res.status(404).json({ msg: 'Inkuru ntabonetse' });
        res.json(article);
    } catch (err) { 
        res.status(500).send('Server Error'); 
    }
});

// Gusiba Inkuru
router.delete('/articles/:id', [auth, admin], async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Inkuru ntabonetse' });
        res.json({ msg: 'Inkuru yasibwe' });
    } catch (err) { 
        res.status(500).send('Server Error'); 
    }
});

module.exports = router;
