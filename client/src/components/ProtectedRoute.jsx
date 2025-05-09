import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ user, children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Simple token validation
    const validateUserToken = () => {
      try {
        // Check if user exists and has a token
        if (!user || !user.token) {
          console.log("No user or token found");
          setIsValid(false);
          return;
        }

        // Basic JWT structure validation
        const parts = user.token.split(".");
        if (parts.length !== 3) {
          console.error("Invalid token format");
          setIsValid(false);
          return;
        }

        // Check token expiration
        try {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);

          if (payload.exp && payload.exp < currentTime) {
            console.error("Token expired");
            localStorage.removeItem("user");
            localStorage.setItem(
              "auth_error",
              "Your session has expired. Please log in again."
            );
            setIsValid(false);
            return;
          }

          setIsValid(true);
        } catch (parseError) {
          console.error("Error parsing token:", parseError);
          setIsValid(false);
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateUserToken();
  }, [user]);

  // Show loading state during validation
  if (isValidating) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          flexDirection: "column",
        }}
      >
        <LoadingSpinner />
        <p style={{ marginTop: "20px" }}>Verifying your access...</p>
      </div>
    );
  }

  // Redirect if no valid user token
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in with valid token, render the protected content
  return children;
};

export default ProtectedRoute;
