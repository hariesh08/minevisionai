<div align="center">
  <h1>🛡️ MineGuard AI</h1>
  <h3>Smart Mine Governance & Compliance Platform</h3>
</div>

## 📌 Overview
**MineGuard AI** is a comprehensive Smart Mine Governance & Compliance platform. It goes beyond standard CCTV monitoring by understanding the compliance impact of detected events, predicting risks, alerting responsible officers, tracking corrective actions, and generating auditable records. 

Our core identity is built on a complete closed-loop compliance system: 
**`Observe → Detect → Understand → Predict → Alert → Act → Verify → Record`**

## 🏗️ System Architecture
The platform leverages a modern stack designed for real-time monitoring and robust governance:
- **Frontend:** React / Vite (TypeScript, Tailwind CSS)
- **Backend:** Flask / FastAPI (Python REST API)
- **Database:** SQL Server
- **Computer Vision:** YOLO + OpenCV (for real-time CCTV inference)
- **Risk ML Model:** Python + scikit-learn
- **AI Assistant:** LLM integrated with curated safety compliance rules
- **Sensor Data:** Simulated IoT / API

*(Note: Data flows from CCTV/Sensors → AI Detection → Violation → Risk Score → Alert → Compliance Update → Report)*

## ✨ Core Modules & Features (SIH Prototype)

### 1. 🎛️ Main Control Center Dashboard
The nerve center of the application displaying:
- **Key Metrics:** Total/Active Workers, Active Alerts, Compliance Score, High-Risk Zones, Open Violations.
- **Mine Zone Map:** Visual status of Zones A, B, C, and D.
- **Recent Alerts & Risk Trend Graphs:** Real-time visibility into the mine's safety posture.

### 2. 📹 AI CCTV Monitoring
AI-driven video analytics focused on high-priority detections:
- **PPE / Helmet Detection:** Automatically flags workers without helmets or safety vests.
- **Restricted Zone Entry:** Triggers alerts when personnel or unauthorized vehicles enter demarcated polygon areas (e.g., Blasting Areas).

### 3. 🌡️ Environmental Monitoring
Simulated IoT sensor tracking with real-time graphs and threshold alerts:
- **Monitored Parameters:** Dust, Temperature, Gas (ppm), Noise (dB).
- **Automated Alerts:** e.g., if dust crosses a threshold, an environmental warning is issued with recommended actions.

### 4. 📋 Compliance Management & Corrective Actions
A dedicated module for governance:
- **Compliance Checklist:** Live status of PPE, Dust Monitoring, Safety Inspections, etc.
- **Corrective Action Tracking (Closed Loop):** 
  `Violation → Assign Officer → Action → Deadline → Verification → Resolved`

### 5. ⚠️ Risk Prediction Engine
An ML model that calculates risk scores (e.g., 78/100 HIGH RISK) by combining:
- Environmental factors (Dust, Gas, Temp)
- Worker density & Previous violations
- Provides actionable recommendations based on the predicted risk.

### 6. 💬 AI Compliance Assistant
A natural language chat interface that answers safety and compliance queries based on the mine's rule database (e.g., *"What safety violations are currently active?"*, *"Which zones are currently high risk?"*).

### 7. 📜 Automated Alert System, Audit Trail & Reports
- **Digital Audit Trail:** An immutable log of all detections, alerts, officer assignments, and resolutions.
- **Automated Reports:** One-click generation of Daily, Safety, Environmental, and Monthly Compliance Reports.

## 🚀 Live Demo Scenario (SIH Presentation)
The platform is designed to be demonstrated through a 2-3 minute live scenario:
1. **Detection:** CCTV detects a worker in Zone B without a Helmet/Vest.
2. **Violation:** System creates a `PPE VIOLATION (Status: OPEN)`.
3. **Risk Calculation:** Risk Engine upgrades Zone B to `HIGH RISK` (due to combined PPE violation and high dust).
4. **Dashboard Update:** Compliance drops; Zone B turns red.
5. **Alerting:** Safety Officer receives a High-Priority Alert.
6. **Action:** Officer assigns a corrective action (PPE inspection). Worker compliance is verified, and violation is marked `RESOLVED`.
7. **Audit & Report:** The entire workflow is recorded in the Audit Log, culminating in a generated Compliance Report.

## 🔮 Future Integrations
While the current prototype utilizes simulated data and streams for demonstration, the architecture is ready to integrate with:
- Real Mine CCTV & Physical IoT Gateways
- Government Compliance Portals / APIs
- Live Drone Feeds & Actual Mine GIS mapping

---

## 💻 Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the application:
   ```bash
   npm run dev
   ```
The app will be available on `http://localhost:3000`.
