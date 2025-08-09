import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Analytics from './Analytics';
import { getBettingHistory, logout, getAccessToken } from './api';

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => getAccessToken());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
  const navigate = useNavigate();

  const handleLogin = (token) => {
    setAccessToken(token);
    localStorage.setItem('accessToken', token);
    setIsAuthenticated(true);
    navigate('/analytics');
  };

  const handleLogout = () => {
    logout();
    setAccessToken('');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value = {
    accessToken,
    isAuthenticated,
    handleLogin,
    handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Login Page Component
const LoginPage = () => {
  const { handleLogin, isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/analytics" replace />;
  }

  return <Login onLogin={handleLogin} />;
};

// Analytics Page Component
const AnalyticsPage = () => {
  const { handleLogout } = useAuth();
  const [rawBettingData, setRawBettingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBets = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getBettingHistory();
        if (Array.isArray(res)) {
          setRawBettingData(res);
        } else if (res && Array.isArray(res.data)) {
          setRawBettingData(res.data);
        } else {
          setError('No betting data found.');
        }
      } catch (err) {
        if (err.message === 'unauthorized') {
          handleLogout();
        } else {
          setError('Failed to fetch betting data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [handleLogout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading betting data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex justify-end p-4">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <Analytics rawBettingData={rawBettingData} />
    </>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;