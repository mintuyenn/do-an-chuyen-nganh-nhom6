import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  // Nếu đang fetch profile thì show loading hoặc null
  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
