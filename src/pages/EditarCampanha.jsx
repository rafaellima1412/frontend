import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../api/client";

const POST_TYPES = [
  { value: "promocao", label: "Promoção" },
  { value: "institucional", label: "Institucional" },
  { value: "lancamento", label: "Lançamento" },
];

export default function EditarCampanha() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [times, setTimes] = useState([]);
  const [selectedTimeIds, setSelectedTimeIds] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/campanhas/${id}`)
      .then((data) => {
        if (!data.editable) {
          navigate("/dashboard", { replace: true });
          return;
        }
        setForm({
          title: data.campaign.title ?? "",
          paragraph: data.campaign.paragraph ?? "",
          post_type: data.campaign.post_type ?? "promocao",
          url: data.campaign.url ?? "",
          matricula: "",
          folder_image: "",
        });
        setTimes(data.times ?? []);
      })
      .catch((err) => setError(err instanceof ApiError ? err.detail : "Erro ao carregar campanha."));
  }, [id, navigate]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTime(timeId) {
    setSelectedTimeIds((prev) =>
      prev.includes(timeId) ? prev.filter((t) => t !== timeId) : [...prev, timeId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.putJson(`/campanhas/${id}`, {
        title: form.title,
        paragraph: form.paragraph,
        time_ids: selectedTimeIds,
        post_type: form.post_type,
        url: form.url || null,
        matricula: form.matricula || null,
        folder_image: form.folder_image || null, // se preenchido, regenera a imagem com QR novo
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erro ao salvar. Tenta de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-brand-700">
          ← Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-lg px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">Editar campanha</h1>
        <p className="mb-6 text-sm text-slate-500">Só os campos preenchidos aqui mudam.</p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {!form && !error && <p className="text-sm text-slate-400">Carregando…</p>}

        {form && (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <Field label="Título" value={form.title} onChange={(v) => updateField("title", v)} />
            <TextArea label="Texto" value={form.paragraph} onChange={(v) => updateField("paragraph", v)} />

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Tipo</label>
              <select
                value={form.post_type}
                onChange={(e) => updateField("post_type", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {POST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="Link (opcional)"
              required={false}
              value={form.url}
              onChange={(v) => updateField("url", v)}
              placeholder="https://…"
            />

            {times.length > 0 && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Times</label>
                <div className="flex flex-wrap gap-2">
                  {times.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => toggleTime(t.id)}
                      className={`rounded-lg border px-3 py-1 text-sm ${
                        selectedTimeIds.includes(t.id)
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-300 text-slate-600"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-1 text-xs font-medium tracking-wide text-slate-400 uppercase">
                Regenerar imagem (opcional)
              </p>
              <p className="mb-3 text-xs text-slate-400">
                Só preencha se quiser trocar a arte ou colar o QR de novo com outra matrícula.
              </p>
              <div className="space-y-3">
                <Field
                  label="Matrícula"
                  required={false}
                  value={form.matricula}
                  onChange={(v) => updateField("matricula", v)}
                />
                <Field
                  label="Nova imagem base (URL)"
                  required={false}
                  value={form.folder_image}
                  onChange={(v) => updateField("folder_image", v)}
                  placeholder="https://…/arte.png"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "Salvando…" : "Salvar"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, required = true }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <textarea
        required
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
