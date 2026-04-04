const fs = require('fs');
const path = require('path');

// 1. Update reservationController.js
fs.writeFileSync(path.join(__dirname, 'src/controllers/reservationController.js'), `const Reservation = require('../models/Reservation');

exports.createReservation = async (req, res) => {
    try {
        let data = { ...req.body, user: req.user._id };
        const document = await Reservation.create(data);
        res.status(201).json(document);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getReservations = async (req, res) => {
    try {
        let documents;
        if (req.user.role === 'admin') {
            documents = await Reservation.find({}).populate('user', 'name email').populate('table');
        } else {
            documents = await Reservation.find({ user: req.user._id }).populate('table');
        }
        res.json(documents);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getReservationById = async (req, res) => {
    try {
        const document = await Reservation.findById(req.params.id);
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateReservation = async (req, res) => {
    try {
        let data = { ...req.body };
        const document = await Reservation.findByIdAndUpdate(req.params.id, data, { new: true });
        if (document) res.json(document);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteReservation = async (req, res) => {
    try {
        const document = await Reservation.findByIdAndDelete(req.params.id);
        if (document) res.json({ message: 'Removed' });
        else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
`);

// 2. Update reservationRoutes.js
fs.writeFileSync(path.join(__dirname, 'src/routes/reservationRoutes.js'), `const express = require('express');
const router = express.Router();
const controller = require('../controllers/reservationController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, controller.createReservation)
    .get(protect, controller.getReservations);

router.route('/:id')
    .get(protect, controller.getReservationById)
    .put(protect, admin, controller.updateReservation)
    .delete(protect, admin, controller.deleteReservation);

module.exports = router;
`);

// 3. Update DashboardLayout.jsx
fs.writeFileSync(path.join(__dirname, 'frontend/src/components/DashboardLayout.jsx'), `import { useContext } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Store, Users, LayoutDashboard, UtensilsCrossed, CalendarCheck, CalendarRange } from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    let menu = [];

    if (user.role === 'admin') {
        menu = [
            { path: '/', icon: <LayoutDashboard size={20}/>, label: 'Dashboard' },
            { path: '/restaurants', icon: <Store size={20}/>, label: 'Restaurants' },
            { path: '/reservations', icon: <CalendarCheck size={20}/>, label: 'All Booking' },
            { path: '/menus', icon: <UtensilsCrossed size={20}/>, label: 'Menulist' },
            { path: '/users', icon: <Users size={20}/>, label: 'Users' }
        ];
    } else {
        menu = [
            { path: '/book-table', icon: <CalendarRange size={20}/>, label: 'Book a Table' },
            { path: '/reservations', icon: <CalendarCheck size={20}/>, label: 'My Bookings' }
        ];
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <Store className="text-primary" />
                        ResBook
                    </h2>
                </div>
                
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menu.map((item) => (
                        <Link 
                            key={item.label}
                            to={item.path} 
                            className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all \${ 
                                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                                ? 'bg-primary/10 text-primary font-semibold' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }\`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow flex items-center justify-center overflow-hidden">
                             {user.avatar ? <img src={\`http://localhost:5000\${user.avatar}\`} className="w-full h-full object-cover" /> : <span className="text-gray-500 font-bold">{user.name.charAt(0)}</span>}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut size={20}/>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}`);

