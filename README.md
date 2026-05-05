# 📅 Productivity App

App pessoal de organização semanal e tracking de hábitos, desenvolvido com React e Node.js.

---

## ✨ Funcionalidades

- **Weekly Planner** — visualize e organize suas tarefas por dia da semana
- **Prioridades** — classifique tarefas como Alta, Média ou Baixa
- **Status de tarefas** — marque como concluída ou reabra quando necessário
- **Navegação por semana** — alterne entre semanas facilmente
- **Autenticação** — cadastro e login com JWT, sessão persistente por 7 dias
- 🔲 **Habit Tracker** — hábitos recorrentes com streak de dias *(em breve)*
- 🔲 **Dashboard** — estatísticas de produtividade e streaks *(em breve)*
- 🔲 **Sistema de XP e conquistas** — gamificação *(em breve)*

---

## 🛠️ Tecnologias

**Frontend**
- React + Vite
- React Router DOM
- Axios
- Day.js

**Backend**
- Node.js + Express
- JSON Web Token (JWT)
- bcryptjs

**Banco de dados**
- Supabase (PostgreSQL)

**Hospedagem**
- Railway *(em breve)*

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js instalado
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório

```bash
git clone https://github.com/GabrielXAlmeida/productivity-app.git
cd productivity-app
```

### 2. Configure o backend

```bash
cd server
npm install
```

Crie o arquivo `.env` dentro de `server/`:

```env
PORT=3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=sua_chave_aqui
JWT_SECRET=sua_frase_secreta
```

Inicie o servidor:

```bash
npm run dev
```

### 3. Configure o frontend

```bash
cd client
npm install
npm run dev
```

Acesse em: `http://localhost:5173`

---

## 📁 Estrutura do projeto

```
productivity-app/
├── client/          ← React + Vite
│   └── src/
│       ├── api/
│       ├── components/
│       └── pages/
├── server/          ← Node.js + Express
│   └── src/
│       ├── controllers/
│       ├── db/
│       ├── middlewares/
│       └── routes/
└── README.md
```

---

## 🗺️ Roadmap

- ✅ Fase 1 — Setup, autenticação JWT, banco de dados
- ✅ Fase 2 — CRUD de tarefas + Weekly Planner
- 🔲 Fase 3 — Hábitos, check-ins e streak
- 🔲 Fase 4 — Dashboard, XP e conquistas
- 🔲 Fase 5 — Deploy no Railway