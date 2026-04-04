const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('image'), controller.createPayment)
    .get(controller.getPayments);

router.route('/:id')
    .get(controller.getPaymentById)
    .put(protect, upload.single('image'), controller.updatePayment)
    .delete(protect, admin, controller.deletePayment);

module.exports = router;
