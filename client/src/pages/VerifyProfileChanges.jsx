import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import "./Auth.css";

const VerifyProfileChanges = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyProfileChanges = async () => {
      try {
        setLoading(true);
        const response = await userAPI.verifyEmail(token);
        setSuccess(true);
        setError(null);

        // Clear any logged in user data to force re-login with new credentials
        localStorage.removeItem("user");

        // Set success message in local storage to display on login screen
        localStorage.setItem(
          "auth_success",
          response.data.message ||
            "Profile changes successfully applied! Please log in with your updated credentials."
        );
      } catch (err) {
        console.error("Verification error:", err);
        setSuccess(false);
        setError(
          err.response?.data?.message ||
            "Failed to verify profile changes. The link may be invalid or expired."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyProfileChanges();
    } else {
      setError("Invalid verification link");
      setLoading(false);
    }
  }, [token]);

  const handleRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Profile Changes Verification</h1>

        {loading ? (
          <div className="center-content">
            <LoadingSpinner />
            <p>Verifying your profile changes...</p>
          </div>
        ) : success ? (
          <div className="center-content">
            <div className="success-icon">✓</div>
            <h2>Verification Successful!</h2>
            <p>Your profile changes have been applied successfully.</p>
            <p>Please log in again with your updated credentials.</p>
            <button
              onClick={handleRedirect}
              className="primary-btn"
              style={{ marginTop: "20px" }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <div className="center-content">
            <div className="error-icon">✗</div>
            <h2>Verification Failed</h2>
            <Alert type="danger" message={error} />
            <p>Please try logging in and requesting a new verification link.</p>
            <button
              onClick={handleRedirect}
              className="primary-btn"
              style={{ marginTop: "20px" }}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyProfileChanges;
