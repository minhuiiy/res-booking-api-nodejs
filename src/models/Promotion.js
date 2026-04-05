const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true, 
        trim: true 
    },
    description: { 
        type: String 
    },
    discountType: { 
        type: String, 
        enum: ['percentage', 'fixed'], 
        default: 'percentage',
        required: true
    },
    discountValue: { 
        type: Number, 
        required: true 
    },
    minOrderValue: { 
        type: Number, 
        default: 0 
    },
    maxDiscountAmount: { 
        type: Number 
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    usageLimit: { 
        type: Number 
    },
    usedCount: { 
        type: Number, 
        default: 0 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
