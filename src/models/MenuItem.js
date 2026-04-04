const mongoose = require('mongoose');
const menuItemSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('MenuItem', menuItemSchema);