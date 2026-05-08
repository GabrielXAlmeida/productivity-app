# 📋 Productivity App

App pessoal de organização semanal e tracking de hábitos, desenvolvido com React + Node.js e hospedado no Render.

🔗 **[Acessar o app](https://productivity-app-jagh.onrender.com)**

---

## ✨ Funcionalidades

- 📅 **Planejador semanal** — organize suas tarefas por dia da semana com prioridades e status
- 🌱 **Tracking de hábitos** — crie hábitos com metas semanais e acompanhe streaks
- ✅ **Check-ins diários** — marque hábitos concluídos e veja seu progresso
- 🏆 **XP e conquistas** — ganhe experiência e desbloqueie conquistas
- 📊 **Estatísticas** — acompanhe seu desempenho semanal e por hábito
- 📱 **PWA** — instalável no celular como um app nativo

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express 5 |
| Banco de dados | Supabase (PostgreSQL) |
| Hospedagem | Render |
| PWA | vite-plugin-pwa + Workbox |

---

## 🚀 Rodando localmente

### Pré-requisitos
- Node.js 20+
- Conta no Supabase

### Backend

```bash
cd server
npm install
```

Crie o arquivo `server/.env`:
```
PORT=3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJ...
JWT_SECRET=sua-frase-secreta
```

```bash
npm run dev
```

### Frontend

```bash
cd client
npm install
```

Crie o arquivo `client/.env.development`:
```
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

O app estará disponível em `http://localhost:5173`.

---

## 📱 Instalando como PWA

**iPhone:** Abra no Safari → botão Compartilhar → "Adicionar à Tela de Início"

**Android:** Abra no Chrome → menu (⋮) → "Adicionar à tela inicial"

---

## 📁 Estrutura do projeto

```
productivity-app/
├── client/         # Frontend React
├── server/         # Backend Node.js
├── .nvmrc          # Node 20+
└── package.json    # Scripts de build/start
```
