import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { movieAPI } from "../services/api";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import "./Search.css";

const Search = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [submitQuery, setSubmitQuery] = useState(searchQuery);

  // Effect to handle search from URL parameter
  useEffect(() => {
    if (searchQuery) {
      setSearchTerm(searchQuery);
      setSubmitQuery(searchQuery);
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // Effect to handle search execution
  useEffect(() => {
    if (!submitQuery) {
      return;
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await movieAPI.search(submitQuery, currentPage);
        setResults(response.data.results);
        setTotalPages(Math.min(response.data.total_pages, 10)); // Limit to 10 pages

        setLoading(false);
      } catch (err) {
        console.error("Error searching:", err);
        setError("Failed to search. Please try again later.");
        setLoading(false);
      }
    };

    performSearch();

    // Scroll to top when page changes
    window.scrollTo(0, 0);
  }, [submitQuery, currentPage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSubmitQuery(searchTerm);
      setCurrentPage(1);

      // Update URL without reloading the page
      const url = new URL(window.location);
      url.searchParams.set("q", searchTerm);
      window.history.pushState({}, "", url);
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

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1 className="page-title">Search</h1>

          <form className="search-form-large" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Search for movies, TV shows, actors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>

        {error && <Alert type="danger" message={error} />}

        {!submitQuery && !loading && (
          <div className="search-empty">
            <p>Enter a search term to find movies and TV shows</p>
          </div>
        )}

        {submitQuery && !loading && results.length === 0 && (
          <div className="search-empty">
            <p>No results found for "{submitQuery}"</p>
            <p>Try a different search term</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="search-results-header">
              <h2 className="results-title">Results for "{submitQuery}"</h2>
              <span className="results-count">
                {/* The actual total count might be higher, but we only know the page count */}
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <div className="search-results-grid">
              {results
                .map((item) => {
                  // Filter out items without a media_type or that are people
                  if (!item.media_type || item.media_type === "person") {
                    return null;
                  }

                  return (
                    <MovieCard
                      key={`${item.media_type}-${item.id}`}
                      media={item}
                    />
                  );
                })
                .filter(Boolean)}
            </div>

            {/* Pagination */}
            {results.length > 0 && (
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
          </>
        )}

        {loading && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default Search;
