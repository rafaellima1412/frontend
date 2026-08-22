import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError, mediaUrl } from "../api/client";
import { formatDate, formatPostType } from "../utils/format";

export default function DetalheCampanha() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/campanhas/${id}`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.detail : "Erro ao carregar campanha."));
  }, [id]);

  const campanha = data?.campaign;
  const postTypeLabel = formatPostType(campanha?.post_type);
  const dateLabel = formatDate(campanha?.data_criacao);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-brand-700">
          ← Voltar
        </Link>
        {data?.editable && (
          <Link
            to={`/campanhas/${id}/editar`}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Editar
          </Link>
        )}
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {!campanha && !error && <p className="text-sm text-slate-400">Carregando…</p>}

        {campanha && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {campanha.image && (
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <img
                  src={mediaUrl(campanha.image)}
                  alt={campanha.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-lg font-semibold text-ink-900">{campanha.title}</h1>
                {postTypeLabel && (
                  <span className="inline-flex shrink-0 items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                    {postTypeLabel}
                  </span>
                )}
              </div>

              <p className="text-sm whitespace-pre-line text-slate-600">{campanha.paragraph}</p>

              {campanha.url && (
                <a
                  href={campanha.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-sm font-medium text-brand-600 hover:underline"
                >
                  Abrir link →
                </a>
              )}

              <dl className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-400 uppercase">Região</dt>
                  <dd className="mt-0.5 text-ink-900">{campanha.local?.nome ?? "Sem região definida"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-400 uppercase">Coordenador</dt>
                  <dd className="mt-0.5 text-ink-900">{campanha.coordenador?.full_name ?? "Sem coordenador"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-400 uppercase">Vendas fechadas</dt>
                  <dd className="mt-0.5 text-ink-900">{campanha.total_vendas}</dd>
                </div>
                {dateLabel && (
                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase">Criada em</dt>
                    <dd className="mt-0.5 text-ink-900">{dateLabel}</dd>
                  </div>
                )}
              </dl>

              <div className="border-t border-slate-100 pt-5">
                <p className="mb-2 text-xs font-medium text-slate-400 uppercase">
                  Colaboradores ({campanha.colaboradores.length})
                </p>
                {campanha.colaboradores.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum colaborador associado ainda.</p>
                ) : (
                  <ul className="space-y-1">
                    {campanha.colaboradores.map((c) => (
                      <li key={c.id} className="text-sm text-ink-900">
                        {c.full_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}