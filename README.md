# 🛣️ MARGANETRA — मार्गनेत्र

### AI-Powered Intelligent Transport Monitoring & Municipal Incident Analytics Platform

> **Smart India Hackathon (SIH) 2026 Project**

MARGANETRA (मार्गनेत्र) is an AI-powered **Intelligent Transport Monitoring and Municipal Telemetry Platform** that transforms video feeds from CCTV cameras, mobile cameras, and uploaded road footage into actionable transportation and infrastructure intelligence.

The platform combines **Computer Vision, Object Tracking, ANPR/OCR, GIS, real-time telemetry, Generative AI, and automated report generation** into a single workflow.

Instead of treating video as passive footage, MARGANETRA turns it into structured information that can help authorities identify, locate, analyze, document, and track road and traffic incidents.

---

## 🚀 Core Idea

```text
Camera / Video Upload
        ↓
Multi-Model Computer Vision
        ↓
Vehicle & Road Detection
        ↓
ByteTrack Tracking
        ↓
EventAccumulator
        ↓
Real-Time Telemetry
        ↓
GIS + Live Alerts
        ↓
Incident Registration
        ↓
Gemini AI Analysis
        ↓
Automated PDF Report
        ↓
PENDING → RESOLVED
```

---

# ✨ Key Features

## 🎥 Multi-Source Video Monitoring

MARGANETRA supports multiple video sources:

* 📹 CCTV / IP camera feeds
* 📱 DroidCam mobile camera streams
* 🎞️ Uploaded road/traffic videos
* 🌐 Extensible support for network camera protocols

Uploaded videos can be processed through the AI pipeline and converted into browser-compatible H.264 MP4 output.

---

## 🧠 Multi-Model Computer Vision

The platform uses multiple AI models to extract transportation and infrastructure information from video.

### Vehicle Intelligence

* Vehicle detection
* Vehicle classification
* Vehicle tracking
* Unique `track_id` assignment
* Vehicle counting
* Vehicle-to-plate association

Supported vehicle classes can include:

* Cars
* Buses
* Trucks
* Motorcycles
* Ambulances

### 🕳️ Pothole Detection

A custom YOLO-based model detects potholes and tracks them across consecutive frames.

### 🛣️ Road Damage Detection

The architecture supports road-surface defect detection such as:

* Longitudinal cracks
* Rutting
* Alligator cracking
* Surface erosion

### 🔎 ANPR & OCR

The ANPR pipeline combines license-plate detection with EasyOCR:

```text
Vehicle
   ↓
Number Plate Detection
   ↓
Plate Crop
   ↓
EasyOCR
   ↓
Plate Text
   ↓
Vehicle ↔ Plate Association
```

---

# 🎯 EventAccumulator

High-FPS video can generate the same detection across hundreds of frames.

Without deduplication:

```text
Pothole detected
Pothole detected
Pothole detected
Pothole detected
...
```

This could create unnecessary alerts and database records.

MARGANETRA's `EventAccumulator` uses tracking and spatial/temporal information to normalize these detections.

```text
100 Frame Detections
        ↓
Same Track / Event
        ↓
ONE Normalized Event
```

This allows the system to maintain persistent event information instead of treating every frame detection as a new incident.

---

# 🗺️ Real-Time GIS Monitoring

MARGANETRA provides an interactive GIS interface built using:

* Leaflet.js
* React-Leaflet
* OpenStreetMap

The map can display spatial information such as:

* 🚗 Traffic events
* 🕳️ Potholes
* 💧 Waterlogging
* ⚠️ Safety incidents
* 📹 Camera nodes

Operators can filter map layers to focus on specific categories of road and traffic conditions.

---

# 🔔 Dynamic Notification Hub

The platform includes a real-time notification system integrated with the backend incident feed.

The header notification system periodically retrieves incident telemetry and dynamically updates:

* Unread notification count
* Incident feed
* Relative timestamps
* Severity indicators
* Incident navigation

For example:

```text
🔔 3

High Severity Incident
Pothole detected
Just now

Medium Severity Incident
Vehicle event detected
2 min ago
```

Notifications are generated from actual backend incident data rather than static frontend values.

---

# 📍 Incident Management

Detected events can be converted into structured incidents.

An incident can contain:

* Incident ID
* Incident type
* Severity
* Timestamp
* Location
* Detection information
* Vehicle information
* Number plate information
* Supporting evidence
* AI-generated analysis
* Resolution status

