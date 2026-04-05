import { useContext } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LogOut, 
    Store, 
    Users, 
    LayoutDashboard, 
    UtensilsCrossed, 
    CalendarCheck, 
    CalendarRange, 
    TicketPercent, 
    Heart 
} from 'lucide-react';

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
            { path: '/promotions', icon: <TicketPercent size={20}/>, label: 'Promotions' },
            { path: '/users', icon: <Users size={20}/>, label: 'Users' }
        ];
    } else {
        // Phần Menu dành cho khách hàng (Sơn Nấm)
        menu = [
            { path: '/restaurants', icon: <Store size={20}/>, label: 'Restaurants' },
            { path: '/book-table', icon: <CalendarRange size={20}/>, label: 'Book a Table' },
            { path: '/reservations', icon: <CalendarCheck size={20}/>, label: 'My Bookings' },
            { path: '/favorites', icon: <Heart size={20}/>, label: 'My Favorites' },
            { path: '/promotions', icon: <TicketPercent size={20}/>, label: 'Deals & Promos' }
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
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${ 
                                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                                ? 'bg-primary/10 text-primary font-semibold' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow flex items-center justify-center overflow-hidden">
                             {user.avatar ? (
                                 <img src={`http://localhost:5000${user.avatar}`} className="w-full h-full object-cover" />
                             ) : (
                                 <span className="text-gray-500 font-bold">{user.name.charAt(0)}</span>
                             )}
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
}