import { useState, useContext } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
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
                    <p className="text-center text-sm text-gray-500 mt-2">
                       Don't have an account? <Link to="/register" className="text-primary hover:underline font-bold">Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}