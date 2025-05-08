const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Load config
const config = require('./config/config');

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [config.CLIENT_URL] // Whitelist the client URL in production
    : '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));

//Built-in middleware that reads incoming requests with a JSON payload and makes the parsed object available on req.body
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('CineConnect API is running');
});

// Server status route for health checks
app.get('/status', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Client URL set to: ${config.CLIENT_URL}`);
}); 