const fs = require('fs');
const path = require('path');

const dirs = [
    'frontend/src',
    'frontend/src/components',
    'frontend/src/pages',
    'frontend/src/context',
    'frontend/src/utils',
    'frontend/src/assets'
];

dirs.forEach(dir => {
    fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

const files = {
    'frontend/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Restaurant Booking Admin</title>
  </head>
  <body class="bg-gray-50 text-gray-900 font-sans antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,

    'frontend/vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`,

    'frontend/tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF4C24',
        secondary: '#2B2B2B',
      }
    },
  },
  plugins: [],
}`,

    'frontend/src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
    .input-field {
        @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all;
    }
    .btn-primary {
        @apply bg-primary hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md;
    }
    .glass-card {
        @apply bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl;
    }
}`,

    'frontend/src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,

    'frontend/src/utils/api.js': `import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
            config.headers.Authorization = \`Bearer \${token}\`;
        }
    }
    return config;
});

export default api;`,

    'frontend/src/context/AuthContext.jsx': `import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/users/login', { email, password });
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};`,

    'frontend/src/App.jsx': `import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Restaurants from './pages/Restaurants';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/restaurants" replace />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="users" element={<div className="p-8"><h1 className="text-2xl font-bold">Users Management</h1></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;`,

    'frontend/src/components/DashboardLayout.jsx': `import { useContext } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Store, Users, LayoutDashboard, UtensilsCrossed } from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const menu = [
        { path: '/', icon: <LayoutDashboard size={20}/>, label: 'Dashboard' },
        { path: '/restaurants', icon: <Store size={20}/>, label: 'Restaurants' },
        { path: '/menu', icon: <UtensilsCrossed size={20}/>, label: 'Menu Items' },
        { path: '/users', icon: <Users size={20}/>, label: 'Users' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
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

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}`,

    'frontend/src/pages/Login.jsx': `import { useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            
            <div className="glass-card w-full max-w-md p-8 relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Admin Portal Login</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 border border-red-100 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            className="input-field" 
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input 
                            type="password" 
                            className="input-field" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex justify-center items-center">
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                    
                    <p className="text-center text-sm text-gray-500 mt-6">
                       Demo Account: admin@test.com / 123456
                    </p>
                </form>
            </div>
        </div>
    );
}`,

    'frontend/src/pages/Restaurants.jsx': `import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit2, Trash2, MapPin, Phone } from 'lucide-react';

export default function Restaurants() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
    const [file, setFile] = useState(null);

    const fetchRestaurants = async () => {
        try {
            const { data } = await api.get('/restaurants');
            setRestaurants(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const uploadData = new FormData();
            uploadData.append('name', formData.name);
            uploadData.append('address', formData.address);
            uploadData.append('phone', formData.phone);
            if (file) uploadData.append('image', file);

            await api.post('/restaurants', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setIsModalOpen(false);
            setFormData({ name: '', address: '', phone: '' });
            setFile(null);
            fetchRestaurants();
        } catch (error) {
            console.error(error);
            alert('Error adding restaurant');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this restaurant?')) {
            try {
                await api.delete(\`/restaurants/\${id}\`);
                fetchRestaurants();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Restaurants</h1>
                    <p className="text-gray-500 mt-1">Manage your branches and locations.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 shadow-primary/30"
                >
                    <Plus size={18} /> Add New
                </button>
            </div>
            
            {loading ? (
                <div className="flex px-4 py-10 justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent flex rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {restaurants.map(rest => (
                        <div key={rest._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="h-48 rounded-xl overflow-hidden mb-4 bg-gray-100 relative">
                                {rest.image ? (
                                    <img src={\`http://localhost:5000\${rest.image}\`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{rest.name}</h3>
                            <div className="space-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2 px-1">
                                    <MapPin size={16} className="text-primary/70 shrink-0" />
                                    <span className="truncate">{rest.address}</span>
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    <Phone size={16} className="text-primary/70 shrink-0" />
                                    <span>{rest.phone}</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">
                                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(rest._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative animate-in zoom-in-95">
                        <h2 className="text-2xl font-bold mb-6">Add Restaurant</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input required className="input-field" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input required className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                                <input type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" onChange={e => setFile(e.target.files[0])} />
                            </div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="btn-primary">Save Branch</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}`
};

for (const [filePath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(__dirname, filePath), content);
}
console.log("Frontend React templates generated");
