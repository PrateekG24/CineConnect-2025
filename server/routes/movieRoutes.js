const express = require('express');
const router = express.Router();
const {
  getPopularMovies,
  getTrendingMovies,
  getPopularTVShows,
  getTrendingTVShows,
  getMovieDetails,
  getTVShowDetails,
  searchMedia,
  getMediaReviews
} = require('../controllers/movieController');

// Movies routes
router.get('/popular', getPopularMovies);
router.get('/trending/:timeWindow', getTrendingMovies);
router.get('/search', searchMedia);
router.get('/:id', getMovieDetails);
router.get('/:type/:id/reviews', getMediaReviews);

// TV Shows routes
router.get('/tv/popular', getPopularTVShows);
router.get('/tv/trending/:timeWindow', getTrendingTVShows);
router.get('/tv/:id', getTVShowDetails);

module.exports = router; 