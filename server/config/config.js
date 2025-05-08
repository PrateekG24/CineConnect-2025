// Set environment variables if not already set

// Default client URL (for email verification links)
if (!process.env.CLIENT_URL) {
  process.env.CLIENT_URL = 'http://localhost:5173';
  console.log('CLIENT_URL environment variable not found, using default:', process.env.CLIENT_URL);
}

// Email configuration defaults
// For production, you should set these in your .env file
if (!process.env.EMAIL_SERVICE) {
  process.env.EMAIL_SERVICE = 'gmail'; // or any other service like 'hotmail', 'outlook', etc.
}

if (!process.env.EMAIL_USERNAME) {
  // Set a default value, but this needs to be replaced with real credentials in .env
  process.env.EMAIL_USERNAME = 'your-email@gmail.com';
  console.log('WARNING: EMAIL_USERNAME not set in environment. Email sending will not work properly.');
}

if (!process.env.EMAIL_PASSWORD) {
  // For Gmail, this would be an app password
  process.env.EMAIL_PASSWORD = 'your-app-password';
  console.log('WARNING: EMAIL_PASSWORD not set in environment. Email sending will not work properly.');
}

if (!process.env.EMAIL_FROM) {
  process.env.EMAIL_FROM = 'CineConnect <your-email@gmail.com>';
}

module.exports = {
  CLIENT_URL: process.env.CLIENT_URL,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || 5000,
  EMAIL: {
    SERVICE: process.env.EMAIL_SERVICE,
    USERNAME: process.env.EMAIL_USERNAME,
    PASSWORD: process.env.EMAIL_PASSWORD,
    FROM: process.env.EMAIL_FROM
  }
}; 