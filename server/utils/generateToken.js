const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT for authentication
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Generate a random token for verification purposes (email or password)
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = { generateToken, generateRandomToken }; 