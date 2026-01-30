const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  body: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true, 
    // Izi categories zihuye neza n'iziri muri AuthorDashboard
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
    type: String 
  },
  mediaType: { 
    type: String, 
    enum: ['image', 'video'], 
    default: 'image' 
  },
  status: { 
    type: String, 
    // Status yakosowe kugira ngo ihure n'inyuguti nini (Approved) dukoresha muri Admin
    enum: ['pending', 'Pending', 'approved', 'Approved', 'draft', 'deleted'], 
    default: 'Pending' 
  },
  // IYI NI INGENZI: Gushyiraho views bituma Popular/Trending News ikora
  views: {
    type: Number,
    default: 0
  }
},
{
  // Ibi bituma 'createdAt' na 'updatedAt' biza mu buryo bwikora
  timestamps: true 
});

module.exports = mongoose.model('Article', ArticleSchema);
