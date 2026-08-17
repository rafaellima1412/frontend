import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Fica dentro de <ProtectedRoute> (já garante que há usuário logado) e
 * adiciona a checagem de role: só coordenador passa. Quem não é, cai no
 * dashboard normal em vez de ver uma tela vazia ou erro 403 da API.
 */
export default function RequireCoordenador() {
  const { user } = useAuth();

  if (user?.role !== "gerente") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}