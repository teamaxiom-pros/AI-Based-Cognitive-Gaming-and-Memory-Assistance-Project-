# SMRITI — AI-Based Cognitive Gaming & Memory Assistance Platform
### *Smart India Hackathon 2026 | Problem Statement 26003*
**Team Axiom** | *“A little help, every day.”*

---

## 📌 Problem Statement Overview
**PS ID 26003**: *AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region.*

**SMRITI** (*Memory / Remembrance*) is a comprehensive, elderly-focused digital companion and cognitive assistance ecosystem designed for elderly individuals living with mild cognitive impairment (MCI) or dementia, and their caregivers across the North Eastern Region of India.

Featuring **MITRA** (*Friend / Companion*), an empathetic multilingual voice assistant, SMRITI provides non-clinical, dignity-first daily engagement, routine management, memory recall stimulation, and clinically structured progress insights.

---

## 📁 Repository Structure

```
├── FE/                        # Frontend Web Application (React + TypeScript + Vite + TailwindCSS)
│   ├── public/                # Static assets (Favicons, Logos, Manifest)
│   └── src/
│       ├── assets/            # Component-level media & branding
│       │   └── branding/      # Official SMRITI & MITRA Logos, App Icons, and Badges
│       ├── components/        # Reusable UI & Game components
│       ├── context/           # Global application state (AppContext, AuthContext)
│       ├── data/              # Curated cognitive games, routines & medication libraries
│       ├── i18n/              # Multilingual translations (EN, Assamese, Bengali, Hindi)
│       ├── pages/             # Patient, Caregiver, Assessment & Auth pages
│       ├── services/          # Local storage, Web Audio sound synthesizer & API client
│       └── types/             # TypeScript interfaces and domain schemas
├── BE/                        # Backend API Service (Node.js + Express + TypeScript)
│   ├── prisma/                # Prisma ORM schemas & database definitions
│   ├── src/
│   │   ├── adapters/          # Data transformers for AI & assessment models
│   │   ├── middleware/        # JWT authentication & session middleware
│   │   ├── routes/            # Modular REST API endpoints
│   │   ├── services/          # Supabase database & Python AI client connectors
│   │   ├── app.ts             # Express application definition
│   │   └── server.ts          # HTTP server listener
│   └── tests/                 # Backend end-to-end integration tests
├── AI/                        # Machine Learning & Cognitive AI Engine (Python)
│   ├── src/                   # Core application runtime AI modules (SMRITI Engine)
│   ├── models/                # Trained Random Forest difficulty calibration models
│   ├── data/                  # Synthetic datasets and evaluation graphs
│   ├── scripts/               # Data generation, analysis and model training scripts
│   └── tests/                 # Adaptive engine unit & validation tests
├── docs/                      # Architectural, Clinical & Database Documentation
│   └── database/              # PostgreSQL & Supabase DDL migrations & schemas
├── scripts/                   # Browser automation & full acceptance QA suites
├── archive/                   # Safely preserved legacy markers & prototypes
├── docker-compose.yml         # Containerized local execution
└── package.json               # Monorepo task runner & scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **Python**: 3.10+ (for training/scripts in `/AI`)

### 2. Installation
```bash
# Install root & backend dependencies
npm install

# Install frontend dependencies
cd FE
npm install
cd ..
```

### 3. Running Locally
```bash
# Option A: Start Backend Server (Port 3000)
npm run dev

# Option B: Start Frontend Dev Server (Port 5173)
npm run dev:frontend
```

### 4. Running Verification Test Suites
```bash
# 1. Frontend Extended Assertion Suite (100/100 checks)
npm run test:frontend

# 2. Backend Integration Suite (All 7 Scenarios)
npm run test:backend

# 3. Python AI Engine Unit & Validation Tests
npm run test:ai

# 4. Full Real-Browser Acceptance QA Suite
npm run test:browser
```

---

## 🎨 Brand Identity

- **Primary Product**: SMRITI (*“A little help, every day.”*)
- **AI Companion**: MITRA (*“Your personal companion”*)
- **Student Team**: Team Axiom
- **Palette**:
  - Deep Teal: `#0F766E`
  - Soft Sage Mint: `#DCEFE8`
  - Warm Heritage Cream: `#F8F6EF`
  - Midnight Navy Text: `#1F2937`
  - Soft Amber Glow: `#F59E0B`
