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
    resource_type: 'auto', 
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});
const upload = multer({ storage: storage });

// --- ADS MANAGEMENT ---

// Kohereza Ad Nshya
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
        console.error(err.message); 
        res.status(500).send('Server Error: Ad upload failed');
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

// A. Guhamagara inkuru zemejwe (Zose zanditse 'Approved' mu gutangira)
router.get('/approved-articles', [auth, admin], async (req, res) => {
    try {
        const articles = await Article.find({ status: 'Approved' }).sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// B. KWEMEZA INKURU (Approve)
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

// C. GUHINDURA INKURU (Edit/Update) - Iyi niyo yari ibuzemo
router.put('/articles/:id', [auth, admin, upload.single('image')], async (req, res) => {
    const { title, content, category, author, status } = req.body;
    
    // Tegura amakuru mashya
    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (content) updatedFields.content = content;
    if (category) updatedFields.category = category;
    if (author) updatedFields.author = author;
    if (status) updatedFields.status = status; // Niba ushaka kuyisubiza mu 'Pending' cyangwa kuyigumisha 'Approved'
    if (req.file) updatedFields.imageUrl = req.file.path; // Niba wahinduye ifoto

    try {
        let article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Inkuru ntabonetse' });

        article = await Article.findByIdAndUpdate(
            req.params.id,
            { $set: updatedFields },
            { new: true }
        );
        res.json(article);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: Guhindura inkuru byanze');
    }
});

// D. GUSIBA INKURU
router.delete('/articles/:id', [auth, admin], async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Inkuru ntabonetse' });
        res.json({ msg: 'Inkuru yasibwe neza' });
    } catch (err) { 
        res.status(500).send('Server Error'); 
    }
});

module.exports = router;
