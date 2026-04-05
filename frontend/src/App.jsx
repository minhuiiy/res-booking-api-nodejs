import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Restaurants from './pages/Restaurants';
import BookTable from './pages/BookTable';
import Menus from './pages/Menus';
import Reservations from './pages/Reservations';
import Promotions from './pages/Promotions';
import Users from './pages/Users';
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
            <Route path="promotions" element={<Promotions />} />
            <Route path="menus" element={<Menus />} />
            <Route path="book-table" element={<BookTable />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;