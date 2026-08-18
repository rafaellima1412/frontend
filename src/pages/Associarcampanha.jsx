import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { mediaUrl } from "../api/client";

function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function AssociarCampanha() {
  const [busca, setBusca] = useState("");
  const [colaboradores, setColaboradores] = useState(null);
  const [colaborador, setColaborador] = useState(null);

  const [campanhas, setCampanhas] = useState(null);
  const [campanhaId, setCampanhaId] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  const buscaDebounced = useDebounced(busca, 300);

  useEffect(() => {
    if (colaborador) return;
    const params = buscaDebounced.trim() ? `?q=${encodeURIComponent(buscaDebounced.trim())}` : "";
    api
      .get(`/user/colaboradores${params}`)
      .then(setColaboradores)
      .catch((err) => setErro(err instanceof ApiError ? err.detail : "Erro ao buscar colaboradores."));
  }, [buscaDebounced, colaborador]);

  useEffect(() => {
    api
      .get("/campanhas/do-time")
      .then((lista) => {
        setCampanhas(lista);
        setCampanhaId(lista[0]?.id ?? "");
      })
      .catch((err) => setErro(err instanceof ApiError ? err.detail : "Erro ao buscar campanhas do time."));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!colaborador || !campanhaId) {
      setErro("Escolha um colaborador e uma campanha.");
      return;
    }

    setEnviando(true);
    try {
      await api.postJson(`/campanhas/${campanhaId}/colaboradores`, {
        usuario_id: colaborador.id,
      });
      setSucesso(`${colaborador.full_name} associado à campanha com sucesso.`);
      setColaborador(null);
      setBusca("");
    } catch (err) {
      setErro(err instanceof ApiError ? err.detail : "Erro ao associar. Tenta de novo.");
    } finally {
      setEnviando(false);
    }
  }

  const campanhaSelecionada = campanhas?.find((c) => String(c.id) === String(campanhaId));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link to="/gerente" className="text-sm text-slate-500 hover:text-brand-700">
          ← Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">Associar colaborador a campanha</h1>
        <p className="mb-6 text-sm text-slate-500">
          Adiciona um colaborador do seu time a uma campanha que já existe.
        </p>

        {erro && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {erro}
          </p>
        )}
        {sucesso && (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
            {sucesso}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Campanha</label>
            {campanhas === null && <p className="text-xs text-slate-400">Carregando campanhas do time…</p>}
            {campanhas?.length === 0 && (
              <p className="text-xs text-slate-400">Seu time ainda não tem nenhuma campanha.</p>
            )}
            {campanhas && campanhas.length > 0 && (
              <select
                value={campanhaId}
                onChange={(e) => setCampanhaId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {campanhas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}
            {campanhaSelecionada?.image && (
              <img
                src={mediaUrl(campanhaSelecionada.image)}
                alt={campanhaSelecionada.title}
                className="mt-2 h-24 w-auto rounded-lg border border-slate-200 object-contain"
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Colaborador</label>

            {colaborador ? (
              <div className="flex items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <span>
                  {colaborador.full_name} <span className="text-slate-400">· {colaborador.cpf}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setColaborador(null);
                    setBusca("");
                  }}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome ou CPF…"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                {colaboradores && colaboradores.length > 0 && (
                  <ul className="mt-1 max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                    {colaboradores.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => setColaborador(c)}
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                        >
                          <span className="font-medium text-ink-900">{c.full_name}</span>{" "}
                          <span className="text-slate-400">· {c.cpf}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {colaboradores && colaboradores.length === 0 && (
                  <p className="mt-1 text-xs text-slate-400">Nenhum colaborador encontrado.</p>
                )}
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={enviando || !colaborador || !campanhaId}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {enviando ? "Associando…" : "Associar"}
          </button>
        </form>
      </main>
    </div>
  );
}