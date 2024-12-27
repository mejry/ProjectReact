import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Calendar, Clock, Home, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const navigation = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: Home,
      allowedRoles: ['admin', 'employee'] 
    },
    { 
      name: 'Employees', 
      path: '/employees', 
      icon: Users,
      allowedRoles: ['admin']
    },
    { 
      name: 'Leave Management', 
      path: '/leaves', 
      icon: Calendar,
      allowedRoles: ['admin', 'employee']
    },
    { 
      name: 'Timesheet', 
      path: '/timesheet', 
      icon: Clock,
      allowedRoles: ['admin', 'employee']
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: User,
      allowedRoles: ['admin', 'employee']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.allowedRoles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-blue-950 text-gray-200 flex flex-col h-full p-2">
      <div className="p-5 bg-blue-950 border-b border-blue-800">
        <h2 className="text-2xl font-bold">Human Resource <div className='text-center'>System</div> </h2>
      </div>
      <nav className="mt-5 space-y-2 flex-1">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-5 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  isActive ? 'bg-blue-800 text-white' : 'hover:bg-blue-700 hover:text-gray-100'
                }`
              }
            >
              <Icon className="h-5 w-5 mr-3 text-gray-400" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button at the Bottom */}
      <div className="mt-auto px-5 mb-4">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-red-600 text-white rounded-lg shadow-sm hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
