import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/** Sends signed-out visitors to /login and remembers where they were going. */
export function ProtectedRoute() {
  const { isAuthed } = useAuth();
  const location = useLocation();
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

/** Login and signup: signed-in users go straight to the dashboard. */
export function PublicOnlyRoute() {
  const { isAuthed } = useAuth();
  if (isAuthed) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
