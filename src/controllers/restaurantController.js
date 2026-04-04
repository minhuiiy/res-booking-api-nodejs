const Restaurant = require('../models/Restaurant');

exports.createRestaurant = async (req, res) => {
    try {
        let data = { ...req.body };
        if (req.file) {
            data.image = '/' + req.file.path.replace(/\\\\/g, '/');
        }
        const document = await Restaurant.create(data);
        res.status(201).json(document);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getRestaurants = async (req, res) => {
    try {
        const documents = await Restaurant.find({});
        res.json(documents);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getRestaurantById = async (req, res) => {
    try {
        const document = await Restaurant.findById(req.params.id);
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateRestaurant = async (req, res) => {
    try {
        let data = { ...req.body };
        if (req.file) {
            data.image = '/' + req.file.path.replace(/\\\\/g, '/');
        }
        const document = await Restaurant.findByIdAndUpdate(req.params.id, data, { new: true });
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteRestaurant = async (req, res) => {
    try {
        const document = await Restaurant.findByIdAndDelete(req.params.id);
        if (document) res.json({ message: 'Removed' });
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