Example:

```text
INC-039

Type       : Pothole
Severity   : High
Location   : Selected GIS Location
Timestamp  : 18:42:11
Status     : PENDING
```

---

# 🤖 Gemini AI Analyst

MARGANETRA uses Generative AI as an **analysis layer**, rather than as the primary visual detection engine.

The Computer Vision pipeline first produces structured incident telemetry.

That telemetry is then passed to Gemini for interpretation.

```text
Computer Vision
      ↓
Structured Telemetry
      ↓
Gemini AI
      ↓
Incident Analysis
```

The AI analysis can produce:

* Executive summary
* Incident description
* Key observations
* Risk assessment
* Recommended response actions

This creates a bridge between raw machine detections and human-readable municipal intelligence.

---

# 📄 Automated Government-Facing Reports

Incident telemetry and AI analysis are compiled into PDF reports using **ReportLab**.

The report can include:

* Incident metadata
* Date and time
* Location
* Detection information
* AI observations
* Risk assessment
* Recommended actions
* Incident status

The report lifecycle follows:

```text
INCIDENT
   ↓
PENDING
   ↓
Investigation / Action
   ↓
RESOLVED
```

Resolved reports can be updated with the final resolution status.

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │   Video Sources     │
                         │                     │
                         │ CCTV / DroidCam /   │
                         │ Uploaded Video      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   FastAPI Backend   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │       AI / CV Pipeline        │
                    │                               │
                    │ YOLOv8 + ByteTrack            │
                    │ Pothole Detection             │
                    │ Road Damage Detection         │
                    │ ANPR + EasyOCR                │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   EventAccumulator  │
                         │                     │
                         │ Tracking            │
                         │ Deduplication       │
                         │ Spatial / Temporal   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                ┌────────────────────────────────────┐
                │       Real-Time Telemetry          │
                │                                    │
                │ Live Alerts │ Notifications │ GIS  │
                └──────────────────┬─────────────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │ Incident Management │
                         └──────────┬──────────┘
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
                ┌────────────────┐    ┌────────────────┐
                │ Gemini AI      │    │ GIS / Location │
                │ Analyst        │    │ Information    │
                └───────┬────────┘    └───────┬────────┘
                        │                     │
                        └──────────┬──────────┘
                                   ▼
                         ┌─────────────────────┐
                         │ ReportLab PDF       │
                         │ Report Generator    │
                         └──────────┬──────────┘
                                    ▼
                            PENDING → RESOLVED
