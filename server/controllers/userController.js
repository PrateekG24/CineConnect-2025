const User = require('../models/User');
const { generateToken, generateRandomToken } = require('../utils/generateToken');
const emailService = require('../services/emailService');
const bcrypt = require('bcrypt');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user or email already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      if (userExists.email === email) {
        return res.status(400).json({ message: 'Email is already registered' });
      } else {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Generate verification token
    const emailVerificationToken = generateRandomToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires
    });

    try {
      // Send verification email
      await emailService.sendVerificationEmail(user, emailVerificationToken);

      // Return user data (excluding password) and token
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
        message: 'Registration successful! Please check your email to verify your account.'
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);

      // Still create the user, but inform them about the email issue
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
        message: 'Registration successful, but we could not send a verification email. Please try requesting a new verification email from your profile page.'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    User login
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Update last login time
      user.lastLogin = new Date();
      await user.save();

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if there are pending changes already
    if (user.pendingChanges.changeType) {
      return res.status(400).json({
        message: 'You have pending changes that require verification. Please check your email or request a new verification link.'
      });
    }

    // Track what kind of changes are being made
    let hasChanges = false;
    let changeType = null;
    const pendingChanges = {
      username: null,
      email: null,
      password: null
    };

    // Handle email change
    if (req.body.email && req.body.email !== user.email) {
      // Check if email is already taken
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use' });
      }

      pendingChanges.email = req.body.email;
      changeType = 'email';
      hasChanges = true;
    }

    // Handle username change
    if (req.body.username && req.body.username !== user.username) {
      // Check if username is already taken
      const usernameExists = await User.findOne({ username: req.body.username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken' });
      }

      pendingChanges.username = req.body.username;
      changeType = changeType ? 'multiple' : 'username';
      hasChanges = true;
    }

    // Handle password change - requires current password
    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }

      // Verify current password
      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash the new password for storage in pending changes
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

      pendingChanges.password = hashedPassword;
      changeType = changeType ? 'multiple' : 'password';
      hasChanges = true;
    }

    // Don't proceed if no changes
    if (!hasChanges) {
      return res.status(400).json({ message: 'No changes were requested' });
    }

    // Generate verification token
    const emailVerificationToken = generateRandomToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Set pending changes and verification data
    user.pendingChanges = {
      ...pendingChanges,
      changeType
    };
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;

    // Save the user with pending changes
    await user.save();

    try {
      // Send verification email
      // Determine where to send the verification email (current email or new email if changing)
      const emailTarget = pendingChanges.email || user.email;

      // Customize message based on change type
      let changeMessage;
      switch (changeType) {
        case 'username':
          changeMessage = `username to "${pendingChanges.username}"`;
          break;
        case 'email':
          changeMessage = `email to "${pendingChanges.email}"`;
          break;
        case 'password':
          changeMessage = 'password';
          break;
        case 'multiple':
          changeMessage = 'profile information';
          break;
      }

      await emailService.sendProfileVerificationEmail(
        user,
        emailVerificationToken,
        emailTarget,
        changeType,
        pendingChanges
      );

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        pendingChanges: {
          hasChanges: true,
          changeType
        },
        message: `A verification email has been sent to ${emailTarget}. Please verify to apply your changes to ${changeMessage}.`
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);

      // Reset verification fields if email fails
      user.pendingChanges = {
        username: null,
        email: null,
        password: null,
        changeType: null
      };
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      await user.save();

      return res.status(500).json({
        message: 'Could not send verification email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

// @desc    Verify Email
// @route   GET /api/users/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification token'
      });
    }

    // Handle initial account verification
    if (!user.isEmailVerified && !user.pendingChanges.changeType) {
      user.isEmailVerified = true;
    }

    // Handle profile changes verification
    if (user.pendingChanges && user.pendingChanges.changeType) {
      const { pendingChanges } = user;

      // Apply username change if requested
      if (pendingChanges.username) {
        user.username = pendingChanges.username;
      }

      // Apply email change if requested
      if (pendingChanges.email) {
        user.email = pendingChanges.email;
      }

      // Apply password change if requested
      if (pendingChanges.password) {
        user.password = pendingChanges.password; // Already hashed
      }

      // Clear pending changes
      user.pendingChanges = {
        username: null,
        email: null,
        password: null,
        changeType: null
      };

      // Email is considered verified if profile changes are verified
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
      }
    }

    // Clear verification data
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    // Determine appropriate success message
    let message = 'Email verified successfully';
    if (user.pendingChanges && user.pendingChanges.changeType) {
      message = 'Profile changes applied successfully';
    }

    res.json({
      success: true,
      message: message
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// @desc    Resend Verification Email
// @route   POST /api/users/resend-verification
// @access  Private
const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow resending verification for unverified accounts
    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'Your email is already verified'
      });
    }

    // Generate new verification token
    const emailVerificationToken = generateRandomToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;

    // Save updated user
    await user.save();

    try {
      // Send verification email
      await emailService.sendVerificationEmail(user, emailVerificationToken, user.email);

      res.json({
        message: 'Verification email has been sent'
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      res.status(500).json({
        message: 'Could not send verification email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error during verification email resend' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    // Always return the same response to prevent email enumeration
    if (!user) {
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token and expiry
    const passwordResetToken = generateRandomToken();
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    try {
      // Send password reset email
      await emailService.sendVerificationEmail(user, passwordResetToken, null, true);

      res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);

      // Remove the token if email failed
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      res.status(500).json({
        message: 'Error sending password reset email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error processing password reset request' });
  }
};

// @desc    Reset password with token
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = password;

    // Clear reset token
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    res.json({
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  getUserProfile,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
}; 