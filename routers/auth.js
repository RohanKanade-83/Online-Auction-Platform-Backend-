const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JoinedAuction = require('../models/JoinedAuction');
const Leaderboard = require('../models/Leaderboard');
const { Singup } = require('../controller/signup');
const { Login } = require('../controller/login');
const { 
  AddProduct, 
  AllProduct, 
  ProductbyId, 
  UpdateProduct, 
  DeleteProduct 
} = require('../controller/product');
const { ProductsByBid, AddBidsByProduct } = require('../controller/bid');
const User = require('../models/User');

const router = express.Router();

// ======================== USER ROUTES ========================

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Update user by ID
const handleUpdateUser = async (req, res) => {
  try {
    const targetId = req.params.id || req.params.userId;
    const { name, email } = req.body;
    
    // Check if new email is taken by someone else
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: targetId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use by another user' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

// Delete user by ID
const handleDeleteUser = async (req, res) => {
  try {
    const targetId = req.params.id || req.params.userId;
    console.log("Deleting user permanently with ID:", targetId);
    const deletedUser = await User.findByIdAndDelete(targetId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    try {
      const Bid = require('../models/Bid');
      await Bid.deleteMany({ user: targetId });
    } catch (bidErr) {
      console.error("Error deleting bids associated with user:", bidErr);
    }

    res.json({ message: 'User deleted permanently from database', id: targetId });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

router.put('/user/:id', handleUpdateUser);
router.delete('/user/:id', handleDeleteUser);
router.put('/users/:id', handleUpdateUser);
router.delete('/users/:id', handleDeleteUser);

// User Authentication
router.post('/register', Singup);
router.post('/login', Login);

// ======================== PRODUCT ROUTES ========================

router.post('/product', AddProduct);
router.get('/allproducts', AllProduct);
router.get('/productbyid/:productId', ProductbyId);

router.put('/product/:productId', UpdateProduct);
router.delete('/product/:productId', DeleteProduct);
router.put('/products/:productId', UpdateProduct);
router.delete('/products/:productId', DeleteProduct);

// ======================== BID ROUTES ========================

router.get('/bids/:productId', ProductsByBid);
router.post('/bid', AddBidsByProduct);

module.exports = router;
