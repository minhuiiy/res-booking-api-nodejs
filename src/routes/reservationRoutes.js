const express = require('express');
const router = express.Router();
const controller = require('../controllers/reservationController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, controller.createReservation)
    .get(protect, controller.getReservations);

router.route('/:id')
    .get(protect, controller.getReservationById)
    .put(protect, admin, controller.updateReservation)
    .delete(protect, admin, controller.deleteReservation);

module.exports = router;
