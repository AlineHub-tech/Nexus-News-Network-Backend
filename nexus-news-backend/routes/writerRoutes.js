// server/routes/writerRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Article = require('../models/Article'); 
const auth = require('../middleware/auth'); 

// 1. Configure Cloudinary (Isoma amakuru muri .env yawe)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Tegura Cloudinary Storage aho kubika muri 'uploads/' folder
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'nexus-news-uploads',
      resource_type: 'auto', // Ibi bituma amavideo n'amafoto byose bikora
      upload_preset: 'nexus_news_preset', // Izina rya preset washyize mu buryo bwa 'Unsigned'
      public_id: `writer-${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage: storage });

// POST /api/writer/articles: Umwanditsi yohereza inkuru nshya
router.post('/articles', [auth, upload.single('mediaFile')], async (req, res) => {
  // Twakosoye 'body' hano tuyigira 'content' kugira ngo bihuze na model na dashboard
  const { title, content, category, mediaType } = req.body;
  
  // Cloudinary itanga URL yuzuye (https://res.cloudinary.com...) muri req.file.path
  const mediaUrl = req.file ? req.file.path : null;

  try {
    const newArticle = new Article({
      title, 
      content, // Ibi bigomba guhura n'ibiri mu model yawe
      category, 
      mediaUrl, 
      mediaType,
      author: req.user.username, 
      status: 'pending', // Irahita ijya muri pending kugeza admin ayemeje
    });

    const article = await newArticle.save();
    res.status(201).json(article);
  } catch (err) {
    console.error("Submission Error:", err.message); 
    res.status(500).json({ msg: 'Habaye ikibazo mu kubika inkuru', error: err.message });
  }
});

module.exports = router;
