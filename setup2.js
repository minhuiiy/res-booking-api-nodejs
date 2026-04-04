const fs = require('fs');
const path = require('path');

const dirs = [
    'src/configs',
    'src/models',
    'src/controllers',
    'src/routes',
    'src/middlewares',
    'src/uploads'
];

dirs.forEach(dir => {
    fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

const files = {
    '.env': "PORT=5000\nMONGO_URI=mongodb://localhost:27017/res_booking\nJWT_SECRET=mysecretkey123",
    
    'package.json': JSON.stringify({
      "name": "res-booking-api-nodejs",
      "version": "1.0.0",
      "description": "Restaurant Booking API",
      "main": "server.js",
      "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js"
      },
      "dependencies": {
        "bcryptjs": "^2.4.3",
        "cors": "^2.8.5",
        "dotenv": "^16.4.5",
        "express": "^4.19.2",
        "jsonwebtoken": "^9.0.2",
        "mongoose": "^8.4.1",
        "multer": "^1.4.5-lts.1"
      },
      "devDependencies": {
        "nodemon": "^3.1.4"
      }
    }, null, 2),

    'server.js': `const express = require('express');
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

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
`,

    'src/configs/db.js': `const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected: ' + conn.connection.host);
    } catch (error) {
        console.error('Error: ' + error.message);
        process.exit(1);
    }
};
module.exports = connectDB;`,

    'src/middlewares/authMiddleware.js': `const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };`,

    'src/middlewares/uploadMiddleware.js': `const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'src/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;`
};

// Generate Models
const models = ['User', 'Restaurant', 'Table', 'Category', 'MenuItem', 'Reservation', 'Review', 'Payment'];

files['src/models/User.js'] = `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('User', userSchema);`;

files['src/models/Restaurant.js'] = `const mongoose = require('mongoose');
const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    image: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Restaurant', restaurantSchema);`;

files['src/models/Table.js'] = `const mongoose = require('mongoose');
const tableSchema = new mongoose.Schema({
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableNumber: { type: String, required: true },
    capacity: { type: Number, required: true },
    status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' }
}, { timestamps: true });
module.exports = mongoose.model('Table', tableSchema);`;

files['src/models/Category.js'] = `const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Category', categorySchema);`;

files['src/models/MenuItem.js'] = `const mongoose = require('mongoose');
const menuItemSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('MenuItem', menuItemSchema);`;

files['src/models/Reservation.js'] = `const mongoose = require('mongoose');
const reservationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });
module.exports = mongoose.model('Reservation', reservationSchema);`;

files['src/models/Review.js'] = `const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Review', reviewSchema);`;

files['src/models/Payment.js'] = `const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'card', 'transfer'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
}, { timestamps: true });
module.exports = mongoose.model('Payment', paymentSchema);`;


// Generate generic controllers and routes for other models
models.forEach(model => {
    let lowerModel = model.charAt(0).toLowerCase() + model.slice(1);
    
    // Auth logic just for User
    if (model === 'User') {
        files['src/controllers/userController.js'] = `const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });
        
        let avatar = '';
        if (req.file) avatar = '/' + req.file.path.replace(/\\\\\\\\/g, '/');

        const user = await User.create({ name, email, password, role, avatar });
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, token: generateToken(user._id) });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
`;
        files['src/routes/userRoutes.js'] = `const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/register', upload.single('avatar'), registerUser);
router.post('/login', loginUser);
router.get('/', protect, admin, getUsers);

module.exports = router;
`;
    } else {
        files['src/controllers/' + lowerModel + 'Controller.js'] = `const ` + model + ` = require('../models/` + model + `');

exports.create` + model + ` = async (req, res) => {
    try {
        let data = { ...req.body };
        if (req.file) {
            data.image = '/' + req.file.path.replace(/\\\\\\\\/g, '/');
        }
        const document = await ` + model + `.create(data);
        res.status(201).json(document);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.get` + model + `s = async (req, res) => {
    try {
        const documents = await ` + model + `.find({});
        res.json(documents);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.get` + model + `ById = async (req, res) => {
    try {
        const document = await ` + model + `.findById(req.params.id);
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.update` + model + ` = async (req, res) => {
    try {
        let data = { ...req.body };
        if (req.file) {
            data.image = '/' + req.file.path.replace(/\\\\\\\\/g, '/');
        }
        const document = await ` + model + `.findByIdAndUpdate(req.params.id, data, { new: true });
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.delete` + model + ` = async (req, res) => {
    try {
        const document = await ` + model + `.findByIdAndDelete(req.params.id);
        if (document) res.json({ message: 'Removed' });
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
`;

        files['src/routes/' + lowerModel + 'Routes.js'] = `const express = require('express');
const router = express.Router();
const controller = require('../controllers/` + lowerModel + `Controller');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('image'), controller.create` + model + `)
    .get(controller.get` + model + `s);

router.route('/:id')
    .get(controller.get` + model + `ById)
    .put(protect, upload.single('image'), controller.update` + model + `)
    .delete(protect, admin, controller.delete` + model + `);

module.exports = router;
`;
    }
});

for (const [filePath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(__dirname, filePath), content);
}

console.log('Project setup completed successfully. All models, routes, and controllers created.');
