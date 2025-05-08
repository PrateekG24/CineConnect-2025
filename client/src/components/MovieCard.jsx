import { Link } from "react-router-dom";
import { getImageUrl } from "../services/api";
import "./MovieCard.css";

const MovieCard = ({ media }) => {
  // Determine if it's a movie or TV show
  const isMovie = media.media_type === "movie" || !media.media_type;
  const isTv = media.media_type === "tv";

  // Prepare link path based on media type
  const linkPath = isMovie
    ? `/movie/${media.id}`
    : isTv
    ? `/tv/${media.id}`
    : "#";

  // Get title based on media type
  const title = isMovie
    ? media.title
    : isTv
    ? media.name
    : media.title || media.name || "Unknown Title";

  // Get release date based on media type
  const releaseDate = isMovie
    ? media.release_date
    : isTv
    ? media.first_air_date
    : media.release_date || media.first_air_date || "";

  // Format the release year if available
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : "";

  // Get poster path or use default
  const posterPath = getImageUrl.poster(media.poster_path);

  // Get vote average and format it to one decimal place if available
  const rating = media.vote_average
    ? (Math.round(media.vote_average * 10) / 10).toFixed(1)
    : "";

  return (
    <div className="movie-card">
      <Link to={linkPath} className="movie-card-link">
        <div className="movie-card-img-container">
          <img src={posterPath} alt={title} className="movie-card-img" />
          {rating && (
            <div className="movie-card-rating">
              <span>{rating}</span>
            </div>
          )}
        </div>
        <div className="movie-card-content">
          <h3 className="movie-card-title">{title}</h3>
          {releaseYear && <p className="movie-card-year">{releaseYear}</p>}
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
