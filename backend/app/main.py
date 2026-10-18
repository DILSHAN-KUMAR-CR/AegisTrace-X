
import time
import psutil
from fastapi import FastAPI

app = FastAPI(title="AegisTrace", version="1.0.0")
START_TIME = time.time()

@app.get("/")
def home():
    return {"project": "AegisTrace", "status": "online"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/system")
def system_metrics():
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    return {
        "cpu_percent": psutil.cpu_percent(interval=0.5),
        "memory": {
            "total_gb": round(memory.total / (1024 ** 3), 2),
            "used_percent": memory.percent
        },
        "disk": {
            "total_gb": round(disk.total / (1024 ** 3), 2),
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
