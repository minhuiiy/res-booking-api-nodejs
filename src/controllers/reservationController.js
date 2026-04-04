const Reservation = require('../models/Reservation');

exports.createReservation = async (req, res) => {
    try {
        let data = { ...req.body };
        if (req.file) {
            data.image = '/' + req.file.path.replace(/\\\\/g, '/');
        }
        const document = await Reservation.create(data);
        res.status(201).json(document);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getReservations = async (req, res) => {
    try {
        const documents = await Reservation.find({});
        res.json(documents);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getReservationById = async (req, res) => {
    try {
        const document = await Reservation.findById(req.params.id);
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateReservation = async (req, res) => {
    try {
        let data = { ...req.body };
        if (req.file) {
            data.image = '/' + req.file.path.replace(/\\\\/g, '/');
        }
        const document = await Reservation.findByIdAndUpdate(req.params.id, data, { new: true });
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteReservation = async (req, res) => {
    try {
        const document = await Reservation.findByIdAndDelete(req.params.id);
        if (document) res.json({ message: 'Removed' });
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
