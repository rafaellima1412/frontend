import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Admin só existe pra cadastrar gente — não tem dashboard nem mais nada.
 * Quem não é admin e tentar acessar uma rota admin cai no /dashboard.
 */
export default function RequireAdmin() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}