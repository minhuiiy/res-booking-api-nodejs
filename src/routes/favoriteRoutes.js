const express = require('express');
const router = express.Router();
const { addToFavorite, getMyFavorites, removeFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middlewares/authMiddleware');
router.use(protect);

router.route('/')
    .get(getMyFavorites)
    .post(addToFavorite);

router.route('/:id')
    .delete(removeFavorite);

module.exports = router;