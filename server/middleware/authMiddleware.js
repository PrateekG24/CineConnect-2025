const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        console.log('Token is empty after splitting');
        return res.status(401).json({ message: 'Not authorized, invalid token format' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (exclude password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.log('User not found for token ID:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({
        message: 'Not authorized, token failed',
        error: error.message
      });
    }
  } else {
    console.log('No Authorization header or not Bearer format');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect }; 