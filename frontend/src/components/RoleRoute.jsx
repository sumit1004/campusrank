import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../utils/auth';

const RoleRoute = ({ children, allowed }) => {
  const user = getUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.role)) {
    // If not authorized, redirect them to their respective dashboard
    if (user.role === 'superadmin') return <Navigate to="/superadmin-dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
