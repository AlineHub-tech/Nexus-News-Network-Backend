// server.js (Uburyo butunganije neza kandi CORS yakosowe)

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Tegura .env variables
dotenv.config();

// Huza na Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares

// --- UMUTEKANO & CORS configuration YAKOSOWE HANO ---

// Tegura adiresi zose zemewe, harimo n'iza Vercel development domains
const allowedOrigins = [
  'https://nexus-news-network.vercel.app', // Adiresi ya Production
  'https://nexus-news-network-dmzpo7t4c-umugwaneza-aline-s-projects.vercel.app', // Urugero rwa Adiresi ya Development
  'http://localhost:3000', // Kuri local development ya frontend
  'http://localhost:5000' // Kuri local development ya backend (localhost nayo ishobora kwihamagara)
];

// Shyiraho CORS Middleware ikoresha izo adiresi zemewe
app.use(cors({
    origin: function (origin, callback) {
      // Emera nta kibazo niba origin itari muri allowedOrigins cyangwa ari undefined (ex: requests ziva muri server)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS')); // Hindura Error msg ikore neza
      }
    }
}));
// ----------------------------------------

app.use(express.json());

// Genzura no kurema folder ya 'uploads' niba idahari
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

// Gutanga serivise y'amafiles yibitse muri folder ya uploads (Images, etc.)
app.use('/uploads', express.static(uploadsDir));

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

// Kugaragaza ubutumwa bw'ikaze kuri root URL '/' (Optional)
app.get('/', (req, res) => {
    res.send(`Nexus News Network API is running on port ${PORT}`);
});

// Gukora Listen kuri Port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
