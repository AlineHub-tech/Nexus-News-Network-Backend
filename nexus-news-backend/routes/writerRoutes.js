const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Article = require('../models/Article'); 
const auth = require('../middleware/auth'); 

// 1. Configure Cloudinary - Ongeraho secure: true
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true 
});

// 2. Cloudinary Storage Config - Twakuyeho 'async' kuko bishobora gutinda (timeout)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nexus-news-uploads',
    resource_type: 'auto', 
    upload_preset: 'nexus_news_preset', 
    // Izina rya file ryoroshye ririnda amakosa ya DNS/Protocol
    public_id: (req, file) => `writer-${Date.now()}`
  },
});

const upload = multer({ storage: storage });

// POST /api/writer/articles
router.post('/articles', [auth, upload.single('mediaFile')], async (req, res) => {
  try {
    const { title, content, category, mediaType } = req.body;
    
    // IYI NIYO NGOMBWA: req.file.path ni URL yuzuye ya Cloudinary
    const mediaUrl = req.file ? req.file.path : null;

    if (!title || !content) {
      return res.status(400).json({ msg: "Nyamuneka uzuza title na content" });
    }

    const newArticle = new Article({
      title, 
      content, 
      category, 
      mediaUrl, 
      mediaType,
      author: req.user.username, 
      status: 'Pending', 
    });

    const article = await newArticle.save();
    res.status(201).json(article);
  } catch (err) {
    console.error("Writer Submission Error:", err.message); 
    res.status(500).json({ msg: 'Habaye ikibazo mu kubika inkuru', error: err.message });
  }
});

module.exports = router;
