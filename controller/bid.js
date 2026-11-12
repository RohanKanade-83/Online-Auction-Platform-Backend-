const Bid = require('../models/Bid');   


exports.ProductsByBid = async (req , res) => {
    try {
        const bids = await Bid.find({ productId: req.params.productId })
        .sort({ amount: -1 })
        .populate('user', 'name email');
        res.json(bids);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch bids' });
    }
}

exports.AddBidsByProduct = async (req , res) => {
     const { productId, user, amount } = req.body;
  try {
    const newBid = await Bid.create({ productId, user, amount });
    res.json(newBid);
  } catch (err) {
    res.status(400).json({ message: 'Failed to place bid' });
  }
}