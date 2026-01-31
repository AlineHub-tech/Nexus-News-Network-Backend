const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Article = require('../models/Article'); 
const auth = require('../middleware/auth'); 

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
      upload_preset: 'nexus_news_preset', // Emeza ko ari 'Unsigned' muri Cloudinary
      public_id: `writer-${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage: storage });

// POST /api/writer/articles: Kohereza inkuru nshya
router.post('/articles', [auth, upload.single('mediaFile')], async (req, res) => {
  const { title, content, category, mediaType } = req.body;
  const mediaUrl = req.file ? req.file.path : null;

  try {
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
