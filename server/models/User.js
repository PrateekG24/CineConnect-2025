const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  pendingEmail: {
    type: String,
    default: null,
    trim: true,
    lowercase: true
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  watchlist: [{
    mediaType: {
      type: String,
      enum: ['movie', 'tv'],
      required: true
    },
    mediaId: {
      type: Number,
      required: true
    },
    title: String,
    poster_path: String,
    added_at: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    //Generates a random "salt" value. Cost factor 10 means bcrypt does 2¹⁰ (1024) internal rounds—more rounds = slower hashing = harder for attackers.
    this.password = await bcrypt.hash(this.password, salt);
    //Combines your plain password + the salt and runs the bcrypt algorithm
    next();
  } catch (error) {
    next(error);
  }
});


// When a user tries to log in, you call user.matchPassword(submittedPassword)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
  //You never decrypt the stored hash—instead, you hash the submitted password with the same salt & cost.
};

module.exports = mongoose.model('User', userSchema); 