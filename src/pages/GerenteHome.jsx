import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ChoiceCard({ to, title, description, icon }) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-3 rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-brand-300"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl text-brand-700">
        {icon}
      </span>
      <h2 className="font-medium text-ink-900 group-hover:text-brand-700">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
    </Link>
  );
}

export default function GerenteHome() {
  const { user, logout } = useAuth();

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

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-1 text-lg font-semibold text-ink-900">O que você quer fazer?</h1>
        <p className="mb-8 text-sm text-slate-500">Escolha uma opção pra continuar.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <ChoiceCard
            to="/dashboard"
            icon="📊"
            title="Dashboard do time"
            description="Campanhas e vendas do seu time."
          />
          <ChoiceCard
            to="/campanhas/nova"
            icon="📣"
            title="Criar campanha"
            description="Gera o material com QR code pra um colaborador."
          />
          <ChoiceCard
            to="/associar-colaboradores"
            icon="🧑‍🤝‍🧑"
            title="Associar colaboradores"
            description="Busca um colaborador e define o time dele."
          />
          <ChoiceCard
            to="/simular-venda"
            icon="💰"
            title="Simular venda"
            description="Registra uma venda pra uma campanha, no formato que o ERP vai usar."
          />
          <ChoiceCard
            to="/carteira-equipe"
            icon="📈"
            title="Carteira do time"
            description="Resultado e esforço somados dos colaboradores do seu time."
          />
        </div>
      </main>
    </div>
  );
}