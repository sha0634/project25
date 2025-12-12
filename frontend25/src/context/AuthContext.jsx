import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_URL = 'http://localhost:5000/api';

    // Check if user is logged in on mount
    useEffect(() => {
        if (token) {
            fetchCurrentUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        try {
            console.log('Sending signup request:', userData);
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                // Redirect based on user type
                if (data.user.userType === 'student') {
                    navigate('/stdashboard');
                } else if (data.user.userType === 'company') {
                    navigate('/codashboard');
                } else {
                    navigate('/');
                }
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'Error connecting to server. Make sure backend is running on port 5000.' };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                // Redirect based on user type
                if (data.user.userType === 'student') {
                    navigate('/stdashboard');
                } else if (data.user.userType === 'company') {
                    navigate('/codashboard');
                } else {
                    navigate('/');
                }
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Error connecting to server' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    const value = {
        user,
        token,
        loading,
        signup,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
