# AegisTrace — AI-Powered Linux System Intelligence

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" alt="Scikit-learn">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux">
</p>

<p align="center">
  A full-stack system monitoring platform combining real-time resource analytics, machine-learning-based anomaly detection, intelligent alerting, and persistent event storage.
</p>

**Author:** Dilshan Kumar CR

## Overview

AegisTrace is a Linux system monitoring and intelligence platform designed to provide visibility into system performance and unusual resource utilization. It combines a React-based dashboard with a FastAPI backend to collect system metrics, monitor processes, detect potential anomalies, and maintain a persistent alert history.

The application uses `psutil` to retrieve system information, Isolation Forest from scikit-learn to identify unusual CPU and memory usage patterns, a rule-based alert engine to detect resource threshold violations, and SQLite to store alert records.

## Key Features

### Real-Time System Monitoring

- Monitor CPU utilization.
- Track memory usage and available memory.
- Monitor disk utilization.
- Display running process counts.
- Automatically refresh dashboard information every five seconds.

### Process Monitoring

- Retrieve running processes.
- Display process IDs, names, memory consumption, and status.
- Sort processes by memory consumption.
- Identify resource-intensive processes for further investigation.

### Machine Learning Anomaly Detection

- Implements the Isolation Forest algorithm.
- Analyzes CPU and memory utilization patterns.
- Collects a rolling window of system measurements.
- Establishes a baseline before performing anomaly analysis.
- Reports potentially unusual system behavior.

### Alert Management

- Detect high CPU utilization.
- Detect high memory utilization.
- Generate alerts for detected anomalies.
- Assign severity levels to alerts.
- Display active alerts and historical records.
- Provide predefined explanations, possible causes, and recommended actions.

### Persistent Event Storage

- Store alert records in SQLite.
- Retrieve alert history through REST API endpoints.
- Filter historical alerts by severity.
- Prevent repeated recording of an alert type while it remains active.
- Record new events when a cleared alert triggers again.

### Interactive Dashboard

- System Overview
- Resource Metrics
- Processes
- Alerts & History
- Anomaly Detection
- Event Storage

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, JavaScript |
| Build Tool | Vite |
| Styling | CSS |
| Icons | Lucide React |
| Data Visualization | Recharts |
| Backend | Python, FastAPI |
| System Monitoring | psutil |
| Machine Learning | scikit-learn, Isolation Forest, NumPy |
| Database | SQLite |
| API Communication | REST, JSON |
| Development Environment | Linux, Ubuntu on WSL2 |
| Version Control | Git, GitHub |

## System Architecture

```text
System Metrics
      |
      v
psutil System Monitoring
      |
      v
FastAPI Backend
      |
      +---------------------+
      |                     |
      v                     v
Isolation Forest       Rule-Based Alert Engine
Anomaly Detection      Threshold Evaluation
      |                     |
      +----------+----------+
                 |
                 v
          SQLite Database
          Persistent Alerts
                 |
                 v
          React Dashboard
          Charts and Metrics
```

## Project Structure

```text
AegisTrace/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── anomaly_detector.py
│   │       ├── alert_engine.py
│   │       ├── alert_storage.py
│   │       └── alert_explainer.py
│   └── tests/
│       ├── test_main.py
│       └── test_alert_engine.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docs/
├── .gitignore
└── README.md
```

The SQLite database and Python virtual environment are generated or maintained locally and should not be committed to the repository.

## Prerequisites

Install the following:

- Python 3.10 or a compatible version supported by your dependencies.
- Node.js and npm.
- Git.
- Ubuntu, Linux, or Windows Subsystem for Linux 2.

Verify the installations:

```bash
python3 --version
node --version
npm --version
git --version
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd AegisTrace
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

If the project is already available locally:

```bash
cd ~/AegisTrace
```

### 2. Set Up the Backend

Create and activate a Python virtual environment if one does not already exist:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the required Python dependencies:

```bash
pip install fastapi "uvicorn[standard]" psutil numpy scikit-learn
```

If a backend `requirements.txt` is available and includes all required packages, install dependencies from it instead:

```bash
pip install -r requirements.txt
```

### 3. Set Up the Frontend

Open a separate terminal:

```bash
cd ~/AegisTrace/frontend
npm install
```

## Running the Application

The frontend and backend run independently in separate terminals.

### Start the Backend

```bash
cd ~/AegisTrace
source .venv/bin/activate
uvicorn backend.app.main:app --reload
```

Backend URL:

`http://localhost:8000`

Interactive API documentation:

`http://localhost:8000/docs`

Health endpoint:

`http://localhost:8000/health`

### Start the Frontend

```bash
cd ~/AegisTrace/frontend
npm run dev
```

