import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import MovieDetails from "./pages/MovieDetails";
import TVShowDetails from "./pages/TVShowDetails";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Watchlist from "./pages/Watchlist";
import MyReviews from "./pages/MyReviews";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Helper to validate token format and expiration
const isValidToken = (token) => {
  if (!token) return false;

  try {
    // Simple structural validation
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Check payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));

    // Check expiration
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if stored token is at least structurally valid and not expired
    const validateAndLoadUser = () => {
      try {
        const userFromStorage = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user"))
          : null;

        if (userFromStorage && userFromStorage.token) {
          // Validate token structure and expiration
          if (isValidToken(userFromStorage.token)) {
            setUser(userFromStorage);
          } else {
            // Invalid or expired token - clear it
            console.warn(
              "Invalid or expired token found on startup, clearing..."
            );
            localStorage.removeItem("user");
            localStorage.setItem(
              "auth_error",
              "Your session was invalid or expired. Please log in again."
            );
          }
        }
      } catch (error) {
        console.error("Error validating stored token:", error);
        // Clear potentially corrupted data
        localStorage.removeItem("user");
      }
    };

    validateAndLoadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Function to update user state when profile is updated
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} logout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TVShows />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<TVShowDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route
              path="/verify-email/:token"
              element={<VerifyEmail setUser={setUser} />}
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user}>
                  <Profile user={user} updateUser={updateUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/watchlist"
              element={
                <ProtectedRoute user={user}>
                  <Watchlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reviews"
              element={
                <ProtectedRoute user={user}>
                  <MyReviews />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
