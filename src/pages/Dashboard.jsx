import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../api/client";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/campanhas/by-usuario")
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.detail : "Erro ao carregar dashboard."));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <p className="text-sm text-slate-500">Olá,</p>
          <p className="font-medium text-ink-900">{user?.username}</p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
        >
          Sair
        </button>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!data && !error && <p className="text-sm text-slate-400">Carregando campanhas…</p>}

        {data && (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.campanhas?.length ? (
              data.campanhas.map((campanha) => (
                <article
                  key={campanha.id}
                  className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <h2 className="font-medium text-ink-900">{campanha.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{campanha.paragraph}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-400">Nenhuma campanha ainda.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