Open the dashboard:

`http://localhost:5173`

## Dashboard Modules

### System Overview

Displays CPU utilization, memory consumption, disk usage, running process count, resource trends, and active alerts.

### Resource Metrics

Displays detailed resource usage and recent CPU and memory trends, along with system information.

### Processes

Displays running process information, including process IDs, names, memory utilization, and status.

### Alerts & History

Displays current alerts and persisted alert records. Historical alerts can be filtered by severity, and supported alert types can be explained through the backend API.

### Anomaly Detection

Displays the Isolation Forest detector's status, sample count, and current metric measurements. The detector identifies unusual CPU and memory utilization patterns.

### Event Storage

Displays stored alert statistics and historical event records backed by SQLite.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Project metadata |
| GET | `/health` | Backend health and uptime |
| GET | `/system` | System resource metrics |
| GET | `/metrics` | Alias for system metrics |
| GET | `/processes` | Top 20 processes by memory consumption |
| GET | `/analyze` | Analyze current system metrics |
| GET | `/alerts` | Evaluate current metrics and return active alerts and history |
| GET | `/alerts/history` | Retrieve stored alert records |
| GET | `/alerts/history?limit=50` | Retrieve up to 50 historical records |
| GET | `/alerts/history?severity=HIGH` | Filter history by severity |
| GET | `/alerts/explain/CPU` | Explain a CPU alert |
| GET | `/alerts/explain/MEMORY` | Explain a memory alert |
| GET | `/alerts/explain/ANOMALY` | Explain an anomaly alert |

### Example API Requests

Retrieve system metrics:

```bash
curl http://localhost:8000/system
```

Retrieve process information:

```bash
curl http://localhost:8000/processes
```

Analyze system behavior:

```bash
curl http://localhost:8000/analyze
```

Retrieve alert history:

```bash
curl "http://localhost:8000/alerts/history?limit=50"
```

Request an alert explanation:

```bash
curl http://localhost:8000/alerts/explain/CPU
```

## Machine Learning Methodology

AegisTrace uses Isolation Forest, an unsupervised anomaly detection algorithm provided by scikit-learn.

The model analyzes two system features:

- CPU utilization percentage.
- Memory utilization percentage.

The detection workflow is:

1. Collect system resource measurements.
2. Store recent observations in a rolling window.
3. Collect at least 30 samples before performing analysis.
4. Fit the Isolation Forest model to the available samples.
5. Evaluate the current measurement and calculate an anomaly score.
6. Return the result to the dashboard.
7. Generate an alert when an anomaly is detected.

The implementation uses a maximum rolling window of 200 samples and a configured contamination rate of 5%.

An anomaly indicates that a measurement differs from the learned pattern; it does not independently establish that a security threat exists. The detector is fitted to recent observations at runtime rather than loaded from a pretrained model.

## Alert Management

The rule-based alert engine uses configurable resource thresholds.

| Alert Type | Trigger | Severity |
|---|---|---|
| CPU | CPU utilization at or above 80% | MEDIUM |
| CPU | CPU utilization at or above 95% | HIGH |
| Memory | Memory utilization at or above 85% | MEDIUM |
| Memory | Memory utilization at or above 95% | HIGH |
| Anomaly | Isolation Forest identifies an anomaly | HIGH |

The alert explanation service provides predefined explanations, possible causes, and recommended actions. These explanations are rule-based and are not currently generated by a large language model.

## Database Design

AegisTrace uses SQLite to maintain alert history.

Default database location:

```text
~/AegisTrace/aegistrace.db
```

### Alerts Table

Stores:

- Alert ID
- Timestamp
- Alert type
- Severity
- Measured value
- Threshold
- Alert message

### Active Alerts Table

Tracks alert types that are currently active. This helps prevent duplicate historical records for the same alert type while the alert remains active.

When an alert clears, its active tracking record is removed. If the alert triggers again later, a new history record can be created.

## Future Enhancements

- Large language model integration for contextual alert explanations.
- Historical resource analytics and trend reports.
- Configurable alert thresholds.
- Export alert records to CSV or JSON.
- Detailed process-level CPU monitoring.
- Email or messaging notifications.
- User authentication and role-based access control.
- Additional automated tests.
- Production deployment and containerization.
- Configurable monitoring intervals.

These items represent potential future improvements, not necessarily implemented features.

## Author

**Dilshan Kumar CR**

Project: AegisTrace — AI-Powered Linux System Intelligence

## License

Choose and add a license file before publishing the project under a specific license. If you choose the MIT License, include the complete MIT License text in a root-level `LICENSE` file.

---

AegisTrace — Real-time system monitoring, anomaly detection, and alert intelligence.
