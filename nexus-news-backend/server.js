const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

// Tegura .env variables
dotenv.config();

// Huza na Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS CONFIGURATION (YAKOSOWE) ---
const allowedOrigins = [
  'https://nexus-news-network.vercel.app', 
  'https://nexus-news-network-dmzpo7t4c-umugwaneza-aline-s-projects.vercel.app', 
  'http://localhost:5173', // IYI NIYO VITE IKORESHA (INGENZI CYANE)
  'http://localhost:3000', 
  'http://localhost:5000'
];

app.use(cors({
    origin: function (origin, callback) {
      // Niba nta origin ihari (nka Postman) cyangwa iri muri allowedOrigins
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token']
}));

app.use(express.json());

// --- MEDIA STORAGE ---
// Twakuyeho code irema folder ya 'uploads' kuko ubu amadosiye ajya kuri Cloudinary.
// Ibi bituma seriveri ya Render idatinda gutangira (Fast Boot).

// Import Routes
const publicRoutes = require('./routes/publicRoutes');
const writerRoutes = require('./routes/writerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

// Koresha Inzira (Routes)
app.use('/api/public', publicRoutes);
app.use('/api/writer', writerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Root URL
app.get('/', (req, res) => {
    res.send(`Nexus News Network API is live on port ${PORT}`);
});

// Gukora Listen kuri Port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
