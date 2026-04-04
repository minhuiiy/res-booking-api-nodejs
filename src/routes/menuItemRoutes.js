const express = require('express');
const router = express.Router();
const controller = require('../controllers/menuItemController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('image'), controller.createMenuItem)
    .get(controller.getMenuItems);

router.route('/:id')
    .get(controller.getMenuItemById)
    .put(protect, upload.single('image'), controller.updateMenuItem)
    .delete(protect, admin, controller.deleteMenuItem);

module.exports = router;
