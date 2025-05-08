import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import "./Auth.css";

const VerifyEmail = ({ setUser }) => {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        setVerifying(true);
        setError(null);

        const response = await userAPI.verifyEmail(token);

        // If verification successful, update the user object
        if (response.data && response.data.success) {
          // Get current user from localStorage
          const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

          // Update verification status
          const updatedUser = {
            ...existingUser,
            isEmailVerified: true,
            pendingEmail: null, // Clear any pending email change
          };

          // Save updated user to localStorage
          localStorage.setItem("user", JSON.stringify(updatedUser));

          // Update application state if setUser function is provided
          if (setUser) {
            setUser(updatedUser);
          }

          // Get latest profile data to ensure everything is in sync
          try {
            const profileResponse = await userAPI.getProfile();
            if (profileResponse.data) {
              const freshUserData = {
                ...updatedUser,
                ...profileResponse.data,
                token: updatedUser.token, // Keep the existing token
              };
              localStorage.setItem("user", JSON.stringify(freshUserData));
              if (setUser) {
                setUser(freshUserData);
              }
            }
          } catch (profileErr) {
            console.error("Error fetching fresh profile data:", profileErr);
            // Continue with existing updated user data
          }
        }

        setSuccess(true);
        setVerifying(false);

        // Redirect to profile page after delay
        setTimeout(() => {
          navigate("/profile");
        }, 3000);
      } catch (err) {
        console.error("Email verification error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to verify email. The link may be invalid or expired."
        );
        setVerifying(false);
      }
    };

    if (token) {
      verifyEmailToken();
    } else {
      setError("Invalid verification link");
      setVerifying(false);
    }
  }, [token, navigate, setUser]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Email Verification</h1>

        {verifying && (
          <div className="verification-status">
            <LoadingSpinner />
            <p>Verifying your email address...</p>
          </div>
        )}

        {error && (
          <div className="verification-status">
            <Alert type="danger" message={error} />
            <p className="mt-4">
              If your verification link has expired, you can{" "}
              <button
                className="text-link"
                onClick={() => navigate("/profile")}
              >
                request a new verification email
              </button>{" "}
              from your profile page.
            </p>
          </div>
        )}

        {success && (
          <div className="verification-status">
            <Alert
              type="success"
              message="Your email has been successfully verified!"
            />
            <p className="mt-4">
              You will be redirected to your profile page shortly...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
