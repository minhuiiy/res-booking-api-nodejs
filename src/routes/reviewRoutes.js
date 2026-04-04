const express = require('express');
const router = express.Router();
const controller = require('../controllers/reviewController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('image'), controller.createReview)
    .get(controller.getReviews);

router.route('/:id')
    .get(controller.getReviewById)
    .put(protect, upload.single('image'), controller.updateReview)
    .delete(protect, admin, controller.deleteReview);

module.exports = router;
