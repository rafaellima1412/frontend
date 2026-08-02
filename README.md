# Propulsor de vendas — frontend

React + Vite + Tailwind v4, separado do backend FastAPI.

## Rodando em dev

Precisa do backend rodando em `http://localhost:8000` (é pra onde o proxy do
Vite aponta — veja `vite.config.js`).

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Todas as chamadas para `/user/*`,
`/campanhas/*`, `/vendas/*`, `/times/*` e `/media/*` são encaminhadas pelo
Vite para o backend, então o browser trata tudo como uma origem só — o
cookie de sessão (`access_token`, httponly) funciona sem configuração extra
de CORS/SameSite em dev.

## Estrutura

```
src/
  api/client.js            # wrapper de fetch (sempre credentials: "include")
  context/AuthContext.jsx  # sessão atual, via GET /user/me
  routes/ProtectedRoute.jsx
  pages/                   # uma página por tela
```

## Próximos passos

- `frontend-reference/` no repo do backend tem as telas antigas em HTML
  (login, dashboard, criação/edição de campanha, cadastro) — use como
  referência de conteúdo e fluxo ao construir as páginas que faltam
  (Registro, Criar campanha, Editar campanha, Esqueci senha).
- Endpoints já existentes na API que ainda não têm página aqui:
  `POST /user/register`, `POST /user/forgot-password`,
  `POST /campanhas/` (multipart, cria campanha com upload de imagem),
  `PUT /campanhas/{id}`, `GET /campanhas/{id}`, `GET /times/list`.
- Build de produção: `npm run build` gera `dist/`. Se o frontend não ficar
  atrás do mesmo reverse-proxy do backend em produção, defina
  `VITE_API_URL` no `.env` e configure CORS (`CORS_ORIGINS_RAW` no backend)
  e cookie `SameSite=None; Secure` sobre HTTPS.
