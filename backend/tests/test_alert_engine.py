
from backend.app.services.alert_engine import AlertEngine


def test_no_alerts_under_thresholds():
    engine = AlertEngine()
    result = engine.evaluate(30, 40)
    assert result["alert_count"] == 0


def test_cpu_alert():
    engine = AlertEngine()
    result = engine.evaluate(85, 40)
    assert result["alert_count"] == 1
    assert result["alerts"][0]["type"] == "CPU"
    assert result["alerts"][0]["severity"] == "MEDIUM"


def test_high_cpu_alert():
    engine = AlertEngine()
    result = engine.evaluate(96, 40)
    assert result["alerts"][0]["severity"] == "HIGH"


def test_memory_alert():
    engine = AlertEngine()
    result = engine.evaluate(30, 90)
    assert result["alerts"][0]["type"] == "MEMORY"


def test_anomaly_alert():
    engine = AlertEngine()
    result = engine.evaluate(30, 40, anomaly=True)
    assert result["alert_count"] == 1
    assert result["alerts"][0]["type"] == "ANOMALY"


def test_multiple_alerts():
    engine = AlertEngine()
    result = engine.evaluate(96, 97, anomaly=True)
    assert result["alert_count"] == 3
