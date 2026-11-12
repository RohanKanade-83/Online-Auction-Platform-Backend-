const Product = require('../models/product');

exports.AddProduct = async (req, res) => {
    try {
        const { name, description, image, baseBid, auctionEndDate } = req.body;

        const newProduct = await Product.create({ name, description, image, baseBid, auctionEndDate });
        res.status(201).json({
            message: 'Your product was added successfully',
            Product: newProduct
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.AllProduct = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error("fetching data error", err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.ProductbyId = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error("fetching data error", err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.UpdateProduct = async (req, res) => {
    try {
        const targetId = req.params.productId || req.params.id;
        const { name, description, image, baseBid, auctionEndDate } = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(
            targetId,
            { name, description, image, baseBid: Number(baseBid), auctionEndDate },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (err) {
        console.error("Update product error:", err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
};

exports.DeleteProduct = async (req, res) => {
    try {
        const targetId = req.params.productId || req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(targetId);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Clean up associated bids
        try {
            const Bid = require('../models/Bid');
            await Bid.deleteMany({ productId: targetId });
        } catch (bidErr) {
            console.error("Error deleting bids associated with product:", bidErr);
        }

        res.json({ message: 'Product deleted successfully', id: targetId });
    } catch (err) {
        console.error("Delete product error:", err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
};

