const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',   // tells Mongoose this points to the User collection
    required: true
  },
  mediaId: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['movie', 'tv'],
    required: true
  },
  mediaTitle: {
    type: String,
    required: true
  },
  mediaPoster: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate reviews
reviewSchema.index({ user: 1, mediaId: 1, mediaType: 1 }, { unique: true });  //enforces that no two documents can have this identical triple (user, mediaId, mediaType)

module.exports = mongoose.model('Review', reviewSchema); 