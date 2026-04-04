import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Restaurants from './pages/Restaurants';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
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

export default App;