
def explain_alert(alert):
    alert_type = str(alert.get("type", "")).upper()
    severity = str(alert.get("severity", "MEDIUM")).upper()
    value = alert.get("value")

    if alert_type == "CPU":
        return {
            "title": "High CPU Usage",
            "explanation": (
                f"CPU usage has reached {value}%. "
                "A process may be consuming excessive processing resources."
            ),
            "possible_causes": [
                "Resource-intensive applications",
                "Multiple processes running simultaneously",
                "Background tasks or system services"
            ],
            "recommended_actions": [
                "Inspect the top CPU-consuming processes.",
                "Check whether any application is stuck or unresponsive.",
                "Stop unnecessary processes only after identifying them."
            ]
        }

    if alert_type == "MEMORY":
        return {
            "title": "High Memory Usage",
            "explanation": (
                f"Memory usage has reached {value}%. "
                "The system may have less available RAM for new tasks."
            ),
            "possible_causes": [
                "Applications consuming large amounts of memory",
                "Too many applications running simultaneously",
                "Memory-intensive workloads"
            ],
            "recommended_actions": [
                "Inspect the top memory-consuming processes.",
                "Close applications you no longer need.",
                "Check whether memory usage continues to increase."
            ]
        }

    if alert_type == "ANOMALY":
        return {
            "title": "Unusual System Behavior",
            "explanation": (
                "The anomaly detector identified a CPU and memory "
                "usage pattern that differs from its learned baseline. "
                "This does not necessarily indicate a security threat."
            ),
            "possible_causes": [
                "A sudden change in workload",
                "A resource-intensive process",
                "An unusual but legitimate system task"
            ],
            "recommended_actions": [
                "Inspect current CPU and memory usage.",
                "Review resource-intensive processes.",
                "Check whether the unusual behavior persists."
            ]
        }

    return {
        "title": "System Alert",
        "explanation": alert.get(
            "message", "The system reported an alert."
        ),
        "possible_causes": [
            "A system condition requires investigation."
        ],
        "recommended_actions": [
            "Review the alert details and current system metrics."
        ]
    }
