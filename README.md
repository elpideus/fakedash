Progetto al momento sotto attivo sviluppo!

# FakeDash - Dashboard di Gestione Contenuti

## 📋 Panoramica

**FakeDash** è un'applicazione dashboard moderna per la gestione di utenti e post, sviluppata come test di recruiting frontend. Dimostra competenze avanzate in React, TypeScript e gestione dello stato con funzionalità CRUD complete e backend simulato.

## 🚀 Stack Tecnologico

![Commit Activity](https://img.shields.io/github/commit-activity/w/elpideus/fakedash?color=0E8A16&logo=github&logoColor=white&label=Commits&style=for-the-badge)
[![License](https://img.shields.io/github/license/elpideus/fakedash?color=4A148C&logo=opensourceinitiative&logoColor=white&label=License&style=for-the-badge)](https://github.com/elpideus/fakedash/blob/main/LICENSE)

### Frontend
![React](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/react?color=61DAFB&label=React&logo=react&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/dev/typescript?color=3178C6&label=TypeScript&logo=typescript&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/dev/vite?color=646CFF&label=Vite&logo=vite&logoColor=white&style=for-the-badge)
![React Router](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/react-router-dom?color=CA4245&label=React%20Router&logo=react-router&logoColor=white&style=for-the-badge)

### UI & Styling
![MUI](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/@mui/material?color=007FFF&label=MUI&logo=mui&logoColor=white&style=for-the-badge)
![Material React Table](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/material-react-table?color=00A3E0&label=Material%20React%20Table&style=for-the-badge)
![Tailwind CSS](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/tailwindcss?color=38B2AC&label=Tailwind%20CSS&logo=tailwindcss&logoColor=white&style=for-the-badge)

### Data Management
![TanStack Query](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/@tanstack/react-query?color=FF4154&label=TanStack%20Query&logo=react-query&logoColor=white&style=for-the-badge)
![Axios](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/axios?color=5A29E4&label=Axios&logo=axios&logoColor=white&style=for-the-badge)
![Zustand](https://img.shields.io/github/package-json/dependency-version/elpideus/fakedash/zustand?color=FF6B00&label=Zustand&logo=react&logoColor=white&style=for-the-badge)

### Backend Simulato
- **JSON Server** - REST API mock

## 🎯 Funzionalità

### ✅ Completate
- **🔐 Autenticazione**: Login con validazione e UI responsive
- **📊 Post**: Layout sidebar + contenuto principale (post) con navigazione
- **📝 Gestione Post**: 
  - Tabella con paginazione server-side, filtri e ordinamento
  - CRUD completo (crea, leggi, modifica, elimina)
  - Azioni batch (eliminazione multipla)
  - Cache ottimizzata con TanStack Query
- **👥 Gestione Utenti**: 
  - Tabella con paginazione e selezione multipla
  - Operazioni CRUD complete
- **🎨 Componenti Custom**: 
  - `ContentTable` (tabella riutilizzabile)
  - Sidebar animata
  - Sistema di bottoni temati
  - Input field con styling consistente

## 🏗️ Architettura

### Struttura del Progetto
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

### Design Pattern
1. **Container/Presentational** - Separazione logica e presentazione
2. **Custom Hooks Pattern** - Astrazione logica complessa
3. **Compound Components** - Componenti compositi
4. **Optimistic Updates** - UI reattiva con aggiornamenti ottimistici

## 🔧 Installazione e Avvio

### Metodo 1: Docker (Raccomandato)

#### Prerequisiti
- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)

#### Passi
1. **Clona il repository**
   ```bash
   git clone https://github.com/elpideus/fakedash.git
   cd fakedash
   ```

2. **Avvia con Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Accedi all'applicazione dal browser**: http://localhost:5173

#### Comandi Docker utili
```bash
# Avvio in background
docker-compose up -d

# Ferma i container
docker-compose down

# Visualizza log
docker-compose logs -f

# Ricostruisce le immagini
docker-compose up --build
```

### Metodo 2: Sviluppo Locale

#### Prerequisiti
- Node.js 22.9.0+ e npm

#### Passi
1. **Clona il repository**
   ```bash
   git clone https://github.com/elpideus/fakedash.git
   cd fakedash
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente**
   ```bash
   # Unix (Linux/MacOS)
   cp .env.example .env
   
   # Windows (PowerShell)
   Copy-Item .env.example -Destination .env
   
   # Windows (CMD)
   copy .env.example .env
   ```

4. **Avvia il progetto**
   ```bash
   # Avvia sia frontend che backend
   npm run dev+api
   ```

5. **Oppure avvia separatamente**
   ```bash
   # Terminale 1: Backend
   json-server --watch db.json --port 3001
   
   # Terminale 2: Frontend
   npm run dev
   ```

## 🧪 Comandi Utili

```bash
# Modalità sviluppo
npm run dev

# Build produzione
npm run build

# Preview build
npm run preview

# Linting
npm run lint

# Test (non ancora configurato)
npm test
```

## 📁 Struttura Database

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
GET    /users/:id       # Singolo utente
POST   /users           # Crea utente
PUT    /users/:id       # Modifica utente
DELETE /users/:id       # Elimina utente

GET    /posts           # Lista post
GET    /posts/:id       # Singolo post
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

## 🎯 Scelte Progettuali

### 1. **TanStack Query**
- Gestione automatica di caching, background updates e errori
- Ottimistic updates integrati
- DevTools eccellenti per debugging
- Minimizzazione richieste duplicate

### 2. **Material React Table**
- Performance ottimizzata con virtualizzazione
- API consistente per features complesse
- Accessibilità integrata
- Facile customizzazione tramite slot system

### 3. **TypeScript Strict Mode**
- Type safety completo
- Migliore developer experience
- Rilevamento errori a compile-time

### 4. **Separazione Componenti**
- `ContentTable`: Logica tabella complessa isolata
- Pagine: Solo layout e orchestrazione
- Hooks custom: Logica business riutilizzabile

## 📋 Roadmap

### 🚨 Priorità Alta
- [x] **Autenticazione (fake)**
    - [x] Pagina di login implementata (`Login.tsx`)
    - [ ] UI login con validazione base
    - [ ] Gestione stato utente loggato
    - [ ] Protezione rotte con React Router

- [x] **Post - Funzionalità Base**
    - [x] Lista dei post con tabella (`PostListContent.tsx`)
    - [x] Visualizzazione Material React Table con paginazione e filtri
    - [x] Navigazione al dettaglio singolo post (`Post.tsx`)
    - [ ] Modifica ed eliminazione di un post
    - [ ] Creazione nuovo post tramite Drawer
    - [x] Preservazione stato tabella al ritorno dal dettaglio

- [ ] **Utenti - Funzionalità Base**
    - [x] Lista utenti con tabella (`UserListContent.tsx`)
    - [x] Visualizzazione Material React Table con paginazione e filtri
    - [ ] Navigazione al dettaglio singolo utente
    - [ ] Creazione nuovo utente tramite Drawer
    - [ ] Modifica ed eliminazione utente
    - [ ] Mostrare i posts dell'utente nel dettaglio
    - [x] Preservazione stato tabella al ritorno dal dettaglio

### ⚡ Priorità Media
- [x] **Performance Ottimizzazioni**
    - [x] TanStack Query per caching e stato asincrono
    - [ ] Code splitting con React.lazy
    - [ ] Memoizzazione componenti pesanti

- [ ] **Testing Suite**
    - [ ] Unit test per componenti critici
    - [ ] Integration test per flussi utente

- [x] **Error Boundary / Gestione Errori**
    - [x] Gestione errori API nei componenti Post e User
    - [x] Loading states e fallback UI
    - [ ] Error Boundary a livello applicazione

### 🎨 Priorità Bassa
- [x] **UI/UX Miglioramenti**
    - [x] Design responsive con Tailwind CSS
    - [x] Sidebar animata con stato attivo
    - [x] Snackbar per notifiche
    - [x] Dialog di conferma per eliminazioni
    - [ ] Theme switching (light/dark mode)
    - [ ] Animazioni più fluide

- [ ] **Features Avanzate**
    - [x] Selezione multipla per azioni batch (eliminazione multipla)
    - [ ] Ricerca globale
    - [ ] Esportazione dati (CSV/PDF) - bottone presente ma non funzionale

- [x] **Documentazione & Struttura**
    - [x] TypeScript per type safety
    - [x] Componenti ben strutturati e separati
    - [x] Commenti nel codice (alcuni TODO presenti)
    - [ ] Storybook per componenti
    - [ ] JSDoc completo

## 📈 Progresso Generale: 60% completato

Il progetto ha una base solida con l'architettura principale implementata.
Mancano principalmente le funzionalità di creazione (drawer) e l'autenticazione completa.

## 🐛 Troubleshooting

### Problemi comuni con Docker
1. **Porte già in uso**
  - Modifica le porte in `.env` se 5173 o 3001 sono occupate

2. **Permessi negati su node_modules**
  - Su Linux/Mac: `sudo chown -R $USER:$USER .`
  - Oppure ricostruisci (se si usa docker): `docker-compose up --build`

3. **Container non si avvia**
  - Verifica i log: `docker-compose logs app`
  - Verifica che il Dockerfile e docker-compose.yml siano corretti

### Problemi comuni locali
1. **Errori di dipendenze**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Porte occupate**
  - Cambia le porte in `.env`
  - Oppure termina i processi sulle porte 5173/3001

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/NuovaFeature`)
3. Commit delle modifiche (`git commit -m 'Aggiungi NuovaFeature'`)
4. Push del branch (`git push origin feature/NuovaFeature`)
5. Apri una Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## ✨ Caratteristiche Tecniche

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

**Autore**: Ștefan Narcis Cucoranu  
**Status**: In sviluppo attivo  
**Ultimo aggiornamento**: Febbraio 2024