const express = require('express');
const router = express.Router();
const controller = require('../controllers/tableController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('image'), controller.createTable)
    .get(controller.getTables);

router.route('/:id')
    .get(controller.getTableById)
    .put(protect, upload.single('image'), controller.updateTable)
    .delete(protect, admin, controller.deleteTable);

module.exports = router;
