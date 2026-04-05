const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/register', upload.single('avatar'), registerUser);
router.post('/login', loginUser);
router.route('/').get(protect, admin, getUsers);

router.route('/:id')
    .get(protect, admin, getUserById)
    .put(protect, admin, upload.single('avatar'), updateUser)
    .delete(protect, admin, deleteUser);

module.exports = router;
