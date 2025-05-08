const tmdbService = require('../services/tmdbService');

// @desc    Get popular movies
// @route   GET /api/movies/popular
// @access  Public
const getPopularMovies = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const movies = await tmdbService.getPopularMovies(page);
    res.json(movies);
  } catch (error) {
    console.error('Error in getPopularMovies controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get trending movies
// @route   GET /api/movies/trending/:timeWindow
// @access  Public
const getTrendingMovies = async (req, res) => {
  try {
    const { timeWindow } = req.params;
    const validTimeWindows = ['day', 'week'];

    if (!validTimeWindows.includes(timeWindow)) {
      return res.status(400).json({ message: 'Time window must be "day" or "week"' });
    }

    const movies = await tmdbService.getTrendingMovies(timeWindow);
    res.json(movies);
  } catch (error) {
    console.error('Error in getTrendingMovies controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get trending TV shows
// @route   GET /api/movies/tv/trending/:timeWindow
// @access  Public
const getTrendingTVShows = async (req, res) => {
  try {
    const { timeWindow } = req.params;
    const validTimeWindows = ['day', 'week'];

    if (!validTimeWindows.includes(timeWindow)) {
      return res.status(400).json({ message: 'Time window must be "day" or "week"' });
    }

    const tvShows = await tmdbService.getTrendingTVShows(timeWindow);
    res.json(tvShows);
  } catch (error) {
    console.error('Error in getTrendingTVShows controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get popular TV shows
// @route   GET /api/movies/tv/popular
// @access  Public
const getPopularTVShows = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const tvShows = await tmdbService.getPopularTVShows(page);
    res.json(tvShows);
  } catch (error) {
    console.error('Error in getPopularTVShows controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get movie details
// @route   GET /api/movies/:id
// @access  Public
const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await tmdbService.getMovieDetails(id);
    res.json(movie);
  } catch (error) {
    console.error(`Error in getMovieDetails controller for ID ${req.params.id}:`, error);

    // Handle 404 from TMDB API
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get TV show details
// @route   GET /api/movies/tv/:id
// @access  Public
const getTVShowDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const tvShow = await tmdbService.getTVShowDetails(id);
    res.json(tvShow);
  } catch (error) {
    console.error(`Error in getTVShowDetails controller for ID ${req.params.id}:`, error);

    // Handle 404 from TMDB API
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'TV show not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search movies and TV shows
// @route   GET /api/movies/search
// @access  Public
const searchMedia = async (req, res) => {
  try {
    const { query, page = 1, type } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Check if a valid type is provided
    let mediaType = null;
    if (type) {
      const validTypes = ['movie', 'tv'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Type must be "movie" or "tv"' });
      }
      mediaType = type;
    }

    const results = await tmdbService.searchMedia(query, page, mediaType);
    res.json(results);
  } catch (error) {
    console.error('Error in searchMedia controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get reviews for a movie or TV show
// @route   GET /api/movies/:type/:id/reviews
// @access  Public
const getMediaReviews = async (req, res) => {
  try {
    const { type, id } = req.params;
    const page = req.query.page || 1;

    const validTypes = ['movie', 'tv'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Type must be "movie" or "tv"' });
    }

    const reviews = await tmdbService.getReviews(id, type, page);
    res.json(reviews);
  } catch (error) {
    console.error(`Error in getMediaReviews controller for ${req.params.type} ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPopularMovies,
  getTrendingMovies,
  getPopularTVShows,
  getTrendingTVShows,
  getMovieDetails,
  getTVShowDetails,
  searchMedia,
  getMediaReviews
}; 