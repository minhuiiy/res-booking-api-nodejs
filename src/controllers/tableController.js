const Table = require('../models/Table');

exports.createTable = async (req, res) => {
    try {
        let data = { ...req.body };
        if (req.file) {
            data.image = '/' + req.file.path.replace(/\\\\/g, '/');
        }
        const document = await Table.create(data);
        res.status(201).json(document);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getTables = async (req, res) => {
    try {
        const documents = await Table.find({});
        res.json(documents);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getTableById = async (req, res) => {
    try {
        const document = await Table.findById(req.params.id);
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateTable = async (req, res) => {
    try {
        let data = { ...req.body };
        if (req.file) {
            data.image = '/' + req.file.path.replace(/\\\\/g, '/');
        }
        const document = await Table.findByIdAndUpdate(req.params.id, data, { new: true });
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteTable = async (req, res) => {
    try {
        const document = await Table.findByIdAndDelete(req.params.id);
        if (document) res.json({ message: 'Removed' });
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
