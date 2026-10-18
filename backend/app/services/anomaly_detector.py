
from collections import deque
from threading import Lock

import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self, window_size=200, contamination=0.05):
        self.samples = deque(maxlen=window_size)
        self.model = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42
        )
        self.lock = Lock()
        self.is_trained = False

    def analyze(self, cpu_percent, memory_percent):
        sample = [
            float(np.clip(cpu_percent, 0, 100)),
            float(np.clip(memory_percent, 0, 100))
        ]

        with self.lock:
            self.samples.append(sample)

            if len(self.samples) < 30:
                return {
                    "status": "learning",
                    "anomaly": False,
                    "samples_collected": len(self.samples),
                    "message": "Collecting baseline system metrics"
                }

            data = np.asarray(self.samples)
            self.model.fit(data)
            self.is_trained = True

            prediction = int(self.model.predict([sample])[0])
            score = float(self.model.decision_function([sample])[0])

            return {
                "status": "analyzed",
                "anomaly": prediction == -1,
                "anomaly_score": round(score, 4),
                "cpu_percent": sample[0],
                "memory_percent": sample[1],
                "samples_collected": len(self.samples)
            }

detector = AnomalyDetector()
