import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ user, logout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle scroll event to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <h1>CineConnect</h1>
          </Link>
        </div>

        <div className="navbar-toggle" onClick={toggleMobileMenu}>
          <div className={`toggle-icon ${isMobileMenuOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <ul className={`navbar-menu ${isMobileMenuOpen ? "active" : ""}`}>
          <li>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/movies" onClick={() => setIsMobileMenuOpen(false)}>
              Movies
            </Link>
          </li>
          <li>
            <Link to="/tv" onClick={() => setIsMobileMenuOpen(false)}>
              TV Shows
            </Link>
          </li>
          {user ? (
            <>
              {/* <li className="mobile-only">
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  My Profile
                </Link>
              </li> */}
              <li>
                <Link
                  to="/watchlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Watchlist
                </Link>
              </li>
              <li>
                <Link
                  to="/my-reviews"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Reviews
                </Link>
              </li>
              <li className="mobile-only">
                <button
                  className="logout-btn"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="register-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-right">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search movies & TV shows"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <i className="fas fa-search">🔍</i>
            </button>
          </form>

          {user && (
            <div className="user-dropdown" ref={dropdownRef}>
              <button className="user-dropdown-btn" onClick={toggleDropdown}>
                <span className="user-icon">👤</span>
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
