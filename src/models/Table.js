const mongoose = require('mongoose');
const tableSchema = new mongoose.Schema({
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableNumber: { type: String, required: true },
    capacity: { type: Number, required: true },
    status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' }
}, { timestamps: true });
module.exports = mongoose.model('Table', tableSchema);