import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireGerente() {
  const { user } = useAuth();

  if (user?.role !== "gerente") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
