const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Sửa lại đường dẫn import cho đúng thư mục nội bộ
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');
const Category = require('./src/models/Category');
const MenuItem = require('./src/models/MenuItem');
const Table = require('./src/models/Table');
const Favorite = require('./src/models/Favorite');
const Review = require('./src/models/Review');
const Promotion = require('./src/models/Promotion');

dotenv.config();

const seedData = async () => {
    try {
        // 1. Kết nối DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🚀 Đang kết nối Database để bơm dữ liệu...');

        // 2. Xóa sạch dữ liệu cũ (để tránh lỗi trùng Email hoặc Duplicate ID)
        await User.deleteMany();
        await Restaurant.deleteMany();
        await Category.deleteMany();
        await MenuItem.deleteMany();
        await Table.deleteMany();
        await Favorite.deleteMany();
        await Promotion.deleteMany();

        console.log('♻️ Đã dọn dẹp Database trống.');

        // 3. Tạo User mẫu (Mật khẩu mặc định: password123)
        // Lưu ý: Model User của anh có middleware mã hóa pass nên chỉ cần ghi text thô
        const user1 = await User.create({
            name: 'Sơn Admin',
            email: 'sonadmin@gmail.com',
            password: 'password123',
            role: 'admin'
        });

        const user2 = await User.create({
            name: 'Khách Hàng Demo',
            email: 'khachhang@gmail.com',
            password: 'password123',
            role: 'user'
        });

        // 4. Tạo Danh mục (Category)
        const cat1 = await Category.create({ name: 'Món Việt', description: 'Đậm đà hương vị quê hương' });
        const cat2 = await Category.create({ name: 'Món Hàn', description: 'Cay nồng chuẩn vị' });

        // 5. Tạo Nhà hàng (Restaurant)
        const res1 = await Restaurant.create({
            name: 'Cơm Niêu Nấm',
            address: '74 Đường Số 1, TP.HCM',
            phone: '0901234567',
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'
        });

        const res2 = await Restaurant.create({
            name: 'K-Buffet nướng',
            address: '12 Đội Cấn, Hà Nội',
            phone: '0907778889',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947'
        });

        // 6. Tạo Món ăn (MenuItem)
        await MenuItem.create([
            { name: 'Cơm Cá Kho Tộ', price: 85000, category: cat1._id, description: 'Cá lóc đồng kho tộ' },
            { name: 'Kimchi Cải Thảo', price: 45000, category: cat2._id, description: 'Cay tê đầu lưỡi' }
        ]);

        // 7. Tạo Bàn (Table)
        await Table.create([
            { restaurant: res1._id, tableNumber: 'Bàn 01', capacity: 4, status: 'available' },
            { restaurant: res1._id, tableNumber: 'Bàn VIP', capacity: 10, status: 'available' }
        ]);

        // 8. Tạo Khuyến mãi (Promotion)
        await Promotion.create({
            code: 'CHAOBAN',
            description: 'Giảm giá cho người mới',
            discountType: 'percentage',
            discountValue: 10,
            startDate: new Date(),
            endDate: new Date('2026-12-31')
        });

        // 9. Tạo Favorite (Anh Sơn thích nhà hàng Cơm Niêu)
        await Favorite.create({ user: user1._id, restaurant: res1._id });

        console.log('✅ Chúc mừng anh Sơn! Đã bơm dữ liệu thành công.');
        process.exit();
    } catch (error) {
        console.error('Lỗi Seeder:', error.message);
        process.exit(1);
    }
};

seedData();