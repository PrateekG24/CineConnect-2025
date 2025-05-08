import { useState, useEffect } from "react";
import { movieAPI } from "../services/api";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import "./Movies.css";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState("popular"); // popular or trending

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;

        if (filterType === "popular") {
          response = await movieAPI.getPopular(currentPage);
        } else if (filterType === "trending") {
          response = await movieAPI.getTrending("day");
          // Trending endpoint doesn't support pagination in the same way
          setCurrentPage(1);
        }

        setMovies(response.data.results);
        setTotalPages(Math.min(response.data.total_pages || 1, 10)); // Limit to 10 pages

        setLoading(false);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies. Please try again later.");
        setLoading(false);
      }
    };

    fetchMovies();

    // Scroll to top when page changes
    window.scrollTo(0, 0);
  }, [currentPage, filterType]);

  const handleFilterChange = (type) => {
    if (type !== filterType) {
      setFilterType(type);
      setCurrentPage(1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading && movies.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="movies-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Movies</h1>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${
                filterType === "popular" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("popular")}
            >
              Popular
            </button>
            <button
              className={`filter-tab ${
                filterType === "trending" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("trending")}
            >
              Trending
            </button>
          </div>
        </div>

        {error && <Alert type="danger" message={error} />}

        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              media={{ ...movie, media_type: "movie" }}
            />
          ))}
        </div>

        {/* Pagination - only show for popular, not for trending */}
        {!loading && movies.length > 0 && filterType === "popular" && (
          <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Previous
            </button>

            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {loading && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default Movies;
