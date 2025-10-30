require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Import controllers
const { setOffer, getOffer } = require('./controllers/offerController');
const { uploadLeads } = require('./controllers/leadsController');
const { scoreLeads, getResults, exportResultsCSV } = require('./controllers/scoringController');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads - USE MEMORY STORAGE FOR VERCEL
const upload = multer({ 
  storage: multer.memoryStorage(), // Store files in memory instead of disk
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Lead Scoring API v1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      offer: 'POST /offer - Store product/offer details',
      upload: 'POST /leads/upload - Upload CSV file with leads',
      score: 'POST /score - Run scoring pipeline',
      results: 'GET /results - Get scored leads as JSON',
      export: 'GET /results/csv - Export results as CSV'
    }
  });
});

// API Routes
app.post('/offer', setOffer);
app.get('/offer', getOffer);
app.post('/leads/upload', upload.single('file'), uploadLeads);
app.post('/score', scoreLeads);
app.get('/results', getResults);
app.get('/results/csv', exportResultsCSV);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server (only for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Lead Scoring API running on port ${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    if (!process.env.GROQ_API_KEY) {
      console.warn('⚠️  WARNING: GROQ_API_KEY not set in environment variables');
    }
  });
}

module.exports = app;