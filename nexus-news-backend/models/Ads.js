const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  // HANO NIHO HAKOSOWE: Muri React twakoresheje 'mediaUrl' kugira ngo ihuze n'amafoto n'amashusho
  mediaUrl: { 
    type: String 
  },
  mediaType: { 
    type: String, 
    enum: ['image', 'video'], 
    default: 'image' 
  },
  // PLACEMENT: Ibi nibyo bituma imenya niba ijya mu Slider cyangwa Sidebar
  placement: { 
    type: String, 
    enum: ['slider', 'sidebar'], 
    default: 'slider' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, 
{
  timestamps: true // Ibi bituma 'createdAt' na 'updatedAt' biza mu buryo bwikora
});

module.exports = mongoose.model('Ads', AdSchema);
