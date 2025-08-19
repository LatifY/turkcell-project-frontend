import React from 'react';
import useAuth from '../hooks/useAuth';

const AuthWrapper = ({ children }) => {
  // useAuth hook'u otomatik olarak token validation yapar
  useAuth();
  
  return children;
};

export default AuthWrapper;
