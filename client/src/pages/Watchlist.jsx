import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userAPI, getImageUrl } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import "./Watchlist.css";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await userAPI.getWatchlist();

        // Sort watchlist by date added (newest first)
        const sortedWatchlist = response.data.sort((a, b) => {
          return new Date(b.added_at) - new Date(a.added_at);
        });

        setWatchlist(sortedWatchlist);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching watchlist:", err);
        setError("Failed to load your watchlist. Please try again later.");
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  const handleRemoveItem = async (mediaId) => {
    try {
      setRemovingId(mediaId);

      await userAPI.removeFromWatchlist(mediaId);

      // Update watchlist state
      setWatchlist(
        watchlist.filter((item) => item.mediaId !== parseInt(mediaId))
      );

      setSuccessMessage("Item removed from watchlist");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      setError("Failed to remove item from watchlist");
      setTimeout(() => setError(null), 3000);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="watchlist-page">
      <div className="container">
        <h1 className="watchlist-title">My Watchlist</h1>

        {error && <Alert type="danger" message={error} />}
        {successMessage && <Alert type="success" message={successMessage} />}

        {watchlist.length === 0 ? (
          <div className="watchlist-empty">
            <p>Your watchlist is empty.</p>
            <p>
              Start adding movies and TV shows to keep track of what you want to
              watch!
            </p>
            <div className="watchlist-actions">
              <Link to="/movies" className="btn">
                Browse Movies
              </Link>
              <Link to="/tv" className="btn btn-secondary">
                Browse TV Shows
              </Link>
            </div>
          </div>
        ) : (
          <div className="watchlist-grid">
            {watchlist.map((item) => (
              <div
                key={`${item.mediaType}-${item.mediaId}`}
                className="watchlist-item"
              >
                <div className="watchlist-poster-container">
                  <img
                    src={getImageUrl.poster(item.poster_path)}
                    alt={item.title}
                    className="watchlist-poster"
                  />
                  <div className="watchlist-item-overlay">
                    <Link
                      to={`/${item.mediaType}/${item.mediaId}`}
                      className="btn btn-sm"
                    >
                      View Details
                    </Link>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleRemoveItem(item.mediaId)}
                      disabled={removingId === item.mediaId}
                    >
                      {removingId === item.mediaId ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
                <div className="watchlist-item-content">
                  <h3 className="watchlist-item-title">
                    <Link to={`/${item.mediaType}/${item.mediaId}`}>
                      {item.title}
                    </Link>
                  </h3>
                  <span className="watchlist-item-type">
                    {item.mediaType === "movie" ? "Movie" : "TV Show"}
                  </span>
                  <span className="watchlist-item-date">
                    Added: {new Date(item.added_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
