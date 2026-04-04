const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('image'), controller.createCategory)
    .get(controller.getCategorys);

router.route('/:id')
    .get(controller.getCategoryById)
    .put(protect, upload.single('image'), controller.updateCategory)
    .delete(protect, admin, controller.deleteCategory);

module.exports = router;
