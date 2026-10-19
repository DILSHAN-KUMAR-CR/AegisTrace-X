
import time

import psutil
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from backend.app.services.alert_engine import alert_engine
from backend.app.services.alert_storage import alert_storage
from backend.app.services.anomaly_detector import detector
from backend.app.services.alert_explainer import explain_alert

app = FastAPI(
    title="AegisTrace",
    description="AI-Powered Linux System Intelligence",
    version="1.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

START_TIME = time.time()


@app.get("/")
def home():
    return {
        "project": "AegisTrace",
        "description": "AI-Powered Linux System Intelligence",
        "status": "online",
        "version": "1.4.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "uptime_seconds": round(time.time() - START_TIME, 2)
    }


@app.get("/system")
@app.get("/metrics")
def system_metrics():
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    return {
        "cpu_percent": psutil.cpu_percent(interval=0.5),
        "memory": {
            "total_gb": round(memory.total / (1024 ** 3), 2),
            "used_gb": round(memory.used / (1024 ** 3), 2),
            "used_percent": memory.percent
        },
        "disk": {
            "total_gb": round(disk.total / (1024 ** 3), 2),
            "used_gb": round(disk.used / (1024 ** 3), 2),
            "used_percent": disk.percent
        },
        "uptime_seconds": round(time.time() - psutil.boot_time()),
        "running_processes": len(psutil.pids())
    }


@app.get("/processes")
def processes():
    result = []

    for process in psutil.process_iter(
        ["pid", "name", "memory_percent", "status"]
    ):
        try:
            result.append(process.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return sorted(
        result,
        key=lambda item: item.get("memory_percent") or 0,
        reverse=True
    )[:20]


@app.get("/analyze")
def analyze_system():
    cpu = psutil.cpu_percent(interval=0.5)
    memory = psutil.virtual_memory().percent

    return detector.analyze(cpu, memory)


@app.get("/alerts")
def get_alerts():
    cpu = psutil.cpu_percent(interval=0.5)
    memory = psutil.virtual_memory().percent
    analysis = detector.analyze(cpu, memory)

    current = alert_engine.evaluate(
        cpu,
        memory,
        analysis.get("anomaly", False)
    )

    saved_alerts = alert_storage.save_alerts(current)

    return {
        **current,
        "history": alert_storage.get_alerts(limit=100),
        "newly_recorded": len(saved_alerts)
    }


@app.get("/alerts/history")
def alert_history(
    limit: int = Query(default=100, ge=1, le=500),
    severity: str | None = None
):
    if severity:
        severity = severity.upper()

        if severity not in {"HIGH", "MEDIUM", "LOW"}:
            raise HTTPException(
                status_code=400,
                detail="Severity must be HIGH, MEDIUM, or LOW"
            )

    history = alert_storage.get_alerts(
        limit=limit,
        severity=severity
    )

    return {
        "count": len(history),
        "alerts": history
    }


@app.get("/alerts/explain/{alert_type}")
def explain_system_alert(alert_type: str):
    alert_type = alert_type.upper()

    if alert_type not in {"CPU", "MEMORY", "ANOMALY"}:
        raise HTTPException(
            status_code=400,
            detail="Alert type must be CPU, MEMORY, or ANOMALY"
        )

    cpu = psutil.cpu_percent(interval=0.5)
    memory = psutil.virtual_memory().percent

    if alert_type == "CPU":
        value = cpu
    elif alert_type == "MEMORY":
        value = memory
    else:
        value = None

    alert = {
        "type": alert_type,
        "severity": "HIGH",
        "value": value,
        "message": f"{alert_type} alert explanation requested"
    }

    return {
        "alert_type": alert_type,
        "explanation": explain_alert(alert)
    }
