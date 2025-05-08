const express = require('express');
const router = express.Router();
const { createReview, getUserReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Routes for /api/reviews
router.post('/', protect, createReview);
router.get('/', protect, getUserReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router; 