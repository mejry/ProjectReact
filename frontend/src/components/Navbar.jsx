import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="bg-blue-900 shadow-md border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-200">
              Human Resource Management<span className="text-blue-500">.</span>
            </h1>
          </div>

          {/* User Info Section */}
          <div className="flex items-center space-x-3">
            <span className="text-xl font-medium text-gray-200">
              {user?.name || 'Guest'}
            </span>
            <User className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
