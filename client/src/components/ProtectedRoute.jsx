import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    // If user is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, render the protected route
  return children;
};

export default ProtectedRoute;
