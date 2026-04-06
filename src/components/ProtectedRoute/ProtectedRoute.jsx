import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * envuelve las rutas protegidas, verificando si el usuario está autenticado y tiene el rol adecuado.
 * @param {string[]} allowedRoles 
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
