const Review = require('../models/Review');
const tmdbService = require('../services/tmdbService');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { mediaId, mediaType, content, rating } = req.body;

    // Validate input
    if (!mediaId || !mediaType || !content || !rating) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the media exists by fetching its details
    let mediaDetails;
    try {
      if (mediaType === 'movie') {
        mediaDetails = await tmdbService.getMovieDetails(mediaId);
      } else if (mediaType === 'tv') {
        mediaDetails = await tmdbService.getTVShowDetails(mediaId);
      } else {
        return res.status(400).json({ message: 'Invalid media type' });
      }
    } catch (error) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Check if user already has a review for this media
    const existingReview = await Review.findOne({
      user: req.user.id,
      mediaId,
      mediaType
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this title' });
    }

    // Get title and poster path based on media type
    const mediaTitle = mediaType === 'movie' ? mediaDetails.title : mediaDetails.name;
    const mediaPoster = mediaDetails.poster_path;

    // Create new review
    const review = new Review({
      user: req.user.id,
      mediaId,
      mediaType,
      mediaTitle,
      mediaPoster,
      rating,
      content
    });

    await review.save();

    res.status(201).json(review);
  } catch (error) {
    console.error('Error in createReview controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews
// @access  Private
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error in getUserReviews controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the review belongs to the user
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Review.deleteOne({ _id: req.params.id });

    res.json({ message: 'Review removed' });
  } catch (error) {
    console.error('Error in deleteReview controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReview,
  getUserReviews,
  deleteReview
}; 