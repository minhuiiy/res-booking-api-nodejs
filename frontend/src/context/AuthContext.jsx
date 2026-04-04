import { createContext, useState, useEffect } from 'react';
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

    const registerUser = async (name, email, password) => {
        const { data } = await api.post('/users/register', { name, email, password });
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, registerUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};