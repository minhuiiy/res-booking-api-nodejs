const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/register', upload.single('avatar'), registerUser);
router.post('/login', loginUser);
router.get('/', protect, admin, getUsers);

module.exports = router;