// 4. Create BookTable.jsx
fs.writeFileSync(path.join(__dirname, 'frontend/src/pages/BookTable.jsx'), `import { useState, useEffect } from 'react';
import api from '../utils/api';
import { CalendarRange, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookTable() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState(null);
    const [formData, setFormData] = useState({ date: '', time: '', guests: 1 });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const { data } = await api.get('/tables');
                setTables(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTables();
    }, []);

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/reservations', {
                table: selectedTable._id,
                date: formData.date,
                time: formData.time,
                guests: formData.guests
            });
            alert('Booking submitted successfully!');
            setSelectedTable(null);
            navigate('/reservations');
        } catch (err) {
            alert('Error booking table');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Book a Table</h1>
                <p className="text-gray-500 mt-1">Select an available table for your upcoming meal.</p>
            </div>

            {loading ? (
                <div className="flex px-4 py-10 justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent flex rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {tables.map(table => (
                        <div key={table._id} onClick={() => setSelectedTable(table)} 
                             className={\`p-6 rounded-2xl border-2 transition-all cursor-pointer \${selectedTable?._id === table._id ? 'border-primary bg-primary/5 scale-105 shadow-md' : 'border-gray-100 bg-white hover:border-primary/50'}\`}>
                            <h3 className="text-4xl font-black text-center mb-2">{table.tableNumber}</h3>
                            <p className="text-center text-gray-500 flex items-center justify-center gap-1"><Users size={16}/> {table.capacity} pax</p>
                            <span className="block text-center mt-4 text-xs font-bold uppercase tracking-wider text-green-500 bg-green-50 rounded-full py-1">Available</span>
                        </div>
                    ))}
                </div>
            )}

            {selectedTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
                        <h2 className="text-2xl font-bold mb-6">Confirm Booking (Table {selectedTable.tableNumber})</h2>
                        <form onSubmit={handleBook} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" required className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input type="time" required className="input-field" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                                <input type="number" min="1" max={selectedTable.capacity} required className="input-field" value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} />
                            </div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setSelectedTable(null)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="btn-primary">Place Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}`);

// 5. Create Reservations.jsx
fs.writeFileSync(path.join(__dirname, 'frontend/src/pages/Reservations.jsx'), `import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Check, X } from 'lucide-react';

export default function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const fetchReservations = async () => {
        try {
            const { data } = await api.get('/reservations');
            setReservations(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(\`/reservations/\${id}\`, { status });
            fetchReservations();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {user?.role === 'admin' ? 'Booking Management' : 'My Bookings'}
                </h1>
            </div>

            {loading ? (
                <div className="flex px-4 py-10 justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent flex rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                {user?.role === 'admin' && <th className="px-6 py-4">Customer</th>}
                                <th className="px-6 py-4">Table No.</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Guests</th>
                                <th className="px-6 py-4">Status</th>
                                {user?.role === 'admin' && <th className="px-6 py-4">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reservations.map(res => (
                                <tr key={res._id} className="hover:bg-gray-50">
                                    {user?.role === 'admin' && (
                                        <td className="px-6 py-4 font-medium text-gray-900 border-r">{res.user ? \`\${res.user.name}\` : 'Unknown'}</td>
                                    )}
                                    <td className="px-6 py-4 font-bold">{res.table ? res.table.tableNumber : 'N/A'}</td>
                                    <td className="px-6 py-4">{new Date(res.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{res.time}</td>
                                    <td className="px-6 py-4">{res.guests} pax</td>
                                    <td className="px-6 py-4">
                                        <span className={\`px-3 py-1 rounded-full text-xs font-bold \${
                                            res.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            res.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }\`}>
                                            {res.status.toUpperCase()}
                                        </span>
                                    </td>
                                    {user?.role === 'admin' && (
                                        <td className="px-6 py-4 flex gap-2">
                                            {res.status === 'pending' && (
                                                <>
                                                    <button onClick={() => updateStatus(res._id, 'confirmed')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg">
                                                        <Check size={16}/>
                                                    </button>
                                                    <button onClick={() => updateStatus(res._id, 'cancelled')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg">
                                                        <X size={16}/>
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {reservations.length === 0 && (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">No reservations found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}`);

// 6. Update App.jsx
fs.writeFileSync(path.join(__dirname, 'frontend/src/App.jsx'), `import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Restaurants from './pages/Restaurants';
import BookTable from './pages/BookTable';
import Reservations from './pages/Reservations';
import { useContext } from 'react';
import { AuthContext as AC } from './context/AuthContext';

function RoleBasedHome() {
    const { user } = useContext(AC);
    if (!user) return <Navigate to="/login" replace />;
    return user.role === 'admin' ? <Navigate to="/restaurants" replace /> : <Navigate to="/book-table" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<RoleBasedHome />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="book-table" element={<BookTable />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="users" element={<div className="p-8"><h1 className="text-2xl font-bold">Users Management</h1></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;`);

console.log('Role UI and Logic patched!');
