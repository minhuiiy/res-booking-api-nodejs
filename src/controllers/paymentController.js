const Payment = require('../models/Payment');

exports.createPayment = async (req, res) => {
    try {
        let data = { ...req.body };
        if (req.file) {
            data.image = '/' + req.file.path.replace(/\\\\/g, '/');
        }
        const document = await Payment.create(data);
        res.status(201).json(document);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getPayments = async (req, res) => {
    try {
        const documents = await Payment.find({});
        res.json(documents);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getPaymentById = async (req, res) => {
    try {
        const document = await Payment.findById(req.params.id);
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updatePayment = async (req, res) => {
    try {
        let data = { ...req.body };
        if (req.file) {
            data.image = '/' + req.file.path.replace(/\\\\/g, '/');
        }
        const document = await Payment.findByIdAndUpdate(req.params.id, data, { new: true });
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deletePayment = async (req, res) => {
    try {
        const document = await Payment.findByIdAndDelete(req.params.id);
        if (document) res.json({ message: 'Removed' });
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
