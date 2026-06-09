# WhatChat — WhatsApp AI Health Chatbot

**Version:** 1.0.0
**Prepared:** 2026-06-07
**Stack:** Node.js · Express · MongoDB · Qdrant (Vector DB) · OpenAI · ImageKit · WhatsApp (Meta Cloud API)

---

WhatChat is a stateful WhatsApp chatbot that delivers AI-powered health and wellness guidance. Users interact entirely through WhatsApp — there is no separate mobile app. A lightweight HTML landing page (hostable on Vercel) deep-links users into a WhatsApp chat.

The product delivers three core journeys:

1. **Registration** — a guided, multi-turn chat collects the user's name, age, gender, email, and an optional profile photo (uploaded to ImageKit).
2. **Analyse Me** — the user's profile and photo are sent to OpenAI (GPT-4o vision) for an initial wellness assessment, and a recommended support category is detected.
3. **Recover Me** — the user picks a category (Health, Mental, Sex), answers a fixed questionnaire, and receives an AI-synthesised recovery plan plus semantically-matched remedy recommendations retrieved from a Qdrant vector knowledge base.

A curated medicine knowledge base is seeded from JSON and is fully editable at runtime via secured admin REST endpoints.

---

## 1. Architecture Diagram

```mermaid
flowchart TD
    subgraph Client["User Side"]
        LP["Landing Page (HTML / Vercel)"]
        WA["WhatsApp User"]
        LP -->|click to chat| WA
    end

    subgraph Meta["Meta Cloud API"]
        MC["WhatsApp Business Platform"]
    end

    subgraph Server["Node.js + Express API Server"]
        WH["Webhook Router /webhook"]
        ADM["Admin Router /admin"]
        DISP["Dispatcher (routing)"]
        SM["State Manager (sessions)"]
        subgraph Flows["Conversation Flows"]
            REG["Registration"]
            ANA["Analyse Me"]
            REC["Recover Me"]
        end
        subgraph Svc["Service Layer"]
            WAS["WhatsApp Service"]
            OAI["OpenAI Service"]
            QD["Qdrant Service"]
            IK["ImageKit Service"]
        end
    end

    subgraph Data["Data & External Services"]
        MONGO[("MongoDB\nusers · sessions\nhistory · medicines")]
        QDRANT[("Qdrant\nmedicine embeddings\n1536-dim cosine")]
        OPENAI["OpenAI API\ngpt-4o · gpt-4o-mini\ntext-embedding-3-small"]
        IMGK["ImageKit\n(profile photos)"]
    end

    WA <-->|messages| MC
    MC -->|POST webhook| WH
    WAS -->|send message| MC

    WH --> DISP
    DISP --> SM
    DISP --> REG & ANA & REC
    SM <--> MONGO

    REG --> WAS & IK
    ANA --> WAS & OAI
    REC --> WAS & OAI & QD

    ADM --> MONGO
    ADM --> QD

    OAI --> OPENAI
    QD --> QDRANT
    QD --> OAI
    IK --> IMGK
    REG --> MONGO
    ANA --> MONGO
    REC --> MONGO
```

### Component responsibilities

| Layer   | Component         | Responsibility                                                                                |
| ------- | ----------------- | --------------------------------------------------------------------------------------------- |
| Entry   | `webhook.js`      | Verifies Meta webhook, acks within 20s, parses inbound messages, dispatches async             |
| Entry   | `admin.js`        | Secured CRUD + seed endpoints for the medicine KB                                             |
| Routing | `dispatcher.js`   | Loads session, handles global commands (`help`/`cancel`), routes to the correct flow by state |
| State   | `stateManager.js` | Loads / saves / resets per-user session (MongoDB)                                             |
| Flow    | `registration.js` | Step-by-step profile capture + photo upload                                                   |
| Flow    | `analyseMe.js`    | Builds prompt, calls OpenAI vision, stores history, detects category                          |
| Flow    | `recoverMe.js`    | Category selection → questionnaire → GPT synthesis + Qdrant search                            |
| Service | `whatsapp.js`     | Send text, download media (Meta Graph API)                                                    |
| Service | `openai.js`       | Analysis, recovery synthesis, category detection, embeddings                                  |
| Service | `qdrant.js`       | Collection init, upsert, semantic search, delete                                              |
| Service | `imagekit.js`     | Upload profile photos, return public URL                                                      |

---

## 2. Functional Diagram — Conversation State Machine

Each user has a session document holding `state`, `category`, `registrationBuffer`, `recoverAnswers[]`, and `currentQuestion`.

```mermaid
stateDiagram-v2
    [*] --> IDLE

    IDLE --> REGISTERING_NAME: first contact / "hi" / "register"
    REGISTERING_NAME --> REGISTERING_AGE: valid name
    REGISTERING_AGE --> REGISTERING_GENDER: valid age (1-150)
    REGISTERING_GENDER --> REGISTERING_EMAIL: male/female/other
    REGISTERING_EMAIL --> REGISTERING_IMAGE: valid email
    REGISTERING_IMAGE --> REGISTERED: photo uploaded / "skip"

    REGISTERED --> ANALYSE_PENDING: "analyse me"
    ANALYSE_PENDING --> ANALYSE_DONE: assessment returned

    REGISTERED --> RECOVER_CATEGORY_SELECT: "recover me"
    ANALYSE_DONE --> RECOVER_CATEGORY_SELECT: "recover me"
    RECOVER_DONE --> RECOVER_CATEGORY_SELECT: "recover me"
    RECOVER_CATEGORY_SELECT --> RECOVER_Q: health/mental/sex chosen
    RECOVER_Q --> RECOVER_Q: more questions remain
    RECOVER_Q --> RECOVER_DONE: last answer -> synthesis + remedies

    ANALYSE_DONE --> ANALYSE_PENDING: "analyse me" again
    RECOVER_DONE --> ANALYSE_PENDING: "analyse me"

    note right of IDLE
        Global commands from any state:
        "help"  -> show menu
        "cancel"/"reset" -> back to REGISTERED (or IDLE)
    end note
```

