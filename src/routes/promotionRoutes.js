const express = require('express');
const router = express.Router();
const controller = require('../controllers/promotionController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, admin, controller.createPromotion)
    .get(protect, controller.getPromotions);

router.route('/validate')
    .post(protect, controller.validatePromotion);

router.route('/:id')
    .get(protect, controller.getPromotionById)
    .put(protect, admin, controller.updatePromotion)
    .delete(protect, admin, controller.deletePromotion);

module.exports = router;
