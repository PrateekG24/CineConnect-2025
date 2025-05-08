# CineConnect - MERN Stack Movie Website

A movie website built with the MERN stack (MongoDB, Express, React, Node.js) and the TMDB API. The application allows users to browse movies and TV shows, view details, read reviews, get recommendations, and create a personal watchlist.

## Features

- Browse trending and popular movies and TV shows
- View detailed information about movies and TV shows
- Get personalized recommendations
- Read reviews from other users
- Search for specific titles
- User authentication and authorization (login/register)
- Personal watchlist management

## Technologies Used

- **Frontend:**

  - React (with Vite)
  - React Router for navigation
  - Axios for API requests
  - Pure CSS for styling (no frameworks)

- **Backend:**

  - Node.js
  - Express.js
  - MongoDB & Mongoose
  - JWT for authentication
  - bcrypt for password hashing

- **External API:**
  - TMDB (The Movie Database) API

## Prerequisites

- Node.js and npm installed
- MongoDB installed and running
- TMDB API key (get it from [themoviedb.org](https://www.themoviedb.org/documentation/api))

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd cineconnect
```

### 2. Set up environment variables

Create a `.env` file in the `server` directory with the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/moviedb
JWT_SECRET=your_jwt_secret_key
TMDB_API_KEY=your_tmdb_api_key
NODE_ENV=development
```

Replace `your_jwt_secret_key` with a secure random string and `your_tmdb_api_key` with your actual TMDB API key.

### 3. Install backend dependencies and start the server

```bash
cd server
npm install
npm run dev
```

The server will start on http://localhost:5000

### 4. Install frontend dependencies and start the client

In a new terminal:

```bash
cd client
npm install
npm run dev
```

The client will start on http://localhost:5173

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login

### Users

- `GET /api/users/profile` - Get user profile
- `GET /api/users/watchlist` - Get user's watchlist
- `POST /api/users/watchlist` - Add to watchlist
- `DELETE /api/users/watchlist/:mediaId` - Remove from watchlist

### Movies & TV Shows

- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/trending/:timeWindow` - Get trending movies
- `GET /api/movies/search` - Search movies and TV shows
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/:type/:id/reviews` - Get movie or TV show reviews
- `GET /api/movies/tv/popular` - Get popular TV shows
- `GET /api/movies/tv/:id` - Get TV show details

## Project Structure

```
├── client/                # React frontend
│   ├── public/            # Public assets
│   ├── src/               # Source files
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Entry point
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── services/          # External services
│   ├── utils/             # Utility functions
│   ├── .env               # Environment variables
│   ├── package.json
│   └── server.js          # Entry point
│
└── README.md
```

## License

This project is licensed under the MIT License.
