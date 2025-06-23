import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('token');

  if (!token) return <Navigate to="/login" />;
  const { role } = jwtDecode(token);

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  return children;
}
