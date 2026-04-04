const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'card', 'transfer'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
}, { timestamps: true });
module.exports = mongoose.model('Payment', paymentSchema);