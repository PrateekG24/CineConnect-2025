import { useState, useEffect, useRef } from "react";
import { userAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import "./Auth.css";

// Add inline styles for new elements
const styles = {
  profileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  refreshBtn: {
    background: "transparent",
    border: "none",
    color: "#e50914",
    fontSize: "24px",
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: "50%",
    transition: "transform 0.3s ease",
  },
  refreshBtnHover: {
    transform: "rotate(180deg)",
    background: "rgba(229, 9, 20, 0.1)",
  },
};

const Profile = ({ user, updateUser }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const profileFetched = useRef(false);

  // Function to manually refresh profile data
  const refreshProfileData = async () => {
    try {
      setFetchingProfile(true);
      setFetchError(null);
      profileFetched.current = false;

      console.log("Manually refreshing profile data...");

      const response = await userAPI.getProfile();
      console.log("Fresh profile data received:", response.data);
      setProfileData(response.data);
      profileFetched.current = true;

      return true;
    } catch (err) {
      console.error("Error refreshing profile:", err);
      setFetchError(
        err.response?.data?.message ||
          "Failed to refresh profile data. Please try again."
      );

      return false;
    } finally {
      setFetchingProfile(false);
    }
  };

  // Fetch the latest user data from the server
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Prevent duplicate fetches
      if (profileFetched.current) return;

      try {
        setFetchingProfile(true);
        setFetchError(null);

        console.log(
          "Fetching user profile with token:",
          user?.token?.substring(0, 10) + "..."
        );

        const response = await userAPI.getProfile();
        console.log("Profile data received:", response.data);
        setProfileData(response.data);
        profileFetched.current = true;

        // Update user in localStorage with the latest data from server
        // But don't trigger another render cycle by updating the context state
        if (updateUser) {
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const updatedUser = {
            ...currentUser,
            isEmailVerified: response.data.isEmailVerified,
            pendingEmail: response.data.pendingEmail || null,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          // Only update app state if needed values are different to prevent loop
          const needsUpdate =
            currentUser.isEmailVerified !== response.data.isEmailVerified ||
            currentUser.pendingEmail !== response.data.pendingEmail;

          if (needsUpdate) {
            updateUser(updatedUser);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        const errorMessage =
          err.response?.data?.message ||
          "Failed to load profile data. Please try logging in again.";
        setFetchError(errorMessage);
        profileFetched.current = true;

        // If there's an authentication error, clear user data and redirect to login
        if (err.response?.status === 401) {
          localStorage.removeItem("user");
          localStorage.setItem(
            "auth_error",
            "Your session has expired. Please log in again."
          );
          window.location.href = "/login";
        }
      } finally {
        setFetchingProfile(false);
      }
    };

    if (user && !profileFetched.current) {
      fetchUserProfile();
    } else if (!user) {
      setFetchingProfile(false);
      setFetchError("User not logged in");
      profileFetched.current = true;
    }
  }, [user]); // Remove updateUser from dependency array

  // Initialize form with user data
  useEffect(() => {
    if (profileData) {
      setUsername(profileData.username || "");
      setEmail(profileData.email || "");
    } else if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user, profileData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setError(null);
    setSuccess(null);

    // Validate form
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Prepare update data - only include fields that have values
    const updateData = {};
    if (username && username !== (profileData?.username || user?.username))
      updateData.username = username;
    if (email && email !== (profileData?.email || user?.email))
      updateData.email = email;
    if (password) {
      updateData.newPassword = password;
      updateData.currentPassword =
        document.getElementById("currentPassword")?.value;

      if (!updateData.currentPassword) {
        setError("Current password is required to set a new password");
        return;
      }
    }

    // Don't submit if no changes
    if (Object.keys(updateData).length === 0) {
      setError("No changes to update");
      return;
    }

    setLoading(true);

    try {
      const response = await userAPI.updateProfile(updateData);

      // Update local user data
      if (updateUser && response.data) {
        const updatedUser = {
          ...user,
          username: response.data.username || user.username,
          email: response.data.email || user.email,
          pendingEmail: response.data.pendingEmail || null,
          isEmailVerified: response.data.isEmailVerified,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        updateUser(updatedUser);
      }

      // Refresh profile data directly instead of making another API call
      if (response.data) {
        setProfileData((prevData) => ({
          ...prevData,
          username: response.data.username || prevData.username,
          email: response.data.email || prevData.email,
          pendingEmail: response.data.pendingEmail || null,
          isEmailVerified: response.data.isEmailVerified,
        }));
      }

      setSuccess(response.data.message || "Profile updated successfully");
      setPassword("");
      setConfirmPassword("");
      document.getElementById("currentPassword").value = "";
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendingVerification(true);
      setError(null);

      const response = await userAPI.resendVerification();
      setSuccess(
        response.data.message || "Verification email sent successfully"
      );
    } catch (err) {
      console.error("Error resending verification:", err);
      setError(
        err.response?.data?.message ||
          "Failed to resend verification email. Please try again."
      );
    } finally {
      setResendingVerification(false);
    }
  };

  // Use server-side verification status rather than cached data
  const isVerified = profileData
    ? profileData.isEmailVerified
    : user?.isEmailVerified;
  const pendingEmailChange = profileData
    ? profileData.pendingEmail
    : user?.pendingEmail;

  // Determine if verification message should be shown based on latest data
  const shouldShowVerification = !isVerified || pendingEmailChange;
  const verificationMessage = pendingEmailChange
    ? `Verification email sent to ${pendingEmailChange}. Please check your inbox.`
    : "Your email is not verified. Please check your inbox for verification email.";

  if (fetchingProfile) {
    return (
      <div className="auth-container">
        <div className="auth-card profile-card">
          <h1>My Profile</h1>
          <div className="center-content">
            <LoadingSpinner />
            <p>Loading your profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="auth-container">
        <div className="auth-card profile-card">
          <h1>My Profile</h1>
          <div className="center-content">
            <Alert type="danger" message={fetchError} />
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/login")}
              style={{ marginTop: "20px" }}
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card profile-card">
        <div style={styles.profileHeader}>
          <h1>My Profile</h1>

          {!fetchingProfile && (
            <button
              style={styles.refreshBtn}
              onClick={refreshProfileData}
              title="Refresh profile data"
              onMouseOver={(e) => {
                Object.assign(e.target.style, styles.refreshBtnHover);
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "none";
                e.target.style.background = "transparent";
              }}
            >
              ↻
            </button>
          )}
        </div>

        {shouldShowVerification && (
          <div className="verification-alert">
            <Alert type="warning" message={verificationMessage} />
            <button
              className="resend-btn"
              onClick={handleResendVerification}
              disabled={resendingVerification}
            >
              {resendingVerification ? (
                <LoadingSpinner small />
              ) : (
                "Resend verification email"
              )}
            </button>
          </div>
        )}

        {error && <Alert type="danger" message={error} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="email-field">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {isVerified && !pendingEmailChange && (
                <span className="verified-badge">✓ Verified</span>
              )}
            </div>
            {pendingEmailChange && (
              <div className="pending-email-note">
                Pending change to: {pendingEmailChange}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input type="password" id="currentPassword" disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? <LoadingSpinner small /> : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
