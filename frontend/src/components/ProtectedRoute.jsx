import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const authToken = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Check if user is authenticated
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user's actual role
      if (user.role === 'doctor') {
        return <Navigate to="/dashboard/doctor" replace />;
      } else if (user.role === 'patient') {
        return <Navigate to="/dashboard/patient" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
}

export default ProtectedRoute;