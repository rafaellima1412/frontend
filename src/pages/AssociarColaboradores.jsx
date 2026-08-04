import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import EmptyState from "../components/EmptyState";

/** Espera o usuário parar de digitar antes de buscar, pra não disparar uma
 * requisição a cada tecla. */
function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function AssociarColaboradores() {
  const [colaboradores, setColaboradores] = useState(null);
  const [times, setTimes] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [pendingByUser, setPendingByUser] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [savedId, setSavedId] = useState(null);

  const buscaDebounced = useDebounced(search, 300);

  // Carrega os times uma vez só (lista curta, sem necessidade de busca).
  useEffect(() => {
    api
      .get("/times/list")
      .then(setTimes)
      .catch((err) => setError(err instanceof ApiError ? err.detail : "Erro ao carregar times."));
  }, []);

  // A busca por colaborador roda no backend — a lista pode ter muita gente,
  // então não faz sentido trazer todo mundo pro navegador de uma vez.
  useEffect(() => {
    const params = buscaDebounced.trim() ? `?q=${encodeURIComponent(buscaDebounced.trim())}` : "";
    setColaboradores(null);
    api
      .get(`/user/colaboradores${params}`)
      .then(setColaboradores)
      .catch((err) =>
        setError(err instanceof ApiError ? err.detail : "Erro ao buscar colaboradores.")
      );
  }, [buscaDebounced]);

  const timesById = useMemo(() => {
    const map = new Map();
    times?.forEach((t) => map.set(t.id, t));
    return map;
  }, [times]);

  function selectedTimeId(colaborador) {
    return pendingByUser[colaborador.id] ?? colaborador.time_id ?? "";
  }

  async function handleSave(colaborador) {
    const novoTimeId = selectedTimeId(colaborador);
    if (!novoTimeId) return;

    setSavingId(colaborador.id);
    setSavedId(null);
    setError(null);
    try {
      const atualizado = await api.putJson(`/user/${colaborador.id}/time`, {
        time_id: Number(novoTimeId),
      });
      setColaboradores((prev) =>
        prev.map((c) => (c.id === colaborador.id ? { ...c, time_id: atualizado.time_id } : c))
      );
      setSavedId(colaborador.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erro ao salvar. Tenta de novo.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link to="/gerente" className="text-sm text-slate-500 hover:text-brand-700">
          ← Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">Associar colaborador a um time</h1>
        <p className="mb-6 text-sm text-slate-500">Busque pelo nome ou CPF do colaborador.</p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou CPF…"
          className="mb-6 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {!colaboradores && !error && <p className="text-sm text-slate-400">Carregando colaboradores…</p>}

        {colaboradores && colaboradores.length === 0 && (
          <EmptyState
            message={search ? "Nenhum colaborador encontrado." : "Nenhum colaborador cadastrado ainda."}
          />
        )}

        {colaboradores && colaboradores.length > 0 && (
          <ul className="flex flex-col gap-3">
            {colaboradores.map((colaborador) => {
              const timeAtual = timesById.get(colaborador.time_id);
              return (
                <li
                  key={colaborador.id}
                  className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-ink-900">{colaborador.full_name}</p>
                    <p className="text-xs text-slate-400">
                      {colaborador.cpf} · {timeAtual ? `Time atual: ${timeAtual.name}` : "Sem time"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTimeId(colaborador)}
                      onChange={(e) =>
                        setPendingByUser((prev) => ({ ...prev, [colaborador.id]: e.target.value }))
                      }
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="" disabled>
                        Escolher time…
                      </option>
                      {times?.map((time) => (
                        <option key={time.id} value={time.id}>
                          {time.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleSave(colaborador)}
                      disabled={savingId === colaborador.id || !selectedTimeId(colaborador)}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
                    >
                      {savingId === colaborador.id ? "Salvando…" : "Salvar"}
                    </button>

                    {savedId === colaborador.id && <span className="text-xs text-green-600">Salvo!</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}