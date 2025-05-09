import axios from 'axios';

// Use environment variable for API URL with fallback to local development URL
const API_URL = import.meta.env.VITE_API_URL || 'https://cineconnect-api.onrender.com/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

console.log('API URL:', API_URL); // Debug API URL

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Set auth token for all requests if exists
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user'))
      : null;

    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
      // Log truncated token for debugging (don't log full token for security)
      console.log(`Adding auth token to ${config.url}: ${user.token.substring(0, 10)}...`);
    } else {
      console.log(`No auth token for request to ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error(`API Error (${error.config?.url}):`, error.message);

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server may be down');
      return Promise.reject(new Error('Server request timed out. Please try again later.'));
    }

    // Network error
    if (!error.response) {
      console.error('Network error - no response received');
      return Promise.reject(new Error('Network error. Please check your connection and try again.'));
    }

    // Check for auth errors
    if (error.response) {
      // Case 1: Direct invalid signature error
      const hasInvalidSignature =
        error.response.data?.error === "invalid signature" ||
        error.response.data?.message?.includes("token failed") ||
        error.response.data?.message?.includes("Not authorized");

      // Case 2: 401 Unauthorized status
      if (error.response.status === 401) {
        console.error("Auth error detected:", error.response.data);

        // Clear user data from localStorage
        localStorage.removeItem("user");

        // Set detailed error message to display on login screen
        localStorage.setItem("auth_error",
          `Authentication failed: ${error.response.data?.message || 'Session expired'}. Please log in again.`);

        // Only redirect if not already on login page to prevent redirect loops
        if (!window.location.pathname.includes('/login')) {
          window.location.href = "/login";
          return Promise.reject(new Error("Authentication failed. Redirecting to login..."));
        }
      }
    }

    return Promise.reject(error);
  }
);

// API methods for movies
export const movieAPI = {
  getPopular: (page = 1) => api.get(`/movies/popular?page=${page}`),
  getTrending: (timeWindow = 'day') => api.get(`/movies/trending/${timeWindow}`),
  getDetails: (id) => api.get(`/movies/${id}`),
  getReviews: (id, type = 'movie', page = 1) => api.get(`/movies/${type}/${id}/reviews?page=${page}`),
  search: (query, page = 1) => api.get(`/movies/search?query=${query}&page=${page}`),
};

// API methods for TV shows
export const tvAPI = {
  getPopular: (page = 1) => api.get(`/movies/tv/popular?page=${page}`),
  getTrending: (timeWindow = 'day') => api.get(`/movies/tv/trending/${timeWindow}`),
  getDetails: (id) => api.get(`/movies/tv/${id}`),
  getReviews: (id, page = 1) => api.get(`/movies/tv/${id}/reviews?page=${page}`),
  search: (query, page = 1) => api.get(`/movies/search?query=${query}&page=${page}&type=tv`),
};

// API methods for users
export const userAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (userData) => api.post('/users/login', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  resendVerification: () => api.post('/users/resend-verification'),
  verifyEmail: (token) => api.get(`/users/verify-email/${token}`),
  getWatchlist: () => api.get('/users/watchlist'),
  addToWatchlist: (mediaId, mediaType, title, posterPath) =>
    api.post('/users/watchlist', { mediaId, mediaType, title, posterPath }),
  removeFromWatchlist: (mediaId) =>
    api.delete(`/users/watchlist/${mediaId}`),
  submitReview: (mediaId, mediaType, data) =>
    api.post('/reviews', { mediaId, mediaType, ...data }),
  getUserReviews: () => api.get('/reviews'),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// Helper functions for image URLs
export const getImageUrl = {
  poster: (path, size = 'w500') =>
    path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : '/placeholder-poster.jpg',
  backdrop: (path, size = 'original') =>
    path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : '/placeholder-backdrop.jpg',
  profile: (path, size = 'w185') =>
    path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : '/placeholder-profile.jpg',
};

export default api; 