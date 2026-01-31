const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  // Twahinduye 'body' riba 'content' kugira ngo bihuze neza na Dashboards zose twanditse
  content: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true, 
    enum: [
      'Politics', 'Life', 'Entertainment', 'Culture', 
      'Education', 'Business', 'Opinion', 'Sport', 
      'TV', 'Community'
    ] 
  },
  author: { 
    type: String, 
    required: true 
  },
  mediaUrl: { 
    type: String // Aha niho hazajya URL ya Cloudinary (https://res.cloudinary.com...)
  },
  mediaType: { 
    type: String, 
    enum: ['image', 'video'], 
    default: 'image' 
  },
  status: { 
    type: String, 
    // Twakomeje uburyo bwo kwemera inyuguti nini cyangwa nto (Case-insensitive)
    enum: ['pending', 'Pending', 'approved', 'Approved', 'draft', 'deleted'], 
    default: 'Pending' 
  },
  views: {
    type: Number,
    default: 0
  }
},
{
  timestamps: true // Ibi bishyiraho 'createdAt' na 'updatedAt' byikora
});

// Ibi bituma ishakisha ry'inkuru zemejwe cyangwa izitarasuzumwa ryihuta muri database
ArticleSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Article', ArticleSchema);
