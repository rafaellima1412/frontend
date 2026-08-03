import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../api/client";

const ROLES = [
  { value: "coordenador", label: "Coordenador" },
  { value: "gerente", label: "Gerente" },
  { value: "colaborador", label: "Colaborador" },
];

const EMPTY_FORM = {
  username: "",
  full_name: "",
  cpf: "",
  password: "",
  role: "colaborador",
  subordinado_id: "",
  time_existente_id: "",
  novo_time: "",
  time_id: "",
};

export default function CadastrarUsuario() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [timeModo, setTimeModo] = useState("existente"); // "existente" | "novo" — só relevante pra gerente
  const [gerentes, setGerentes] = useState([]);
  const [times, setTimes] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/user/gerentes").then(setGerentes).catch(() => {});
    api.get("/times/list").then(setTimes).catch(() => {});
  }, [success]); // recarrega as listas depois de cada cadastro (novo gerente/time pode ter entrado)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const payload = {
        username: form.username,
        full_name: form.full_name,
        cpf: form.cpf,
        password: form.password,
        role: form.role,
        subordinado_id: form.role === "coordenador" && form.subordinado_id ? Number(form.subordinado_id) : null,
        time_existente_id:
          form.role === "gerente" && timeModo === "existente" && form.time_existente_id
            ? Number(form.time_existente_id)
            : null,
        novo_time: form.role === "gerente" && timeModo === "novo" ? form.novo_time : null,
        time_id: form.role === "colaborador" && form.time_id ? Number(form.time_id) : null,
      };

      await api.postJson("/user/register", payload);
      setSuccess(`${form.full_name} cadastrado(a) como ${form.role}.`);
      setForm({ ...EMPTY_FORM, role: form.role }); // mantém a role selecionada, limpa o resto
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erro ao cadastrar. Tenta de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <p className="text-sm text-slate-500">Olá,</p>
          <p className="font-medium text-ink-900">{user?.username}</p>
        </div>
        <button onClick={logout} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
          Sair
        </button>
      </header>

      <main className="mx-auto max-w-lg px-6 py-8">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">Cadastrar usuário</h1>
        <p className="mb-6 text-sm text-slate-500">Coordenador, gerente ou colaborador — só admin cadastra.</p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Papel</label>
            <div className="flex gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => updateField("role", r.value)}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    form.role === r.value
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Nome completo" value={form.full_name} onChange={(v) => updateField("full_name", v)} />
          <Field label="Usuário (login)" value={form.username} onChange={(v) => updateField("username", v)} />
          <Field label="CPF" value={form.cpf} onChange={(v) => updateField("cpf", v)} />
          <Field
            label="Senha inicial"
            type="password"
            value={form.password}
            onChange={(v) => updateField("password", v)}
          />

          {form.role === "coordenador" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Gerente subordinado</label>
              <select
                required
                value={form.subordinado_id}
                onChange={(e) => updateField("subordinado_id", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                <option value="" disabled>
                  Escolher gerente…
                </option>
                {gerentes.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.full_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400">
                O(s) time(s) desse gerente passam a ficar sob esse coordenador.
              </p>
            </div>
          )}

          {form.role === "gerente" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Time</label>
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setTimeModo("existente")}
                  className={`rounded-lg border px-3 py-1 ${
                    timeModo === "existente" ? "border-brand-500 text-brand-700" : "border-slate-300 text-slate-500"
                  }`}
                >
                  Time existente
                </button>
                <button
                  type="button"
                  onClick={() => setTimeModo("novo")}
                  className={`rounded-lg border px-3 py-1 ${
                    timeModo === "novo" ? "border-brand-500 text-brand-700" : "border-slate-300 text-slate-500"
                  }`}
                >
                  Criar novo time
                </button>
              </div>

              {timeModo === "existente" ? (
                <select
                  required
                  value={form.time_existente_id}
                  onChange={(e) => updateField("time_existente_id", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  <option value="" disabled>
                    Escolher time…
                  </option>
                  {times.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Field
                  label={null}
                  placeholder="Nome do novo time"
                  value={form.novo_time}
                  onChange={(v) => updateField("novo_time", v)}
                />
              )}
            </div>
          )}

          {form.role === "colaborador" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Time (opcional)</label>
              <select
                value={form.time_id}
                onChange={(e) => updateField("time_id", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Sem time por enquanto</option>
                {times.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Cadastrando…" : "Cadastrar"}
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        type={type}
        required
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}