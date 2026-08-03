import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import EmptyState from "../components/EmptyState";

export default function DelegarTimes() {
  const [times, setTimes] = useState(null);
  const [gerentes, setGerentes] = useState(null);
  const [error, setError] = useState(null);
  const [pendingByTime, setPendingByTime] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/times/list"), api.get("/user/gerentes")])
      .then(([timesRes, gerentesRes]) => {
        setTimes(timesRes);
        setGerentes(gerentesRes);
      })
      .catch((err) => setError(err instanceof ApiError ? err.detail : "Erro ao carregar times."));
  }, []);

  function selectedGerenteId(time) {
    return pendingByTime[time.id] ?? time.gerente_id ?? "";
  }

  async function handleSave(time) {
    const novoGerenteId = selectedGerenteId(time);
    if (!novoGerenteId) return;

    setSavingId(time.id);
    setSavedId(null);
    setError(null);
    try {
      const atualizado = await api.putJson(`/times/${time.id}`, {
        name: time.name,
        local_id: time.local_id,
        gerente_id: Number(novoGerenteId),
        coo_id: time.coo_id,
      });
      setTimes((prev) => prev.map((t) => (t.id === time.id ? atualizado : t)));
      setSavedId(time.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erro ao salvar. Tenta de novo.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link to="/inicio" className="text-sm text-slate-500 hover:text-brand-700">
          ← Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">Delegar times a gerentes</h1>
        <p className="mb-6 text-sm text-slate-500">
          Escolha qual gerente fica responsável por cada time.
        </p>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {!times && !error && <p className="text-sm text-slate-400">Carregando times…</p>}

        {times && times.length === 0 && (
          <EmptyState message="Nenhum time cadastrado ainda." />
        )}

        {times && times.length > 0 && (
          <ul className="flex flex-col gap-3">
            {times.map((time) => (
              <li
                key={time.id}
                className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-ink-900">{time.name}</p>
                  <p className="text-xs text-slate-400">
                    {time.gerente ? `Gerente atual: ${time.gerente.full_name}` : "Sem gerente responsável"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedGerenteId(time)}
                    onChange={(e) =>
                      setPendingByTime((prev) => ({ ...prev, [time.id]: e.target.value }))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="" disabled>
                      Escolher gerente…
                    </option>
                    {gerentes?.map((gerente) => (
                      <option key={gerente.id} value={gerente.id}>
                        {gerente.full_name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleSave(time)}
                    disabled={savingId === time.id || !selectedGerenteId(time)}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
                  >
                    {savingId === time.id ? "Salvando…" : "Salvar"}
                  </button>

                  {savedId === time.id && <span className="text-xs text-green-600">Salvo!</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}