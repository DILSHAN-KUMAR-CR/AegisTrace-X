
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BellRing,
  CheckCircle,
  ChevronRight,
  Cpu,
  Database,
  HardDrive,
  LayoutDashboard,
  MemoryStick,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  Terminal,
  XCircle
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import "./App.css";

const API = "http://localhost:8000";

const navigation = [
  { label: "System Overview", icon: LayoutDashboard },
  { label: "Resource Metrics", icon: Activity },
  { label: "Processes", icon: Terminal },
  { label: "Alerts & History", icon: BellRing },
  { label: "Anomaly Detection", icon: ShieldAlert },
  { label: "Event Storage", icon: Database }
];

function MetricCard({ title, value, unit = "%", icon: Icon, color, detail }) {
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <span>{title}</span>
        <Icon size={21} color={color} />
      </div>
      <div className="metric-value">
        {value ?? "--"}<small>{value == null ? "" : unit}</small>
      </div>
      <div className="metric-bar">
        <div
          className="metric-bar-fill"
          style={{
            width: `${Math.min(100, Math.max(0, Number(value) || 0))}%`,
            background: color
          }}
        />
      </div>
      <div className="metric-detail">{detail}</div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <Activity size={28} />
      <p>{message}</p>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("System Overview");
  const [system, setSystem] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [severity, setSeverity] = useState("ALL");
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const [systemResponse, processResponse, alertResponse, historyResponse, analysisResponse] =
        await Promise.all([
          fetch(`${API}/system`),
          fetch(`${API}/processes`),
          fetch(`${API}/alerts`),
          fetch(`${API}/alerts/history?limit=100`),
          fetch(`${API}/analyze`)
        ]);

      if (
        !systemResponse.ok ||
        !processResponse.ok ||
        !alertResponse.ok ||
        !historyResponse.ok ||
        !analysisResponse.ok
      ) {
        throw new Error("One or more backend endpoints returned an error.");
      }

      const [systemData, processData, alertData, historyData, analysisData] =
        await Promise.all([
          systemResponse.json(),
          processResponse.json(),
          alertResponse.json(),
          historyResponse.json(),
          analysisResponse.json()
        ]);

      setSystem(systemData);
      setProcesses(Array.isArray(processData) ? processData : []);
      setAlerts(alertData.alerts || []);
      setHistory(historyData.alerts || []);
      setAnalysis(analysisData);
      setError("");

      setChartData((previous) => [
        ...previous.slice(-19),
        {
          time: new Date().toLocaleTimeString(),
          cpu: systemData.cpu_percent,
          memory: systemData.memory?.used_percent ?? 0,
          disk: systemData.disk?.used_percent ?? 0
        }
      ]);
    } catch (err) {
      setError(
        `Cannot load dashboard data. Check that the backend is running at ${API}.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const timer = setInterval(loadDashboard, 5000);
    return () => clearInterval(timer);
  }, [loadDashboard]);

  const openPage = (label) => {
    setPage(label);
    setExplanation(null);
  };

  const explain = async (type) => {
    try {
      setExplanation({ loading: true });
      const response = await fetch(`${API}/alerts/explain/${type}`);

      if (!response.ok) {
        throw new Error("Explanation request failed.");
      }

      setExplanation(await response.json());
    } catch {
      setExplanation({
        error: "Unable to load the explanation. Check the backend and try again."
      });
    }
  };

  const filteredHistory =
    severity === "ALL"
      ? history
      : history.filter((item) => item.severity === severity);

  const cpu = system?.cpu_percent;
  const memory = system?.memory?.used_percent;
  const disk = system?.disk?.used_percent;

  const formatUptime = (seconds) => {
    if (seconds == null) return "--";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const renderExplanation = () => {
    if (!explanation) return null;

    if (explanation.loading) {
      return <div className="panel">Loading explanation...</div>;
    }

    if (explanation.error) {
      return <div className="panel">{explanation.error}</div>;
    }

    const data = explanation.explanation;

    return (
      <section className="panel explanation-panel">
        <div className="panel-heading">
          <div>
            <h2>{data.title}</h2>
            <p>Alert explanation and recommended actions</p>
          </div>
          <button
            className="secondary-button"
            onClick={() => setExplanation(null)}
          >
            Close
          </button>
        </div>
        <p>{data.explanation}</p>
        <h3>Possible causes</h3>
        <ul>
          {data.possible_causes?.map((cause) => (
            <li key={cause}>{cause}</li>
          ))}
        </ul>
        <h3>Recommended actions</h3>
        <ul>
          {data.recommended_actions?.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </section>
    );
  };

  const renderChart = () => (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Resource Trends</h2>
          <p>Live system usage over recent refreshes</p>
        </div>
        <Activity size={21} />
      </div>
      <div className="chart-container">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#273447" />
              <XAxis dataKey="time" stroke="#8593a8" />
              <YAxis domain={[0, 100]} stroke="#8593a8" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="cpu"
                name="CPU"
                stroke="#55e0c0"
                fill="#55e0c0"
                fillOpacity={0.12}
              />
              <Area
                type="monotone"
                dataKey="memory"
                name="Memory"
                stroke="#83a6ff"
                fill="#83a6ff"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="Waiting for resource data..." />
        )}
      </div>
    </section>
  );

  const renderProcesses = () => (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Running Processes</h2>
          <p>Processes sorted by memory consumption</p>
        </div>
        <button className="secondary-button" onClick={loadDashboard}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>PID</th>
              <th>Process</th>
              <th>Memory</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process, index) => (
              <tr key={process.pid ?? index}>
                <td>{process.pid ?? "--"}</td>
                <td>{process.name || "Unknown"}</td>
                <td>
                  {Number(process.memory_percent || 0).toFixed(2)}%
                </td>
                <td>{process.status || "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {processes.length === 0 && (
          <EmptyState message="No process information available." />
        )}
      </div>
    </section>
  );

  const renderAlertList = (items) => (
    <div className="alert-list">
      {items.map((alert, index) => (
        <div className="alert-item" key={alert.id ?? `${alert.type}-${index}`}>
          <AlertTriangle size={19} />
          <div className="alert-content">
            <strong>{alert.type || "System alert"}</strong>
            <p>{alert.message}</p>
            <small>
              {alert.timestamp
                ? new Date(alert.timestamp).toLocaleString()
                : "Current alert"}
            </small>
          </div>
          <span className={`severity-badge ${(alert.severity || "medium").toLowerCase()}`}>
            {alert.severity || "MEDIUM"}
          </span>
          <button
            className="secondary-button"
            onClick={() => explain(alert.type)}
          >
            Explain
          </button>
        </div>
      ))}
      {items.length === 0 && (
        <EmptyState message="No alerts to display." />
      )}
    </div>
  );

  const renderContent = () => {
    if (loading && !system) {
      return <section className="panel"><p>Loading system data...</p></section>;
    }

    if (page === "System Overview") {
      return (
        <>
          <section className="metrics-grid">
            <MetricCard title="CPU UTILIZATION" value={cpu} icon={Cpu} color="#55e0c0" detail="Current CPU usage" />
            <MetricCard title="MEMORY USAGE" value={memory} icon={MemoryStick} color="#83a6ff" detail={`${system?.memory?.used_gb ?? "--"} / ${system?.memory?.total_gb ?? "--"} GB`} />
            <MetricCard title="DISK UTILIZATION" value={disk} icon={HardDrive} color="#bd91ff" detail={`${system?.disk?.used_gb ?? "--"} / ${system?.disk?.total_gb ?? "--"} GB`} />
            <MetricCard title="RUNNING PROCESSES" value={system?.running_processes} unit="" icon={Terminal} color="#f4bf68" detail="Detected process IDs" />
          </section>
          {renderChart()}
          <section className="panel">
            <div className="panel-heading">
              <div><h2>Active Alerts</h2><p>Current system warnings</p></div>
              <button className="secondary-button" onClick={() => openPage("Alerts & History")}>View all <ChevronRight size={15} /></button>
            </div>
            {renderAlertList(alerts)}
          </section>
        </>
      );
    }

    if (page === "Resource Metrics") {
      return (
        <>
          <section className="metrics-grid">
            <MetricCard title="CPU UTILIZATION" value={cpu} icon={Cpu} color="#55e0c0" detail="Current CPU usage" />
            <MetricCard title="MEMORY USAGE" value={memory} icon={MemoryStick} color="#83a6ff" detail={`${system?.memory?.used_gb ?? "--"} / ${system?.memory?.total_gb ?? "--"} GB`} />
            <MetricCard title="DISK UTILIZATION" value={disk} icon={HardDrive} color="#bd91ff" detail={`${system?.disk?.used_gb ?? "--"} / ${system?.disk?.total_gb ?? "--"} GB`} />
          </section>
          {renderChart()}
          <section className="panel">
            <h2>System Information</h2>
            <p>Uptime: {formatUptime(system?.uptime_seconds)}</p>
            <p>Total memory: {system?.memory?.total_gb ?? "--"} GB</p>
            <p>Total disk: {system?.disk?.total_gb ?? "--"} GB</p>
            <p>Running processes: {system?.running_processes ?? "--"}</p>
          </section>
        </>
      );
    }

    if (page === "Processes") return renderProcesses();

    if (page === "Alerts & History") {
      return (
        <section className="panel">
          <div className="panel-heading">
            <div><h2>Alerts & History</h2><p>Persisted alerts stored in SQLite</p></div>
            <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
              <option value="ALL">All severities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          {renderAlertList(filteredHistory)}
        </section>
      );
    }

    if (page === "Anomaly Detection") {
      return (
        <>
          <section className="panel">
            <div className="panel-heading">
              <div><h2>Anomaly Detection</h2><p>Isolation Forest analysis of CPU and memory metrics</p></div>
              <ShieldAlert size={22} />
            </div>
            <div className="anomaly-status">
              {analysis?.anomaly ? <XCircle size={24} /> : <CheckCircle size={24} />}
              <div>
                <strong>
                  {analysis?.status === "learning"
                    ? "Learning system baseline"
                    : analysis?.anomaly
                      ? "Potential anomaly detected"
                      : "No anomaly detected"}
                </strong>
                <p>{analysis?.message || "Analysis is based on recent CPU and memory samples."}</p>
              </div>
            </div>
            <p>Samples collected: {analysis?.samples_collected ?? 0}</p>
            <p>CPU usage: {analysis?.cpu_percent ?? cpu ?? "--"}%</p>
            <p>Memory usage: {analysis?.memory_percent ?? memory ?? "--"}%</p>
            <button className="secondary-button" onClick={loadDashboard}>
              <RefreshCw size={15} /> Run analysis
            </button>
          </section>
          {renderExplanation()}
          <section className="panel">
            <h2>Understand the result</h2>
            <p>The Isolation Forest model flags metric patterns that differ from its recent sample window. An anomaly is not proof of malware or a security incident.</p>
          </section>
        </>
      );
    }

    if (page === "Event Storage") {
      return (
        <section className="panel">
          <div className="panel-heading">
            <div><h2>Event Storage</h2><p>Alert records saved in the local SQLite database</p></div>
            <Database size={22} />
          </div>
          <div className="metrics-grid">
            <MetricCard title="STORED ALERTS" value={history.length} unit="" icon={Database} color="#55e0c0" detail="Records returned by API" />
            <MetricCard title="HIGH SEVERITY" value={history.filter((item) => item.severity === "HIGH").length} unit="" icon={ShieldAlert} color="#ff7887" detail="High severity records" />
            <MetricCard title="MEDIUM SEVERITY" value={history.filter((item) => item.severity === "MEDIUM").length} unit="" icon={BellRing} color="#f4bf68" detail="Medium severity records" />
          </div>
          <p>Database file: ~/AegisTrace/aegistrace.db</p>
          {renderAlertList(history)}
        </section>
      );
    }

    return <EmptyState message="Select a page from the sidebar." />;
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Shield size={25} /></div>
          <div><strong>AegisTrace</strong><span>System Intelligence</span></div>
        </div>
        <div className="nav-section-title">MONITORING</div>
        {navigation.slice(0, 4).map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`nav-item ${page === label ? "active" : ""}`}
            onClick={() => openPage(label)}
          >
            <Icon size={18} /><span>{label}</span>
          </button>
        ))}
        <div className="nav-section-title">INTELLIGENCE</div>
        {navigation.slice(4).map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`nav-item ${page === label ? "active" : ""}`}
            onClick={() => openPage(label)}
          >
            <Icon size={18} /><span>{label}</span>
          </button>
        ))}
        <div className="sidebar-footer">
          <span className="status-dot" />
          Backend connection
          <strong>{error ? "Offline" : "Connected"}</strong>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">LINUX SYSTEM MONITOR / OVERVIEW</span>
            <h1>{page}</h1>
            <p>Real-time resource monitoring and machine-learning anomaly detection</p>
          </div>
          <div className="topbar-actions">
            <span className="system-online"><WifiIcon /> SYSTEM {error ? "OFFLINE" : "ONLINE"}</span>
            <button className="secondary-button" onClick={loadDashboard}>
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <XCircle size={18} /> {error}
          </div>
        )}

        <section className="system-banner">
          <div className="brand-icon"><Shield size={24} /></div>
          <div>
            <strong>AegisTrace Monitoring Engine</strong>
            <p>System telemetry, persistent alerts and anomaly analysis</p>
          </div>
          <span className="live-indicator"><span className="status-dot" /> LIVE MONITORING</span>
        </section>

        <div className="page-content">
          {renderContent()}
          {renderExplanation()}
        </div>

        <footer className="app-footer">
          <span><Server size={14} /> AegisTrace v1.4.0</span>
          <span>Uptime: {formatUptime(system?.uptime_seconds)}</span>
          <span>Auto-refresh: 5 seconds</span>
        </footer>
      </main>
    </div>
  );
}

function WifiIcon() {
  return <Activity size={15} />;
}
