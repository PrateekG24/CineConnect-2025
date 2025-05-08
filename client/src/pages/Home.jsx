import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { movieAPI, tvAPI, getImageUrl } from "../services/api";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import "./Home.css";

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch trending movies
        const trendingRes = await movieAPI.getTrending();
        setTrendingMovies(trendingRes.data.results);

        // Set random featured movie from trending
        if (trendingRes.data.results.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * Math.min(5, trendingRes.data.results.length)
          );
          setFeaturedMovie(trendingRes.data.results[randomIndex]);
        }

        // Fetch popular movies
        const popularMoviesRes = await movieAPI.getPopular();
        setPopularMovies(popularMoviesRes.data.results);

        // Fetch popular TV shows
        const popularTVRes = await tvAPI.getPopular();
        setPopularTVShows(popularTVRes.data.results);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError(
          "Failed to fetch movies and TV shows. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert type="danger" message={error} />;
  }

  return (
    <div className="home-page">
      {/* Hero section */}
      {featuredMovie && (
        <div
          className="hero"
          style={{
            backgroundImage: `url(${getImageUrl.backdrop(
              featuredMovie.backdrop_path
            )})`,
          }}
        >
          <div className="hero-overlay">
            <h1 className="hero-title">{featuredMovie.title}</h1>
            <p className="hero-overview">{featuredMovie.overview}</p>
            <div className="hero-buttons">
              <Link to={`/movie/${featuredMovie.id}`} className="btn">
                View Details
              </Link>
              <a href="#trending" className="btn btn-secondary">
                Trending Now
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        {/* Trending Movies Section */}
        <section id="trending" className="movie-section">
          <div className="section-header">
            <h2 className="section-title">Trending Movies</h2>
            <Link to="/movies" className="section-link">
              View All
            </Link>
          </div>
          <div className="movie-grid">
            {trendingMovies.slice(0, 8).map((movie) => (
              <MovieCard
                key={movie.id}
                media={{ ...movie, media_type: "movie" }}
              />
            ))}
          </div>
        </section>

        {/* Popular Movies Section */}
        <section className="movie-section">
          <div className="section-header">
            <h2 className="section-title">Popular Movies</h2>
            <Link to="/movies" className="section-link">
              View All
            </Link>
          </div>
          <div className="movie-grid">
            {popularMovies.slice(0, 8).map((movie) => (
              <MovieCard
                key={movie.id}
                media={{ ...movie, media_type: "movie" }}
              />
            ))}
          </div>
        </section>

        {/* Popular TV Shows Section */}
        <section className="movie-section">
          <div className="section-header">
            <h2 className="section-title">Popular TV Shows</h2>
            <Link to="/tv" className="section-link">
              View All
            </Link>
          </div>
          <div className="movie-grid">
            {popularTVShows.slice(0, 8).map((show) => (
              <MovieCard key={show.id} media={{ ...show, media_type: "tv" }} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