```

---

# 🧰 Technology Stack

| Layer            | Technologies                           |
| ---------------- | -------------------------------------- |
| Frontend         | React 18, TypeScript, Vite             |
| UI               | TailwindCSS, Vanilla CSS, Lucide React |
| Backend          | FastAPI, Python 3.10, Uvicorn          |
| Computer Vision  | PyTorch, CUDA, OpenCV                  |
| Object Detection | Ultralytics YOLOv8                     |
| Tracking         | ByteTrack                              |
| OCR              | EasyOCR                                |
| GIS              | Leaflet, React-Leaflet, OpenStreetMap  |
| Generative AI    | Google GenAI SDK, Gemini               |
| PDF Generation   | ReportLab                              |
| Video Processing | FFmpeg, FFprobe                        |
| Database         | SQLite, SQLAlchemy                     |
| Persistence      | JSON-based incident/report manifests   |
| GPU              | NVIDIA CUDA-compatible GPU             |

---

# 📁 Project Structure

```text
MARGANETRA/
│
├── backend/
│   ├── ai/
│   │   ├── models/
│   │   ├── trackers/
│   │   └── ...
│   │
│   ├── api/
│   │   ├── video.py
│   │   ├── incidents.py
│   │   └── ...
│   │
│   ├── services/
│   │   └── report_service.py
│   │
│   ├── reports/
│   │
│   ├── incidents.json
│   ├── reports.json
│   └── main.py
│
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── TrafficMapPage.tsx
│   │   └── ...
│   │
│   └── ...
│
├── public/
│
├── package.json
├── requirements.txt
└── README.md
```

> The exact structure may vary depending on the current development branch.

---

# ⚙️ Installation

## Prerequisites

Make sure the system has:

* Python 3.10+
* Node.js 18+
* npm
* FFmpeg
* CUDA-compatible NVIDIA GPU recommended for accelerated inference
* Git

---

## 1. Clone the repository

```bash
git clone <repository-url>
cd MARGANETRA
```

---

## 2. Backend Setup

Create and activate a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 3. Frontend Setup

```bash
npm install
```

---

## 4. Environment Variables

Create a `.env` file for required API credentials and configuration.

Example:

```env
GEMINI_API_KEY=your_api_key_here
```

Do **not** commit API keys or other secrets to GitHub.

---

# ▶️ Running the Application

## Start Backend

```bash
uvicorn backend.main:app --reload
```

The FastAPI backend will start locally.

---

## Start Frontend

In another terminal:

```bash
npm run dev
```

Open the local development URL displayed by Vite.

---

# 📡 Core API Workflow

### Process uploaded video

```http
POST /api/ai/process-video
```

Processes an uploaded video through the AI pipeline and returns processed detection information/output.

---

### Retrieve incidents

```http
GET /api/incidents
```

Used by the frontend to retrieve current incident telemetry and populate the notification/incident interfaces.

---

### Report an incident

```http
POST /api/incidents/report
```

Registers an incident after location and incident information are confirmed.

---

### Resolve a report

```http
PATCH /api/reports/{id}/resolve
```

Updates the report lifecycle from pending to resolved.

---

# 🔄 Example End-to-End Scenario

Consider a municipal bus traveling through a city road.

### Step 1 — Capture

The bus camera records the road.

### Step 2 — Detection

MARGANETRA detects a pothole and surrounding vehicles.

### Step 3 — Tracking

ByteTrack maintains persistent tracking identities.

### Step 4 — Event Normalization

`EventAccumulator` prevents repeated frame detections from becoming duplicate events.

### Step 5 — Telemetry

The event appears in:

* Live monitoring
* Notifications
* GIS map

### Step 6 — Incident

The operator confirms the incident location and registers the incident.

### Step 7 — AI Analysis

Gemini analyzes the structured incident telemetry.

### Step 8 — Report

ReportLab generates a government-facing PDF.

### Step 9 — Resolution

The incident progresses:

```text
PENDING → RESOLVED
```

---

# 🎯 SIH Problem Alignment

MARGANETRA is designed around the broader requirements of intelligent transportation and automated municipal infrastructure monitoring.

The architecture can support capabilities including:

* Vehicle detection
* Vehicle tracking
* Vehicle counting
* Traffic density estimation
* Traffic congestion analysis
* Number plate recognition
* Road damage detection
* Pothole detection
* Waterlogging detection
* Road infrastructure monitoring
* Pedestrian/safety monitoring
* Incident identification
* GPS/location integration
* Timestamped incident records
* Automated reporting

Some capabilities may be at different stages of implementation, experimentation, or integration depending on the current development branch.

---

# 📈 Future Scope

MARGANETRA can be expanded from a prototype into a city-scale intelligent transportation platform.

### Possible extensions

* City-wide CCTV integration
* Edge AI deployment
* NVIDIA Jetson-based deployments
* Public bus fleet integration
* Automatic traffic-density analytics
* Traffic signal optimization
* Advanced unsafe-driving detection
* Hit-and-run detection
* Pedestrian safety analytics
* Waterlogging detection
* Historical GIS analytics
* Predictive road maintenance
* Multi-city deployment
* Cloud-based centralized monitoring

---

# 🌐 Vision

Traditional cameras answer:

> **"What happened?"**

MARGANETRA aims to answer:

> **"What happened, where did it happen, how serious is it, what should be done, and has it been resolved?"**

The long-term vision is to transform existing cameras and mobile road-monitoring devices from **passive recording systems into active infrastructure intelligence nodes**.

---

# 👥 Team

### MARGANETRA — SIH 2026

Built as a Smart India Hackathon 2026 solution combining:

* Artificial Intelligence
* Computer Vision
* GIS
* Backend Engineering
* Frontend Engineering
* Generative AI
* Automated Reporting

---

# 📜 License

Add the project's selected license here.

For example:

```text
MIT License
```

if the team decides to release the project under MIT.

---

# ⭐ Acknowledgements

Built using open-source technologies and frameworks including:

* Ultralytics YOLO
* PyTorch
* OpenCV
* ByteTrack
* EasyOCR
* React
* FastAPI
* Leaflet
* OpenStreetMap
* ReportLab
* Google GenAI

---

## MARGANETRA

**मार्गनेत्र — Turning Roads into Data. Turning Data into Action.**
