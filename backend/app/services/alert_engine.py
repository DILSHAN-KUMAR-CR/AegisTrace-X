
from datetime import datetime, timezone


class AlertEngine:
    def __init__(self, cpu_threshold=80, memory_threshold=85):
        self.cpu_threshold = cpu_threshold
        self.memory_threshold = memory_threshold

    def evaluate(self, cpu_percent, memory_percent, anomaly=False):
        alerts = []

        if cpu_percent >= self.cpu_threshold:
            alerts.append({
                "type": "CPU",
                "severity": "HIGH" if cpu_percent >= 95 else "MEDIUM",
                "value": round(float(cpu_percent), 2),
                "threshold": self.cpu_threshold,
                "message": f"High CPU usage detected: {cpu_percent:.1f}%"
            })

        if memory_percent >= self.memory_threshold:
            alerts.append({
                "type": "MEMORY",
                "severity": "HIGH" if memory_percent >= 95 else "MEDIUM",
                "value": round(float(memory_percent), 2),
                "threshold": self.memory_threshold,
                "message": f"High memory usage detected: {memory_percent:.1f}%"
            })

        if anomaly:
            alerts.append({
                "type": "ANOMALY",
                "severity": "HIGH",
                "value": None,
                "threshold": None,
                "message": "Unusual system behavior detected by the anomaly detector"
            })

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "alert_count": len(alerts),
            "alerts": alerts
        }


alert_engine = AlertEngine()
