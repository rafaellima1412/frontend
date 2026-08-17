import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../api/client";

const ROLES = [
  { value: "gerente", label: "Gerente" },
  { value: "coordenador", label: "Coordenador" },
  { value: "colaborador", label: "Colaborador" },
];

const EMPTY_FORM = {
  username: "",
  full_name: "",
  cpf: "",
  password: "",
  role: "colaborador",
};

export default function CadastrarUsuario() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
        <p className="mb-6 text-sm text-slate-500">Gerente, coordenador ou colaborador — só admin cadastra.</p>

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
