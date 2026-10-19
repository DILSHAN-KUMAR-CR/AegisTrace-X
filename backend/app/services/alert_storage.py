
import sqlite3
from pathlib import Path
from threading import Lock

DB_PATH = Path(__file__).resolve().parents[3] / "aegistrace.db"


class AlertStorage:
    def __init__(self, db_path=DB_PATH):
        self.db_path = str(db_path)
        self.lock = Lock()
        self.initialize()

    def connect(self):
        return sqlite3.connect(self.db_path, timeout=10)

    def initialize(self):
        with self.lock, self.connect() as connection:
            connection.execute("""
                CREATE TABLE IF NOT EXISTS alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    value REAL,
                    threshold REAL,
                    message TEXT NOT NULL
                )
            """)

            connection.execute("""
                CREATE TABLE IF NOT EXISTS active_alerts (
                    type TEXT PRIMARY KEY,
                    alert_id INTEGER NOT NULL,
                    FOREIGN KEY (alert_id) REFERENCES alerts(id)
                )
            """)

    def save_alerts(self, result):
        saved = []
        current_alerts = result.get("alerts", [])
        current_types = {alert["type"] for alert in current_alerts}

        with self.lock, self.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")

            active_rows = connection.execute(
                "SELECT type FROM active_alerts"
            ).fetchall()

            active_types = {row[0] for row in active_rows}

            for alert in current_alerts:
                alert_type = alert["type"]

                if alert_type in active_types:
                    continue

                cursor = connection.execute("""
                    INSERT INTO alerts (
                        timestamp, type, severity, value, threshold, message
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    result["timestamp"],
                    alert_type,
                    alert["severity"],
                    alert.get("value"),
                    alert.get("threshold"),
                    alert["message"]
                ))

                alert_id = cursor.lastrowid

                connection.execute("""
                    INSERT INTO active_alerts (type, alert_id)
                    VALUES (?, ?)
                """, (alert_type, alert_id))

                saved.append({
                    "id": alert_id,
                    "timestamp": result["timestamp"],
                    **alert
                })

            for alert_type in active_types - current_types:
                connection.execute(
                    "DELETE FROM active_alerts WHERE type = ?",
                    (alert_type,)
                )

        return saved

    def get_alerts(self, limit=100, severity=None):
        query = """
            SELECT id, timestamp, type, severity, value, threshold, message
            FROM alerts
        """
        params = []

        if severity:
            query += " WHERE severity = ?"
            params.append(severity.upper())

        query += " ORDER BY id DESC LIMIT ?"
        params.append(max(1, min(int(limit), 500)))

        with self.lock, self.connect() as connection:
            connection.row_factory = sqlite3.Row
            rows = connection.execute(query, params).fetchall()

        return [dict(row) for row in rows]


alert_storage = AlertStorage()

