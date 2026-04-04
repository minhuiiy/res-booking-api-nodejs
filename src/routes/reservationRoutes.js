const express = require('express');
const router = express.Router();
const controller = require('../controllers/reservationController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('image'), controller.createReservation)
    .get(controller.getReservations);

router.route('/:id')
    .get(controller.getReservationById)
    .put(protect, upload.single('image'), controller.updateReservation)
    .delete(protect, admin, controller.deleteReservation);

module.exports = router;
