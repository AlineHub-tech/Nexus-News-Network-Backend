const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Article = require('../models/Article'); 
const auth = require('../middleware/auth'); 

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true 
});

// 2. KOSORA HANO: Kugira ngo Multer imenye ko harimo Videos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // IYI NIYO NGOMBWA: Igena niba ari video cyangwa ishusho
    const isVideo = file.mimetype.startsWith('video');
    return {
      folder: 'nexus-news-uploads',
      resource_type: isVideo ? 'video' : 'image', // KOSORA HANO!
      public_id: `writer-${Date.now()}`,
      // Ongeraho 'chunk_size' niba video ari nini (7.75MB isawa ariko chunks zirinda reset)
      chunk_size: 6000000 
    };
  },
});

// Ongeraho imipaka (Limits) kugira ngo Render itaza gufunga connection
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // Emera kugeza kuri 50MB
});

// POST /api/writer/articles
router.post('/articles', [auth, upload.single('mediaFile')], async (req, res) => {
  try {
    const { title, content, category, mediaType } = req.body;
    
    // Niba req.file ihari, 'path' ni URL ya Cloudinary
    const mediaUrl = req.file ? req.file.path : null;

    if (!title || !content) {
      return res.status(400).json({ msg: "Nyamuneka uzuza title na content" });
    }

    const newArticle = new Article({
      title, 
      content, 
      category, 
      mediaUrl, 
      mediaType: mediaType || (req.file?.mimetype?.startsWith('video') ? 'video' : 'image'),
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
