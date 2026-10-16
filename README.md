# M.E.N.O.S – Front-end

Interface web (React + Vite) do projeto **M.E.N.O.S – Merenda Escolar Nutritiva e Otimizada Sem Desperdício**.
Consome a API do backend: https://github.com/Felps-C/Projeto-M.E.N.O.S

## Como rodar
1. Instale o Node.js (versão 18 ou mais nova).
2. `npm install`
3. (opcional) copie `.env.example` para `.env`
4. Suba o backend (porta 8080) e rode `npm run dev`
5. Abra http://localhost:5173

No desenvolvimento, as chamadas em `/api/...` passam pelo proxy do Vite e chegam no backend, sem CORS.

## Estrutura
- `src/api/client.js` – cliente HTTP (único lugar que conhece a URL da API)
- `src/context/AuthContext.jsx` – sessão do usuário (provisória até o login do backend ficar pronto)
- `src/layouts/` – estrutura das telas: **Aluno** (celular, menu inferior) e **Escola** (computador, menu lateral)
- `src/pages/` – telas
- `src/styles/theme.css` – cores e estilos base (paleta do projeto)

## Paleta
Primária `#00695C` · Secundária `#FF6F61` · Fundo `#F4F6F8` · Texto `#1A252C`

## Publicação
`npm run build` gera a pasta `dist/`, que pode ir para uma hospedagem estática (Netlify, Vercel, Cloudflare Pages).
Defina `VITE_API_URL` com o endereço real do backend (que precisa liberar CORS para o site).

## Logo
Exporte a logo do Figma como PNG e salve em `public/logo.png`. Sem o arquivo, as telas mostram um texto no lugar.
# Projeto-M.E.N.O.S-SITE
