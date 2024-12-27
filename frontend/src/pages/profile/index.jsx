import React from 'react';
import ProfileInfo from './ProfileInfo';
import PasswordChange from './PasswordChange';

const ProfilePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-t-md p-6 rounded-lg shadow-xl">
      <h1 className="text-4xl font-semibold text-white">Account Settings</h1>
        
      </div>
      
      <div className="space-y-6">
        <ProfileInfo />
        <PasswordChange />
      </div>
    </div>
  );
};

export default ProfilePage;