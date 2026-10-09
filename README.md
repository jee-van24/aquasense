# AquaSense — Intelligent Water Leakage Detection & Water Conservation System

> **Environmental Studies (EVS) Academic Project**  
> *Target Problem: Unmonitored Water Leakage & Wastage in Institutional Buildings*

---

## 📌 Problem Statement

In institutional, educational, and commercial buildings, physical water loss accounts for **20% to 45%** of total municipal water consumption. Common plumbing infrastructure failures—including continuous toilet cistern flapper leaks, unthrottled laboratory taps, concealed pipe fissures, and weeping joint couplings—frequently persist unnoticed for days or weeks. 

Standard utility water meters provide only delayed, retrospective billing totals (often 30 days after the fact), making early intervention impossible. This unmitigated wastage severely depletes local freshwater reserves, escalates institutional utility expenses, and inflates the carbon footprint associated with energy-intensive municipal water treatment and booster pumping.

---

## 🌊 Solution

**AquaSense** is a full-stack smart water monitoring and automated leakage detection system designed for academic and institutional facilities. By continuously processing high-frequency water-flow sensor telemetry through a multi-signal statistical and heuristic AI/ML anomaly detection engine, AquaSense detects abnormal consumption patterns within minutes.

When abnormal flow or chronic persistence is identified, the system:
1. Calculates statistical standard deviation (Z-score) against rolling diurnal baselines.
2. Derives a multi-signal **Leak Probability Score (0–100%)**.
3. Estimates real-time **Water Wastage (Liters, L/h, L/day)**.
4. Generates contextual, natural-language diagnostic explanations.
5. Dispatches actionable alerts pinpointing the exact building zone and isolation valve.
6. Quantifies campus environmental conservation impact (potable water conserved, avoided pumping kWh, mitigated carbon emissions).

---

## 🔬 Academic Honesty & IoT Simulation Disclaimer

> [!IMPORTANT]
> **No Physical IoT Sensors Are Currently Deployed For This Prototype.**  
> The current operational demonstration uses an onboard **Simulated IoT Sensor Engine** that deterministically generates time-series telemetry mirroring real-world building hydraulic behaviors (normal diurnal demand curves, continuous nocturnal cistern leaks, laboratory tap surges, and resolved maintenance scenarios).
> 
> The application architecture is strictly modular: physical IoT hardware (e.g. ultrasonic pulse flow meters, ESP32 microcontrollers, Modbus or LoRaWAN gateways) can integrate into the existing `POST /api/sensors/reading` REST ingestion endpoint without modifying backend business logic or frontend interfaces.

---

## 🚀 Key Features

- **Executive Water Intelligence Dashboard**: Top-level consumption KPIs, active leak incident cards, Recharts diurnal baseline vs actual area charts, facility breakdown, and live EVS conservation impact metrics.
- **Live IoT Sensor Telemetry Board**: Sub-second pulse state indicators (Online, Warning, Leak, Offline), flow gauges, search, building/risk filtering, and an interactive **Leaflet OpenStreetMap** showing campus sensor nodes color-coded by risk.
- **Explainable Multi-Signal AI/ML Leak Detection**:
  - Time-of-day expected baseline modeling (zone-specific diurnal multipliers).
  - Statistical Z-Score deviation analysis (\(Z = \frac{Q - \mu}{\sigma}\)).
  - Sliding-window persistence evaluation (differentiating short toilet flushes from chronic pipe fissures).
  - Overnight inactivity heuristic (strict penalty for sustained flow between 23:00–05:00).
