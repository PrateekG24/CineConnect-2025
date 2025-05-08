import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userAPI, getImageUrl } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import "./MyReviews.css";

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getUserReviews();
        setReviews(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load your reviews. Please try again later.");
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      setDeleteLoading(reviewId);
      await userAPI.deleteReview(reviewId);
      setReviews(reviews.filter((review) => review._id !== reviewId));
      setDeleteLoading(null);
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete the review. Please try again.");
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="my-reviews-page">
      <div className="container">
        <h1 className="page-title">My Reviews</h1>

        {error && <Alert type="danger" message={error} />}

        {reviews.length === 0 ? (
          <div className="no-reviews-message">
            <p>You haven't written any reviews yet.</p>
            <Link to="/" className="btn">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div className="review-item" key={review._id}>
                <div className="review-media-info">
                  <Link to={`/${review.mediaType}/${review.mediaId}`}>
                    <img
                      src={
                        review.mediaPoster
                          ? getImageUrl.poster(review.mediaPoster)
                          : "/placeholder.jpg"
                      }
                      alt={review.mediaTitle}
                      className="review-poster"
                    />
                  </Link>
                  <div className="review-media-details">
                    <Link
                      to={`/${review.mediaType}/${review.mediaId}`}
                      className="review-media-title"
                    >
                      {review.mediaTitle}
                    </Link>
                    <div className="review-date">
                      Reviewed on{" "}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                    <div className="review-rating">
                      Your Rating:{" "}
                      <span className="rating-value">{review.rating}/10</span>
                    </div>
                  </div>
                </div>

                <div className="review-content">{review.content}</div>

                <div className="review-actions">
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteReview(review._id)}
                    disabled={deleteLoading === review._id}
                  >
                    {deleteLoading === review._id
                      ? "Deleting..."
                      : "Delete Review"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
