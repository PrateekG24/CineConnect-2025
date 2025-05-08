const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

// Get popular movies
const getPopularMovies = async (page = 1) => {
  try {
    // Using discover endpoint with parameters optimized for all-time popular movies
    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: API_KEY,
        page,
        sort_by: 'vote_average.desc,popularity.desc',
        'vote_count.gte': 10000,  // Only include movies with significant number of votes
        'primary_release_date.lte': '2023-12-31', // Include movies released up to end of 2023
        'primary_release_date.gte': '1900-01-01', // Include movies from 1900 onwards
        include_adult: false,
        include_video: false,
        with_watch_monetization_types: 'flatrate'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

// Get trending movies
const getTrendingMovies = async (timeWindow = 'day') => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/${timeWindow}`, {
      params: {
        api_key: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
};

// Get trending TV shows
const getTrendingTVShows = async (timeWindow = 'day') => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/tv/${timeWindow}`, {
      params: {
        api_key: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    throw error;
  }
};

// Get popular TV shows
const getPopularTVShows = async (page = 1) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
      params: {
        api_key: API_KEY,
        page
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    throw error;
  }
};

// Get movie details
const getMovieDetails = async (movieId) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: API_KEY,
        append_to_response: 'videos,credits,recommendations,reviews'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    throw error;
  }
};

// Get TV show details
const getTVShowDetails = async (tvId) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/${tvId}`, {
      params: {
        api_key: API_KEY,
        append_to_response: 'videos,credits,recommendations,reviews'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching TV show details for ID ${tvId}:`, error);
    throw error;
  }
};

// Search for movies and TV shows
const searchMedia = async (query, page = 1, mediaType = null) => {
  try {
    // If a specific media type is requested, use the appropriate endpoint
    const endpoint = mediaType ? `search/${mediaType}` : 'search/multi';

    const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, {
      params: {
        api_key: API_KEY,
        query,
        page
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching media:', error);
    throw error;
  }
};

// Get movie/TV show reviews
const getReviews = async (mediaId, mediaType = 'movie', page = 1) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/${mediaType}/${mediaId}/reviews`, {
      params: {
        api_key: API_KEY,
        page
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for ${mediaType} ID ${mediaId}:`, error);
    throw error;
  }
};

module.exports = {
  getPopularMovies,
  getTrendingMovies,
  getTrendingTVShows,
  getPopularTVShows,
  getMovieDetails,
  getTVShowDetails,
  searchMedia,
  getReviews
}; 