- **Incident Protocol & Resolution Workflow**: Full lifecycle tracking (`Detected` ➔ `Investigating` ➔ `Resolved`) with backend persistence, historical flow charts, and recommended engineering interventions.
- **Water Consumption Analytics**: Multi-period historical analysis (7-day, 30-day, 90-day), hourly diurnal demand curves, excess flow integrals, and building efficiency ranking.
- **EVS Environmental Audit & Reports**: Campus facility leaderboard, ISO 14046 water footprint accounting, avoided pumping energy (kWh), and single-click **CSV report export**.
- **Sensor Network Management**: Provision, calibrate, inspect, and update flow meter endpoints with internal pipe diameter specifications.
- **Campus Facility Drilldown**: In-depth inspection of building plumbing networks, zone breakdown, and 14-day consumption history.
- **Demo Authentication**: Role-based access for Facility Leads with one-click demo credentials autofill.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Simulated IoT Sensors                    │
│    (12 Sensors across 3 Campus Buildings & 11 Zones)        │
│  - Diurnal Normal  - Overnight Flapper  - Lab Tap Surge    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Periodic Telemetry (10s)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  IoT Sensor Simulation Engine                │
│             (/server/src/services/iotSimulator.ts)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Stream Ingestion
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI/ML Anomaly Detection Pipeline           │
│           (/server/src/services/anomalyDetection.ts)        │
│  - Diurnal Baseline      - Rolling Z-Score Evaluation       │
│  - Window Persistence    - Overnight Inactivity Heuristic   │
│  - Risk Score (0-100%)   - Water Wastage Integral (L/h)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Auto-Detect Leaks & Alerts
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend REST API (Express + TS)           │
│                    Prisma ORM (Relational DB)               │
│       Controllers: Auth, Dashboard, Usage, Sensors,         │
│             Leaks, Buildings, Alerts, Reports               │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST Endpoints & Polling
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Frontend Web Application (React + Vite)       │
│   - Tailwind CSS + Lucide Icons                             │
│   - Recharts (Water analytics, diurnal baseline vs actual)  │
│   - Leaflet + OpenStreetMap (GIS sensor mapping)            │
│   - 10 Functional Routes (/dashboard, /monitoring, etc.)    │
│   - EVS Environmental Accounting Metrics                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 with TypeScript |
| **Build Tool** | Vite |
| **Styling & Icons** | Tailwind CSS, Lucide React |
| **Data Visualization** | Recharts (AreaChart, LineChart, BarChart) |
| **GIS Mapping** | Leaflet, React Leaflet, OpenStreetMap |
| **Routing & State** | React Router v6, React Context API |
| **Backend Runtime** | Node.js (v20+ / v23+), Express.js, TypeScript |
| **Database & ORM** | Prisma ORM with SQLite (Relational, zero-friction local execution) / PostgreSQL-ready |
| **Anomaly Engine** | Multi-signal statistical deviation & persistence heuristics |

---

## 🧠 AI/ML Anomaly Detection Methodology

The detection engine uses a defensible multi-signal statistical pipeline:

1. **Diurnal Time-of-Day Expected Baseline (\(Q_{\text{expected}}\))**:
   Flow demand varies predictably by hour and room type:
   - *Laboratories / Offices*: Strictly near zero during overnight hours (23:00–05:00, factor 0.05×), peaking mid-morning (1.35×).
   - *Hostel Restrooms*: Low overnight base (0.15×), morning spike (1.45×), evening spike (1.25×).

2. **Statistical Z-Score Deviation (\(Z\))**:
   Measures instantaneous deviation against rolling standard deviation (\(\sigma\)):
   $$Z = \frac{Q_{\text{current}} - Q_{\text{expected}}}{\sigma}$$

3. **Threshold Ratio (\(R\))**:
   Evaluates relative flow increase:
   $$R = \frac{Q_{\text{current}}}{\max(0.1, Q_{\text{expected}})}$$

4. **Sliding-Window Persistence (\(P\))**:
   Evaluates the proportion of anomalous readings over the last \(N\) samples (15-minute sliding windows). A momentary toilet flush lasts 30 seconds and does not persist; a damaged flapper or open tap sustains elevated flow for consecutive cycles (\(P \to 1.0\)).

5. **Overnight Flow Heuristic**:
   Identifies unmetered continuous baseline flow when human occupancy is zero (23:00–05:00), heavily penalizing non-zero stationary flows.

6. **Composite Leak Risk Probability (\(0 - 100\%\))**:
   $$\text{Probability} = w_1 \cdot Z_{\text{norm}} + w_2 \cdot R_{\text{norm}} + w_3 \cdot P + w_4 \cdot \text{OvernightFactor}$$
   - **0% – 30%**: Normal operating variation
   - **31% – 60%**: Low Risk (minor drift / watch list)
   - **61% – 80%**: Medium Risk (probable weeping joint or slow fixture leak)
   - **81% – 100%**: High Risk / Critical (confirmed uncontrolled discharge)

7. **Water Wastage Integral**:
   $$\text{Excess Flow (L/min)} = \max(0, Q_{\text{current}} - Q_{\text{expected}})$$
   $$\text{Wastage Rate (L/h)} = \text{Excess Flow} \times 60$$
   $$\text{Estimated Loss (Liters)} = \text{Excess Flow} \times \text{Duration (minutes)}$$

---

## 🗄️ Database Relational Schema

AquaSense uses a relational data model managed by Prisma ORM:

```
Building
  ├── Rooms
  │    └── Sensors
  │         ├── SensorReadings (time-series flow & total liters)
  │         └── Leaks
  │              └── Alerts
  ├── WaterUsage (daily historical consumption & water saved)
  └── AIInsights
```

---

