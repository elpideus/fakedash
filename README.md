Progetto al momento sotto attivo sviluppo!

# FakeDash - Dashboard di Gestione Contenuti

## 📋 Panoramica del Progetto

**FakeDash** è un'applicazione dashboard moderna e completa per la gestione di utenti e post, sviluppata come test di recruiting frontend. L'applicazione dimostra competenze avanzate in React, TypeScript, e gestione dello stato, implementando funzionalità CRUD complete con un backend simulato.

<div align="center">

## 🚀 Stack Tecnologico

![Commit Activity](https://img.shields.io/github/commit-activity/w/elpideus/fakedash?color=0E8A16&logo=github&logoColor=white&label=Commits&style=for-the-badge)
[![License](https://img.shields.io/github/license/elpideus/fakedash?color=4A148C&logo=opensourceinitiative&logoColor=white&label=License&style=for-the-badge)](https://github.com/elpideus/fakedash/blob/main/LICENSE)

![React](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/react?color=61DAFB&label=React&logo=react&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/dev/typescript?color=3178C6&label=TypeScript&logo=typescript&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/dev/vite?color=646CFF&label=Vite&logo=vite&logoColor=white&style=for-the-badge)

![MUI](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/@mui/material?color=007FFF&label=MUI&logo=mui&logoColor=white&style=for-the-badge)
![Material React Table](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/material-react-table?color=00A3E0&label=Material%20React%20Table&style=for-the-badge)
![TanStack Query](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/@tanstack/react-query?color=FF4154&label=TanStack%20Query&logo=react-query&logoColor=white&style=for-the-badge)
![React Router](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/react-router-dom?color=CA4245&label=React%20Router&logo=react-router&logoColor=white&style=for-the-badge)

![Axios](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/axios?color=5A29E4&label=Axios&logo=axios&logoColor=white&style=for-the-badge)
![Tailwind CSS](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/tailwindcss?color=38B2AC&label=Tailwind%20CSS&logo=tailwindcss&logoColor=white&style=for-the-badge)

• **React 19** + **TypeScript** - UI componentistica tipizzata\
• **Vite** + **Rolldown** - Build tool ottimizzato\
• **Material-UI (MUI)** - Componenti UI design system\
• **Material React Table** - Tabelle avanzate con TanStack Table\
• **TanStack Query** - Gestione dati asincroni e caching\
• **React Router v7** - Navigazione client-side\
• **Axios** - Client HTTP\
• **Tailwind CSS** - Styling utility-first\
• **JSON Server** - Backend REST simulato
</div>

## 🎯 Funzionalità Implementate

### ✅ Completate

#### 🔐 Sistema di Autenticazione
- Pagina di login con validazione
- UI responsive con feedback visivo
- Protezione delle rotte (in sviluppo)

#### 📊 Dashboard Principale
- Layout sidebar + contenuto principale
- Navigazione fluida tra sezioni
- Stato UI persistente

#### 📝 Gestione Post
- **Lista Post**: Tabella MRT con:
    - Paginazione server-side
    - Selezione multipla
    - Filtri e ordinamento
    - Pannello dettaglio espandibile
- **Dettaglio Post**:
    - Visualizzazione completa
    - Modalità modifica inline
    - Eliminazione con conferma
    - Cache ottimizzata con TanStack Query
- **Azioni Batch**:
    - Eliminazione multipla
    - Feedback tramite snackbar

#### 👥 Gestione Utenti
- **Lista Utenti**: Tabella MRT con:
    - Paginazione efficiente
    - Selezione multipla
    - Azioni contestuali
- **Gestione CRUD** completa
- UI coerente con sezione post

#### 🎨 Componenti Custom
- **ContentTable**: Componente tabella riutilizzabile
- **Sidebar**: Navigazione animata
- **Sistema di Bottoni**: Primary/Secondary themes
- **Input Field**: Text e Password con styling consistente

## 🏗️ Architettura del Progetto

```
src/
├── components/           # Componenti riutilizzabili
│   ├── ContentTable.tsx  # Componente tabella avanzato
│   ├── Buttons.tsx       # Bottoni temati
│   ├── sidebar/          # Componenti sidebar
│   └── (vari input)
├── pages/               # Pagine dell'applicazione
│   ├── DashboardPage.tsx # Layout principale
│   ├── Login.tsx        # Pagina login
│   └── Post.tsx         # Dettaglio post
└── App.tsx              # Routing principale
```

### Design Pattern Utilizzati

1. **Container/Presentational**: Separazione logica e presentazione
2. **Custom Hooks Pattern**: Astrazione logica complessa
3. **Compound Components**: Tabella con componenti compositi
4. **Optimistic Updates**: UI reattiva con aggiornamenti ottimistici

## 🔧 Installazione e Avvio

### Prerequisiti
- Node.js 22.9.0+ e npm/yarn
- Git

### Passi di Installazione

```bash
# 1. Clona il repository
git clone <repository-url>
cd fakedash

# 2. Installa dipendenze
npm install

# 3. Avvia il progetto
npm run dev+api

# Oppure puoi avviare manualmente back-end poi front-end (sconsigliato)
# In un terminale:
npx json-server --watch db.json --port 3001
# In un altro terminale
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

## 🧪 Testing dell'Applicazione

```bash
# Avvia in modalità sviluppo
npm run dev

# Build produzione
npm run build

# Linting
npm run lint

# Preview build
npm run preview
```


## 📁 Struttura del Database

```json
{
  "users": [
    {
      "id": 1,
      "name": "Mario Rossi",
      "email": "mario@example.com"
    }
  ],
  "posts": [
    {
      "id": 1,
      "userId": 1,
      "title": "Titolo del post",
      "content": "Contenuto del post",
      "createdAt": "2025-01-10T10:30:00Z"
    }
  ]
}
```

## 🔄 API Endpoints

### Backend (JSON Server)
```
GET    /users           # Lista utenti
GET    /users?id=1      # Singolo utente
POST   /users           # Crea utente
PUT    /users/:id       # Modifica utente
DELETE /users/:id       # Elimina utente

GET    /posts           # Lista post
GET    /posts?id=1      # Singolo post
GET    /posts?userId=1  # Post per utente
POST   /posts           # Crea post
PUT    /posts/:id       # Modifica post
DELETE /posts/:id       # Elimina post
```

### Frontend Routes
```
/                     # Dashboard post
/login               # Pagina login
/post/:id            # Dettaglio post
/users               # Lista utenti
/*                   # Catch-all (dashboard)
```

## 🎯 Scelte Progettuali Spiegate

### 1. **TanStack Query**
Ho scelto TanStack Query per:
- Gestione automatica di caching, background updates, e errori
- Ottimistic updates integrati
- DevTools eccellenti per debugging
- Minimizzazione di richieste duplicate

### 2. **Material React Table vs Tabella Custom**
MRT offre:
- Performance ottimizzata con virtualizzazione
- API consistente per features complesse
- Accessibilità integrata
- Facile customizzazione tramite slot system

### 3. **TypeScript Strict Mode**
- Type safety completo
- Migliore developer experience
- Documentazione automatica delle librerie
- Rilevamento errori a compile-time

### 4. **Separazione Componenti**
- `ContentTable`: Logica tabella complessa isolata
- Pagine: Solo layout e orchestrazione
- Hooks custom: Logica business riutilizzabile

## 📋 TODO List & Miglioramenti Futuri

### 🚨 Priorità Alta
- [ ] **Implementare autenticazione completa**
    - [ ] Protezione rotte con React Router
    - [ ] Context/Store per stato autenticazione
    - [ ] Persistenza sessione (localStorage)
    - [ ] Redirect automatici per utenti non autenticati

- [ ] **Form Creazione/Modifica**
    - [ ] Drawer/Modal per creazione post/utenti
    - [ ] Validazione con React Hook Form + Zod
    - [ ] Error handling migliorato

- [ ] **Pagine Dettaglio Utente**
    - [ ] Visualizzazione profilo utente
    - [ ] Lista post dell'utente
    - [ ] Modifica informazioni utente

### ⚡ Priorità Media
- [ ] **Performance Ottimizzazioni**
    - [ ] Code splitting con React.lazy
    - [ ] Memoizzazione componenti pesanti
    - [ ] Ottimizzazione re-render

- [ ] **Testing Suite**
    - [ ] Unit test per componenti critici
    - [ ] Integration test per flussi utente
    - [ ] E2E test con Cypress o simili

- [ ] **Error Boundary**
    - [ ] Gestione errori a livello applicazione (inclusi i `@ts-expect-error`)
    - [ ] Fallback UI
    - [ ] Error reporting

### 🎨 Priorità Bassa
- [ ] **UI/UX Miglioramenti**
    - [ ] Theme switching (light/dark mode)
    - [ ] Animazioni più fluide
    - [ ] Responsive design completo

- [ ] **Features Avanzate**
    - [ ] Ricerca globale
    - [ ] Filtri avanzati salvabili
    - [ ] Esportazione dati (CSV/PDF)
    - [ ] Drag & drop per ordinamenti

- [ ] **Documentazione**
    - [ ] Storybook per componenti
    - [ ] JSDoc completo
    - [ ] Guide per contributors
  
- [x] **QOL**
  - [x] Aggiungere Banner con Icone al README.md
  - [ ] Guide about necessity to rename .env.example.env (and eventually modify it) 
  - [x] Add dev+api in package.json to start both easily

### 🔧 Refactoring Suggeriti
1. **Abstract API Layer**: Creare client HTTP con interceptors
2. **Custom Hooks**: Estrazione logica ripetitiva
3. **Component Library**: Sistema design più strutturato
4. **State Management**: Valutare Zustand per stato globale non-server

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push del branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## ✨ Caratteristiche Tecniche Evidenziate

### **Gestione Stato Avanzata**
- Cache intelligente con TanStack Query
- Ottimistic updates per UX fluida
- Synchronization con backend

### **Performance**
- Paginazione server-side
- Virtualizzazione righe tabella
- Code splitting preparato

### **Type Safety**
- Tipi completi per API response
- Generic components riutilizzabili
- Type inference avanzato

### **UX/UI**
- Feedback utente immediato (snackbar)
- Conferme azioni distruttive
- Navigazione senza perdita di contesto

---

Questo progetto dimostra competenze in architetture frontend moderne, gestione stato complessa, e best practices di sviluppo. Sono disponibile per approfondire qualsiasi scelta progettuale o discutere potenziali miglioramenti.

**Autore**: Ștefan Narcis Cucoranu\
**Status**: In sviluppo attivo