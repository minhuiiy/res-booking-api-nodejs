const express = require('express');
const router = express.Router();
const controller = require('../controllers/restaurantController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .post(protect, admin, upload.single('image'), controller.createRestaurant)
    .get(controller.getRestaurants);

router.route('/:id')
    .get(controller.getRestaurantById)
    .put(protect, upload.single('image'), controller.updateRestaurant)
    .delete(protect, admin, controller.deleteRestaurant);

module.exports = router;
