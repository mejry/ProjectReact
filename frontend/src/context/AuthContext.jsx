import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Base URL for your API
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const checkStaticAccounts = (email, password) => {
    const staticAccounts = {
      admin: {
        email: 'admin@example.com',
        password: 'admin',
        token: 'static-admin-token',
        user: {
          id: 'admin1',
          name: 'Admin User',
          email: 'admin@hrms.com',
          role: 'admin'
        }
      },
      employee: {
        email: 'employee@hrms.com',
        password: 'employee123',
        token: 'static-employee-token',
        user: {
          id: 'emp1',
          name: 'Employee User',
          email: 'employee@hrms.com',
          role: 'employee'
        }
      }
    };

    // Check admin account
    if (email === staticAccounts.admin.email && password === staticAccounts.admin.password) {
      return {
        token: staticAccounts.admin.token,
        ...staticAccounts.admin.user
      };
    }

    // Check employee account
    if (email === staticAccounts.employee.email && password === staticAccounts.employee.password) {
      return {
        token: staticAccounts.employee.token,
        ...staticAccounts.employee.user
      };
    }

    return null;
  };

  const login = async (email, password) => {
    try {
      console.log("email",email,password);

      setLoading(true);
      setError(null);

      // First try static accounts
    //   const staticUser = checkStaticAccounts(email, password);
    //   if (staticUser) {
    //     localStorage.setItem('token', staticUser.token);
    //     localStorage.setItem('user', JSON.stringify(staticUser));
    //     localStorage.setItem('userRole', staticUser.role);
    //     setUser(staticUser);
    //     return staticUser;
    //   }

      // If not a static account, try database authentication
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);
      setUser(userData);
      return userData;

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);