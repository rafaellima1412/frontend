import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

const PLANOS = ["500MB", "1GB", "2GB", "10GB"];
const STATUS = [
  { value: "vendido", label: "Vendido" },
  { value: "pendente", label: "Pendente" },
  { value: "cancelado", label: "Cancelado" },
];

/** O CPF fica salvo formatado ("111.111.111-11"), mas o endpoint de venda
 * espera um inteiro puro — é assim que o contrato já foi combinado com o
 * ERP, então normalizamos aqui em vez de mudar o back. */
function cpfParaInteiro(cpf) {
  const digitos = (cpf ?? "").replace(/\D/g, "");
  return digitos ? Number(digitos) : null;
}

function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function SimularVenda() {
  const { user } = useAuth();
  const homeHref = user?.role === "coordenador" ? "/inicio" : "/gerente";

  const [busca, setBusca] = useState("");
  const [colaboradores, setColaboradores] = useState(null);
  const [colaborador, setColaborador] = useState(null);

  const [campanhas, setCampanhas] = useState(null);
  const [campanhaId, setCampanhaId] = useState("");

  const [plano, setPlano] = useState(PLANOS[0]);
  const [status, setStatus] = useState("vendido");
  const [descricao, setDescricao] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [recentes, setRecentes] = useState(null);

  const buscaDebounced = useDebounced(busca, 300);

  useEffect(() => {
    if (colaborador) return; // já escolheu — não precisa mais buscar
    const params = buscaDebounced.trim() ? `?q=${encodeURIComponent(buscaDebounced.trim())}` : "";
    api
      .get(`/user/colaboradores${params}`)
      .then(setColaboradores)
      .catch((err) => setErro(err instanceof ApiError ? err.detail : "Erro ao buscar colaboradores."));
  }, [buscaDebounced, colaborador]);

  useEffect(() => {
    if (!colaborador) {
      setCampanhas(null);
      setCampanhaId("");
      return;
    }
    api
      .get(`/campanhas/de-usuario/${colaborador.id}`)
      .then((lista) => {
        setCampanhas(lista);
        setCampanhaId(lista[0]?.id ?? "");
      })
      .catch((err) => setErro(err instanceof ApiError ? err.detail : "Erro ao buscar campanhas do colaborador."));
  }, [colaborador]);

  function carregarRecentes() {
    api
      .get("/vendas/")
      .then((lista) => setRecentes(lista.slice(0, 8)))
      .catch(() => {}); // lista de apoio — falha aqui não deve travar a tela
  }

  useEffect(carregarRecentes, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);

    const cpfInteiro = cpfParaInteiro(colaborador?.cpf);
    if (!colaborador || !campanhaId || !cpfInteiro) {
      setErro("Escolha um colaborador e uma campanha antes de registrar a venda.");
      return;
    }

    setEnviando(true);
    try {
      await api.postJson("/vendas/", {
        plano,
        status,
        descricao,
        cpf_vendedor: cpfInteiro,
        campanha_id: Number(campanhaId),
        usuario_id: colaborador.id,
      });

      setDescricao("");
      setStatus("vendido");
      setPlano(PLANOS[0]);
      carregarRecentes();
    } catch (err) {
      setErro(err instanceof ApiError ? err.detail : "Erro ao registrar a venda. Tenta de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link to={homeHref} className="text-sm text-slate-500 hover:text-brand-700">
          ← Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">Simular venda</h1>
        <p className="mb-6 text-sm text-slate-500">
          Registra manualmente uma venda vinculada a uma campanha, no mesmo formato que a
          integração com o ERP vai usar futuramente.
        </p>

        {erro && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {erro}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
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

          {colaborador && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Campanha</label>
              {campanhas === null && <p className="text-xs text-slate-400">Carregando campanhas…</p>}
              {campanhas?.length === 0 && (
                <p className="text-xs text-slate-400">Esse colaborador ainda não tem nenhuma campanha.</p>
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
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Plano</label>
              <select
                value={plano}
                onChange={(e) => setPlano(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {PLANOS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {STATUS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Descrição</label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Venda realizada referente à campanha de lançamento regional."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <button
            type="submit"
            disabled={enviando || !colaborador || !campanhaId}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {enviando ? "Registrando…" : "Registrar venda"}
          </button>
        </form>

        {recentes && recentes.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
              Últimas vendas registradas
            </h2>
            <ul className="divide-y divide-slate-100 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              {recentes.map((v) => (
                <li key={v.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink-900">
                      {v.usuario?.full_name ?? "—"} <span className="text-slate-400">· {v.plano}</span>
                    </p>
                    <p className="text-xs text-slate-400">{v.campanha?.title ?? "—"}</p>
                  </div>
                  <span
                    className={
                      "rounded-full px-2.5 py-0.5 text-xs font-medium " +
                      (v.status === "vendido"
                        ? "bg-green-50 text-green-700"
                        : v.status === "cancelado"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700")
                    }
                  >
                    {v.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
