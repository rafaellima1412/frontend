import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Igual a RequireGerente/RequireCoordenador, mas pra telas que os dois
 * papéis acessam (ex: simular venda).
 */
export default function RequireGerenteOuCoordenador() {
  const { user } = useAuth();

  if (user?.role !== "coordenador" && user?.role !== "gerente") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}