import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-text">
          Oops! The page you're looking for isn't here.
        </p>
        <p className="not-found-subtext">
          It might have been moved, deleted, or perhaps never existed.
        </p>
        <Link to="/" className="btn not-found-btn">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