## 📡 REST API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate with demo credentials |
| `GET` | `/api/auth/me` | Fetch active user session profile |
| `GET` | `/api/dashboard` | Aggregated metrics, charts, active leaks & alerts, conservation stats |
| `GET` | `/api/water-usage?period=7d\|30d\|90d` | Detailed consumption trends, diurnal profiles, building comparisons |
| `GET` | `/api/sensors` | List all sensors (supports filtering by building, status, risk, search) |
| `GET` | `/api/sensors/live` | Lightweight fast polling endpoint for live telemetry |
| `GET` | `/api/sensors/:id` | Full sensor details with 24h historical telemetry readings |
| `POST` | `/api/sensors` | Register new sensor endpoint |
| `PATCH`| `/api/sensors/:id` | Update sensor calibration (baseline, diameter, status) |
| `GET` | `/api/leaks` | List all active and resolved leak incidents |
| `GET` | `/api/leaks/:id` | Detailed diagnostic view with timeline, flow chart & AI diagnosis |
| `PATCH`| `/api/leaks/:id` | Update leak status (`Detected`, `Investigating`, `Resolved`) |
| `GET` | `/api/buildings` | Campus buildings overview |
| `GET` | `/api/buildings/:id` | Building drilldown with sensor breakdown & 14-day history |
| `GET` | `/api/alerts` | Alert notifications center with severity filters |
| `PATCH`| `/api/alerts/:id` | Mark alert as read or resolved |
| `POST` | `/api/alerts/mark-all-read` | Batch mark all unread alerts |
| `GET` | `/api/reports/summary` | EVS environmental audit summary & facility leaderboard |
| `GET` | `/api/reports/export-csv` | Download complete leak audit log as CSV |
| `GET` | `/api/ai/insights` | Algorithmic anomaly insights |
| `GET` | `/api/simulator/status` | Current IoT simulator status |
| `POST` | `/api/simulator/tick` | Manually trigger instantaneous telemetry cycle |
| `POST` | `/api/simulator/toggle` | Pause or resume simulated streaming |

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Environmental Facility Director** | `admin@aquasense.demo` | `demo123` |

*(A convenient "Auto-fill" button is also provided directly on the `/login` screen).*

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 1. Install All Dependencies
From the repository root:
```bash
npm run install:all
```
*(Or install root, server, and client directories individually)*:
```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Initialize and Seed the Database
```bash
cd server
npx prisma db push
npm run seed
cd ..
```
This generates the SQLite database (`dev.db`), compiles Prisma Client, and seeds:
- 3 Campus Buildings (Engineering, Admin, Hostel)
- 11 Rooms and Zones
- 12 Simulated IoT Flow Sensors
- 300+ Historical Sensor Readings
- 4 Realistic Pre-configured Leak Incidents (Critical, High, Medium, Resolved)
- Actionable Alerts, 30-day Water Usage History, and AI Insights.

---

## 🚀 Running the Application

### Option A: Run Both Frontend & Backend Concurrently (Recommended)
From the repository root:
```bash
npm run dev
```

### Option B: Run Services in Separate Terminals

**Terminal 1 — Backend API Server:**
```bash
cd server
npm run dev
```
*Backend runs on: `http://localhost:5001`*

**Terminal 2 — Frontend Application:**
```bash
cd client
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

Open your browser to:
**👉 http://localhost:5173**

---

## 🧪 Demo Scenarios Demonstrated

1. **Scenario 1 — Normal Diurnal Campus Usage**:
   - `S-ENG-101` (Computer Lab) and `S-ADM-202` (Water Dispenser) follow standard morning and afternoon peaks with normal baseline return.
2. **Scenario 2 — Continuous High-Volume Chemical Lab Leak (Critical)**:
   - `S-ENG-102` (Chemistry Lab Tap Sink) experiences sustained flow of **18.6 L/min** (5.3× normal baseline). Generates a Critical Alert, 95.8% leak probability, and estimates 906 L/h water loss.
3. **Scenario 3 — Overnight Silent Cistern Leak (High Risk)**:
   - `S-HST-302` (Hostel Restroom Block) exhibits continuous **7.4 L/min** flow during 01:00–05:00 nocturnal hours. The overnight persistence heuristic triggers an alert for a stuck toilet flapper.
4. **Scenario 4 — Elevated Cooling Loop Drift (Medium Risk)**:
   - `S-ADM-203` (Basement Chiller Room) exhibits 1.7× elevated baseline from an unseated pressure relief valve.
5. **Scenario 5 — Successfully Resolved Incident**:
   - `S-ADM-201` (Staff Pantry Tap) demonstrates a resolved leak incident where maintenance intervention restored flow to baseline, preserving **1,830 Liters** of water.

---

## 🔮 Future Improvements

1. **Hardware Ingestion Gateways**: Connect physical LoRaWAN / ESP32 ultrasonic water meters via MQTT / WebSockets.
2. **Acoustic Leak Detection**: Integrate pipe acoustic vibration sensors to detect pinhole micro-fissures in sub-surface conduits.
3. **Automated Solenoid Shutoff**: Add smart valve relays allowing one-click remote valve isolation directly from the Leak Incident modal.
4. **Machine Learning Isolation Forest**: Train seasonal Isolation Forest and Prophet models on multi-year consumption history for predictive maintenance.

---

## 📄 License
Academic Environmental Studies Project — Developed for Sustainable Institutional Water Management.
