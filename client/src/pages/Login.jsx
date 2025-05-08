import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { userAPI } from "../services/api";
import Alert from "../components/Alert";
import "./Auth.css";

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authErrorMessage, setAuthErrorMessage] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  // Check for auth errors in localStorage
  useEffect(() => {
    const errorMessage = localStorage.getItem("auth_error");
    if (errorMessage) {
      setAuthErrorMessage(errorMessage);
      // Remove the message after retrieving it
      localStorage.removeItem("auth_error");
    }
  }, []);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await userAPI.login({ email, password });

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data));

      // Update user state in App
      setUser(response.data);

      // Navigate to previous page or home
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>

        {error && <Alert type="danger" message={error} />}
        {authErrorMessage && <Alert type="danger" message={authErrorMessage} />}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-block" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
