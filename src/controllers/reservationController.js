const Reservation = require('../models/Reservation');

exports.createReservation = async (req, res) => {
    try {
        // Lấy dữ liệu từ Frontend gửi lên
        const { table, date, time, guests } = req.body;

        // KIỂM TRA QUAN TRỌNG: Gắn ID người dùng đang đăng nhập vào đơn đặt
        // req.user được tạo ra từ protect middleware
        const reservationData = {
            user: req.user._id, 
            table,
            date,
            time,
            guests,
            status: 'pending' // Mặc định là đang chờ
        };

        const document = await Reservation.create(reservationData);
        
        // Trả về dữ liệu đã tạo thành công
        res.status(201).json(document);
    } catch (error) { 
        console.error('Lỗi đặt bàn:', error.message);
        res.status(400).json({ message: error.message }); 
    }
};

exports.getReservations = async (req, res) => {
    try {
        const documents = await Reservation.find({})
            .populate('user', 'name email')
            .populate('table');
        res.json(documents);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getReservationById = async (req, res) => {
    try {
        const document = await Reservation.findById(req.params.id).populate('user table');
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateReservation = async (req, res) => {
    try {
        const document = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
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