import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RoleGuard = ({ allowedRoles = [], children }) => {
  const { user } = useAuth();

  // If user is unauthenticated (role is 'public' or missing), or not in allowedRoles
  if (!user || user.role === 'public' || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleGuard;