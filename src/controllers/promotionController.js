const Promotion = require('../models/Promotion');

// @desc    Create new promotion
// @route   POST /api/promotions
// @access  Private/Admin
exports.createPromotion = async (req, res) => {
    try {
        const { code } = req.body;
        const exists = await Promotion.findOne({ code });
        if (exists) {
            return res.status(400).json({ message: 'Promotion code already exists' });
        }
        const promotion = await Promotion.create(req.body);
        res.status(201).json(promotion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Public/Authenticated
exports.getPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find({});
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get promotion by ID
// @route   GET /api/promotions/:id
// @access  Public/Authenticated
exports.getPromotionById = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);
        if (promotion) {
            res.json(promotion);
        } else {
            res.status(404).json({ message: 'Promotion not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
exports.updatePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (promotion) {
            res.json(promotion);
        } else {
            res.status(404).json({ message: 'Promotion not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
exports.deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndDelete(req.params.id);
        if (promotion) {
            res.json({ message: 'Promotion removed successfully' });
        } else {
            res.status(404).json({ message: 'Promotion not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate promotion code
// @route   POST /api/promotions/validate
// @access  Public/Authenticated
exports.validatePromotion = async (req, res) => {
    try {
        const { code, orderValue } = req.body;
        const now = new Date();

        const promotion = await Promotion.findOne({ 
            code: code.toUpperCase(), 
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        if (!promotion) {
            return res.status(404).json({ message: 'Invalid or expired promotion code' });
        }

        // Check usage limit
        if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
            return res.status(400).json({ message: 'Promotion code usage limit reached' });
        }

        // Check min order value
        if (orderValue < promotion.minOrderValue) {
            return res.status(400).json({ 
                message: `Minimum order value for this promotion is ${promotion.minOrderValue}` 
            });
        }

        // Calculate discount
        let discount = 0;
        if (promotion.discountType === 'percentage') {
            discount = (orderValue * promotion.discountValue) / 100;
            if (promotion.maxDiscountAmount && discount > promotion.maxDiscountAmount) {
                discount = promotion.maxDiscountAmount;
            }
        } else {
            discount = promotion.discountValue;
        }

        res.json({
            promotionId: promotion._id,
            code: promotion.code,
            discountType: promotion.discountType,
            discountValue: promotion.discountValue,
            finalDiscount: discount,
            message: 'Promotion applied successfully'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
