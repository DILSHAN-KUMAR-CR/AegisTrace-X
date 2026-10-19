
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BellRing,
  CheckCircle,
  Cpu,
  Database,
  HardDrive,
  Layers,
  MemoryStick,
  RefreshCw,
  Server,
  ShieldAlert,
  Terminal,
  Wifi,
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

function MetricCard({ icon: Icon, label, value, detail, color, percent }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <div className={`metric-icon ${color}`}>
          <Icon size={20} />
        </div>
        <span className="metric-label">{label}</span>
        <span className="live-dot" />
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
      <div className="progress-track">
        <div
          className={`progress-fill ${color}`}
          style={{ width: `${Math.min(Math.max(percent || 0, 0), 100)}%` }}
        />
      </div>
    </article>
  );
}

function formatUptime(seconds = 0) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function App() {
  const [metrics, setMetrics] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const responses = await Promise.all([
        fetch(`${API}/system`),
        fetch(`${API}/processes`),
        fetch(`${API}/alerts`)
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("One or more API endpoints returned an error.");
      }

      const [system, processList, alertData] = await Promise.all(
        responses.map((response) => response.json())
      );

      setMetrics(system);
      setProcesses(processList);
      setAlerts(alertData.alerts || []);
      setHistory((previous) => [
        ...previous,
        {
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }),
          cpu: system.cpu_percent,
          memory: system.memory.used_percent
        }
      ].slice(-20));

      setConnected(true);
      setLastUpdated(new Date());
      setError("");
    } catch {
      setConnected(false);
      setError("Cannot connect to the API. Check that the AegisTrace backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const cpu = metrics?.cpu_percent ?? 0;
  const memory = metrics?.memory?.used_percent ?? 0;
  const disk = metrics?.disk?.used_percent ?? 0;
  const highAlerts = alerts.filter((alert) => alert.severity === "HIGH").length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Activity size={25} /></div>
          <div>
            <h1>AegisTrace</h1>
            <span>LINUX INTELLIGENCE</span>
          </div>
        </div>

        <div className="nav-caption">WORKSPACE</div>
        <nav className="navigation">
          <a className="nav-item active" href="#overview">
            <Layers size={18} /> Overview
          </a>
          <a className="nav-item" href="#metrics">
            <Activity size={18} /> System metrics
          </a>
          <a className="nav-item" href="#processes">
            <Terminal size={18} /> Processes
          </a>
          <a className="nav-item" href="#alerts">
            <BellRing size={18} /> Alerts
            {alerts.length > 0 && <span className="nav-count">{alerts.length}</span>}
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="security-card">
            <ShieldAlert size={22} />
            <strong>System protection</strong>
            <p>Monitor resource usage and detect unusual system behavior.</p>
            <span className="protection-status">
              <span className="live-dot" /> Monitoring enabled
            </span>
          </div>
          <div className="sidebar-version">
            <span className="version-dot" /> AegisTrace v1.2.0
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Overview</div>
          <div className="topbar-right">
            <div className={`connection-pill ${connected ? "online" : "offline"}`}>
              {connected ? <Wifi size={15} /> : <XCircle size={15} />}
              {connected ? "API Connected" : "API Disconnected"}
            </div>
            <button className="refresh-button" onClick={refresh} aria-label="Refresh metrics">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </header>

        <section className="page-heading">
          <div>
            <div className="eyebrow"><span className="live-dot" /> LIVE SYSTEM OBSERVABILITY</div>
            <h2>System Overview</h2>
            <p>Monitor system health, resource utilization, and anomaly alerts in real time.</p>
          </div>
          <div className="updated-label">
            <span>LAST UPDATED</span>
            <strong>{lastUpdated ? lastUpdated.toLocaleTimeString() : "Waiting for data"}</strong>
          </div>
        </section>

        {error && (
          <div className="error-banner">
            <XCircle size={18} />
            <span>{error}</span>
            <button onClick={refresh}>Retry</button>
          </div>
        )}

        <section className="metric-grid" id="metrics">
          <MetricCard
            icon={Cpu}
            label="CPU UTILIZATION"
            value={`${cpu.toFixed(1)}%`}
            detail="Current processor usage"
            color="cyan"
            percent={cpu}
          />
          <MetricCard
            icon={MemoryStick}
            label="MEMORY USAGE"
            value={`${memory.toFixed(1)}%`}
            detail={`${metrics?.memory?.used_gb ?? "--"} / ${metrics?.memory?.total_gb ?? "--"} GB used`}
            color="purple"
            percent={memory}
          />
          <MetricCard
            icon={HardDrive}
            label="DISK UTILIZATION"
            value={`${disk.toFixed(1)}%`}
            detail={`${metrics?.disk?.used_gb ?? "--"} / ${metrics?.disk?.total_gb ?? "--"} GB used`}
            color="green"
            percent={disk}
          />
          <MetricCard
            icon={Server}
            label="RUNNING PROCESSES"
            value={metrics?.running_processes ?? "--"}
            detail={`System uptime: ${formatUptime(metrics?.uptime_seconds)}`}
            color="orange"
            percent={Math.min((metrics?.running_processes ?? 0) / 5, 100)}
          />
        </section>

        <section className="charts-grid">
          <article className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <h3>Resource utilization</h3>
                <p>Live CPU and memory performance</p>
              </div>
              <span className="panel-tag"><span className="live-dot" /> LIVE</span>
            </div>
            <div className="chart-legend">
              <span><i className="legend-dot cpu-dot" /> CPU</span>
              <span><i className="legend-dot memory-dot" /> Memory</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#243044" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: "#8290a7", fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={30} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#8290a7", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    contentStyle={{ background: "#111b2b", border: "1px solid #2a3a50", borderRadius: 10, color: "#f1f5f9" }}
                    formatter={(value) => [`${Number(value).toFixed(1)}%`]}
                  />
                  <Area type="monotone" dataKey="cpu" name="CPU" stroke="#22d3ee" strokeWidth={2} fill="url(#cpuGradient)" isAnimationActive={false} />
                  <Area type="monotone" dataKey="memory" name="Memory" stroke="#a78bfa" strokeWidth={2} fill="url(#memoryGradient)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-footer">
              <span><span className="live-dot" /> Refreshing every 5 seconds</span>
              <span>{history.length} samples collected</span>
            </div>
          </article>

          <article className="panel status-panel">
            <div className="panel-heading">
              <div>
                <h3>System health</h3>
                <p>Current monitoring status</p>
              </div>
              <Activity size={19} className="muted-icon" />
            </div>
            <div className={`health-indicator ${!connected ? "health-offline" : highAlerts ? "health-warning" : "health-good"}`}>
              {connected ? <CheckCircle size={27} /> : <XCircle size={27} />}
              <div>
                <strong>{!connected ? "Disconnected" : highAlerts ? "Attention required" : "System operational"}</strong>
                <span>{!connected ? "Backend unavailable" : highAlerts ? `${highAlerts} high severity alerts` : "API responding normally"}</span>
              </div>
            </div>
            <div className="health-row">
              <span><span className="status-dot green-dot" /> Backend API</span>
              <strong>{connected ? "Online" : "Offline"}</strong>
            </div>
            <div className="health-row">
              <span><span className="status-dot green-dot" /> Metrics collection</span>
              <strong>{connected ? "Active" : "Paused"}</strong>
            </div>
            <div className="health-row">
              <span><span className={`status-dot ${alerts.length ? "orange-dot" : "green-dot"}`} /> Active alerts</span>
              <strong>{alerts.length}</strong>
            </div>
            <div className="health-row">
              <span><span className="status-dot purple-dot" /> Processes tracked</span>
              <strong>{processes.length}</strong>
            </div>
            <div className="health-note">
              <Database size={17} />
              <span>Metrics are collected directly from the Linux host using psutil.</span>
            </div>
          </article>
        </section>

        <section className="bottom-grid">
          <article className="panel process-panel" id="processes">
            <div className="panel-heading">
              <div>
                <h3>Top processes</h3>
                <p>Processes ranked by memory consumption</p>
              </div>
              <span className="count-badge">{processes.length} tracked</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>PROCESS</th>
                    <th>PID</th>
                    <th>STATUS</th>
                    <th>MEMORY</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.slice(0, 8).map((process, index) => (
                    <tr key={`${process.pid}-${index}`}>
                      <td>
                        <div className="process-name">
                          <span className="process-icon"><Terminal size={15} /></span>
                          <span>{process.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="mono">{process.pid}</td>
                      <td><span className={`process-status ${process.status === "running" ? "running" : ""}`}>{process.status || "unknown"}</span></td>
                      <td>
                        <div className="memory-cell">
                          <span>{Number(process.memory_percent || 0).toFixed(2)}%</span>
                          <div className="mini-track"><div style={{ width: `${Math.min(process.memory_percent || 0, 100)}%` }} /></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!processes.length && (
                    <tr><td colSpan="4" className="empty-cell">{loading ? "Loading processes..." : "No process data available."}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel alerts-panel" id="alerts">
            <div className="panel-heading">
              <div>
                <h3>System alerts</h3>
                <p>Threshold and anomaly notifications</p>
              </div>
              <span className="count-badge">{alerts.length} active</span>
            </div>
            <div className="alerts-list">
              {alerts.length ? alerts.map((alert, index) => (
                <div className="alert-item" key={`${alert.type}-${index}`}>
                  <div className={`alert-icon ${alert.severity === "HIGH" ? "alert-high" : "alert-medium"}`}>
                    <ShieldAlert size={18} />
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">{alert.type} alert <span className={`severity ${alert.severity?.toLowerCase()}`}>{alert.severity}</span></div>
                    <p>{alert.message}</p>
                    <span className="alert-time">{alert.value != null ? `Current value: ${alert.value}%` : "Anomaly detector notification"}</span>
                  </div>
                </div>
              )) : (
                <div className="no-alerts">
                  <div className="no-alerts-icon"><CheckCircle size={24} /></div>
                  <strong>No active alerts</strong>
                  <p>{connected ? "No threshold alerts detected in the latest check." : "Connect to the backend to receive alerts."}</p>
                </div>
              )}
            </div>
            <div className="alert-footer">
              <BellRing size={15} />
              Alert thresholds: CPU 80% · Memory 85%
            </div>
          </article>
        </section>

        <footer className="page-footer">
          <span>AEGISTRACE <span className="footer-separator">/</span> SYSTEM INTELLIGENCE</span>
          <span><span className="live-dot" /> {connected ? "Live monitoring active" : "Waiting for backend"}</span>
        </footer>
      </main>
    </div>
  );
}

export default App;