### Recovery categories & question counts

| Category | Focus                       | # Questions |
| -------- | --------------------------- | ----------- |
| `health` | Physical / Pain Management  | 5           |
| `mental` | Mental / Emotional Wellness | 7           |
| `sex`    | Sexual Health & Wellness    | 5           |

---

**Qdrant collection** `medicines`: 1536-dim vectors, cosine distance. Each point's payload mirrors `{ name, description, category, tags, source }`; the embedding is generated from `"{name}. {description}. Tags: {tags}."`.

> Note: `MEDICINE.category` uses the values `physical|mental|chronic`, while the recovery flow categories are `health|mental|sex`. See §9.

---

## 3. API Reference

### Public / system

| Method | Path       | Auth           | Description                                |
| ------ | ---------- | -------------- | ------------------------------------------ |
| GET    | `/`        | —              | Serves landing page (`website/index.html`) |
| GET    | `/health`  | —              | Health check (uptime, Mongo status)        |
| GET    | `/webhook` | verify token   | Meta webhook verification (hub challenge)  |
| POST   | `/webhook` | Meta signature | Inbound WhatsApp messages                  |

### Admin (medicine KB)

| Method | Path                    | Auth                   | Description                               |
| ------ | ----------------------- | ---------------------- | ----------------------------------------- |
| POST   | `/admin/token`          | `ADMIN_SECRET` in body | Exchange secret for a 24h admin JWT       |
| POST   | `/admin/medicines/seed` | admin JWT              | Bulk-seed from `data/medicines_seed.json` |
| GET    | `/admin/medicines`      | admin JWT              | List (paginated, filter by category)      |
| POST   | `/admin/medicines`      | admin JWT              | Add one medicine                          |
| PUT    | `/admin/medicines/:id`  | admin JWT              | Update (re-embeds in Qdrant)              |
| DELETE | `/admin/medicines/:id`  | admin JWT              | Delete from Mongo + Qdrant                |

All `/admin/medicines*` routes require header `Authorization: Bearer <admin JWT>`.

---

## 4. Models / AI Configuration

| Purpose                     | Model                    | Notes                                        |
| --------------------------- | ------------------------ | -------------------------------------------- |
| Profile analysis (vision)   | `gpt-4o`                 | temp 0.4, max 700 tokens, image detail `low` |
| Recovery synthesis          | `gpt-4o-mini`            | temp 0.5, max 600 tokens                     |
| Category detection fallback | `gpt-4o-mini`            | temp 0, regex-parsed first                   |
| Embeddings                  | `text-embedding-3-small` | 1536 dims, float encoding                    |

---

## 5. Deployment & Configuration

### Environment variables (`.env`)

```
WHATSAPP_TOKEN=              # Meta Cloud API token
WHATSAPP_PHONE_NUMBER_ID=    # Meta phone number ID
VERIFY_TOKEN=                # Webhook verification token
OPENAI_API_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
MONGODB_URI=                 # MongoDB Atlas connection string
QDRANT_URL=                  # Qdrant Cloud (free 1GB) or http://localhost:6333
QDRANT_API_KEY=              # if using cloud
JWT_SECRET=
ADMIN_SECRET=
PORT=3000
```

### Run

```bash
npm install
npm run dev      # nodemon (development)
npm start        # production

# Qdrant locally (alternative to cloud)
docker run -p 6333:6333 qdrant/qdrant
```

### Startup sequence

1. Connect to MongoDB (fails hard if unreachable).
2. Initialise the Qdrant `medicines` collection (warns and continues on failure).
3. Listen on `PORT`.

### Hosting

- **Landing page:** static HTML in `website/`, deployable to Vercel.
- **API server:** any Node host (Render / Railway / VPS) reachable by Meta's webhook over HTTPS.
- **Databases:** MongoDB Atlas + Qdrant Cloud (both have free tiers).

---

## 6. File Structure

```
whatchat/
├── src/
│   ├── server.js                    # App bootstrap, DB connect, routes
│   ├── routes/
│   │   ├── webhook.js               # WhatsApp inbound + verification
│   │   └── admin.js                 # Medicine CRUD + seed
│   ├── conversation/
│   │   ├── dispatcher.js            # State-based routing + global commands
│   │   ├── stateManager.js          # Session load/save/reset
│   │   ├── questions.js             # Fixed question sets per category
│   │   └── flows/
│   │       ├── registration.js
│   │       ├── analyseMe.js
│   │       └── recoverMe.js
│   ├── services/
│   │   ├── whatsapp.js              # Meta Graph API
│   │   ├── openai.js                # Analysis, synthesis, embeddings
│   │   ├── qdrant.js                # Vector search
│   │   └── imagekit.js              # Photo upload
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   ├── AnalysisHistory.js
│   │   └── Medicine.js
│   └── middleware/
│       ├── auth.js
│       └── adminAuth.js
├── data/
│   └── medicines_seed.json
├── website/
│   └── index.html                   # Landing page (Vercel)
├── .env.example
└── package.json
```
