const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/configs/db');
const path = require('path');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/restaurants', require('./src/routes/restaurantRoutes'));
app.use('/api/tables', require('./src/routes/tableRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/menu-items', require('./src/routes/menuItemRoutes'));
app.use('/api/reservations', require('./src/routes/reservationRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/favorites', require('./src/routes/favoriteRoutes'));
app.use('/api/promotions', require('./src/routes/promotionRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
