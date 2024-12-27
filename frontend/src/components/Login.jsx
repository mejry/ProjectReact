import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real app, make API call here
      const response = await mockLogin(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('userRole', response.role);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">HR Management System</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

const mockLogin = async (credentials) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      if (credentials.email === 'admin@hr.com' && credentials.password === 'admin') {
        resolve({ token: 'mock-token', role: 'admin' });
      } else if (credentials.email === 'employee@hr.com' && credentials.password === 'employee') {
        resolve({ token: 'mock-token', role: 'employee' });
      } else {
        reject(new Error('Invalid credentials'));
      }
    });
  };