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

// --- UMUTEKANO: CORS configuration ---
// Twemerera gusa urubuga rwa Vercel kwihuza na API yacu kubera umutekano.
// Mu gihe uri development local, localhost:3000 nayo irakora byikora.
app.use(cors({
    origin: 'https://nexus-news-network.vercel.app'
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
// Turakomeza gukoresha '/api/public' muri Backend kugira ngo bihuze na Frontend
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
