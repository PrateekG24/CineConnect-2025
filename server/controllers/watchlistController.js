const User = require('../models/User');

// @desc    Add item to watchlist
// @route   POST /api/users/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const { mediaType, mediaId, title, posterPath } = req.body;

    // Basic validation
    if (!mediaType || !mediaId || !title) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if media already exists in watchlist
    const existingItem = user.watchlist.find(
      item => item.mediaType === mediaType && item.mediaId === parseInt(mediaId)
    );

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in watchlist' });
    }

    // Add to watchlist
    user.watchlist.push({
      mediaType,
      mediaId: parseInt(mediaId),
      title,
      poster_path: posterPath,
      added_at: Date.now()
    });

    await user.save();

    res.status(201).json({
      message: 'Added to watchlist',
      item: user.watchlist[user.watchlist.length - 1]
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: 'Server error adding to watchlist' });
  }
};

// @desc    Remove item from watchlist
// @route   DELETE /api/users/watchlist/:mediaId
// @access  Private
const removeFromWatchlist = async (req, res) => {
  try {
    const { mediaId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure mediaId is handled as a number for comparison
    const mediaIdNumber = parseInt(mediaId);

    // Check if item exists in watchlist
    const existingItemIndex = user.watchlist.findIndex(
      item => item.mediaId === mediaIdNumber
    );

    if (existingItemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in watchlist' });
    }

    // Remove item from watchlist
    user.watchlist.splice(existingItemIndex, 1);
    await user.save();

    res.json({
      message: 'Removed from watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: 'Server error removing from watchlist' });
  }
};

// @desc    Get user watchlist
// @route   GET /api/users/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sort watchlist by date added (most recent first)
    const sortedWatchlist = [...user.watchlist].sort((a, b) => b.added_at - a.added_at);

    res.json(sortedWatchlist);
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ message: 'Server error retrieving watchlist' });
  }
};

module.exports = {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist
}; 