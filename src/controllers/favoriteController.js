const Favorite = require('../models/Favorite');

exports.addToFavorite = async (req, res) => {
    try {
        const { restaurantId } = req.body;
        const userId = req.user.id; // Lấy từ authMiddleware

        const favorite = await Favorite.create({ user: userId, restaurant: restaurantId });
        res.status(201).json({ success: true, data: favorite });
    } catch (error) {
        res.status(400).json({ success: false, message: "Đã có trong danh sách hoặc lỗi dữ liệu" });
    }
};

exports.getMyFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user.id }).populate('restaurant');
        res.status(200).json({ success: true, count: favorites.length, data: favorites });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        await Favorite.findOneAndDelete({ 
            user: req.user.id, 
            restaurant: req.params.id 
        });
        res.status(200).json({ success: true, message: "Đã xóa khỏi danh sách yêu thích" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};