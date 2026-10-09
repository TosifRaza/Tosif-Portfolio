import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mono text-sm text-muted-foreground animate-pulse">Verifying credentials…</div>
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
