import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import AppShell from "../components/layout/AppShell";
import {
  Activity,
  BarChart3,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Zap,
  Database,
} from "lucide-react";

type Tab = "logs" | "analytics" | "metrics" | "query";

export default function D1Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("logs");

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">D1 Database</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Cloudflare D1 edge database management</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              <Zap className="size-3" />
              Edge Connected
            </span>
          </div>
        </div>

        {/* Database Setup Banner */}
        <MigrationPanel />

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-1 rounded-lg border border-border p-1">
          {(
            [
              { id: "logs" as Tab, label: "Audit Logs", icon: FileText },
              { id: "analytics" as Tab, label: "Analytics", icon: Activity },
              { id: "metrics" as Tab, label: "Store Metrics", icon: BarChart3 },
              { id: "query" as Tab, label: "Raw Query", icon: Search },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "logs" && <AuditLogsPanel />}
        {activeTab === "analytics" && <AnalyticsPanel />}
        {activeTab === "metrics" && <MetricsPanel />}
        {activeTab === "query" && <RawQueryPanel />}
      </div>
    </AppShell>
  );
}

// ─── Migration Panel ────────────────────────────────────

function MigrationPanel() {
  const runMigration = useAction(api.d1.runMigration);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    setLoading(true);
    setError(null);
    try {
      await runMigration();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
        <span className="text-xs text-emerald-400">Database initialized — 3 tables created (audit_logs, analytics_events, store_metrics)</span>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
      <Database className="size-4 text-amber-400 shrink-0" />
      <span className="text-xs text-muted-foreground flex-1">Database tables not yet initialized. Run the migration to create them.</span>
      <button
        onClick={handleMigrate}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-md bg-[var(--ring)] px-3 py-1.5 text-[11px] font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-3 animate-spin" /> : <Database className="size-3" />}
        Initialize
      </button>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  );
}

// ─── Audit Logs Panel ─────────────────────────────────────

function AuditLogsPanel() {
  const queryLogs = useAction(api.d1.queryAuditLogs);
  const [logs, setLogs] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryLogs({
        eventType: filter || undefined,
        limit: 50,
      });
      setLogs(result.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to query D1");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by event type..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-lg border border-border bg-input/50 py-2 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring/20"
          />
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground transition hover:bg-accent"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Query
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      {logs === null && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <FileText className="mb-3 size-8 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            Click "Query" to fetch audit logs from D1
          </p>
        </div>
      )}

      {logs && logs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <CheckCircle2 className="mb-3 size-8 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">No audit logs found</p>
        </div>
      )}

      {logs && logs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Event</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">User</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Order</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 transition hover:bg-muted/30"
                >
                  <td className="px-4 py-2.5 text-foreground">
                    {String(log.event_type)}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {log.user_id ? String(log.user_id).slice(0, 8) + "..." : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {log.order_id ? String(log.order_id).slice(0, 8) + "..." : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground/70">
                    {String(log.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Analytics Panel ──────────────────────────────────────

function AnalyticsPanel() {
  const queryAnalytics = useAction(api.d1.queryAnalytics);
  const [events, setEvents] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState("");

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryAnalytics({
        eventName: eventFilter || undefined,
        limit: 50,
      });
      setEvents(result.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to query analytics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by event name..."
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="w-full rounded-lg border border-border bg-input/50 py-2 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring/20"
          />
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground transition hover:bg-accent"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Query
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      {events === null && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Activity className="mb-3 size-8 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            Click "Query" to fetch analytics events from D1
          </p>
        </div>
      )}

      {events && events.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <CheckCircle2 className="mb-3 size-8 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">No analytics events found</p>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Event</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Page</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">User</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 transition hover:bg-muted/30"
                >
                  <td className="px-4 py-2.5 text-foreground">
                    {String(ev.event_name)}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {ev.page ? String(ev.page) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {ev.user_id ? String(ev.user_id).slice(0, 8) + "..." : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground/70">
                    {String(ev.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Store Metrics Panel ──────────────────────────────────

function MetricsPanel() {
  const getMetrics = useAction(api.d1.getStoreMetrics);
  const [metrics, setMetrics] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState("");

  const handleRefresh = async () => {
    if (!storeId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getMetrics({ storeId: storeId.trim() });
      setMetrics(result.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to query metrics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Store ID..."
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-input/50 px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring/20"
        />
        <button
          onClick={handleRefresh}
          disabled={loading || !storeId.trim()}
          className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground transition hover:bg-accent disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Query
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      {metrics === null && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <BarChart3 className="mb-3 size-8 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            Enter a Store ID and click "Query" to view metrics
          </p>
        </div>
      )}

      {metrics && metrics.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <CheckCircle2 className="mb-3 size-8 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">No metrics found for this store</p>
        </div>
      )}

      {metrics && metrics.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-3 text-xs font-medium text-muted-foreground">
                {String(m.date)}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-muted-foreground/70">Orders</div>
                  <div className="text-sm font-medium text-foreground">
                    {String(m.total_orders)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground/70">Completed</div>
                  <div className="text-sm font-medium text-emerald-500">
                    {String(m.completed_orders)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground/70">Failed</div>
                  <div className="text-sm font-medium text-destructive">
                    {String(m.failed_orders)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground/70">Revenue</div>
                  <div className="text-sm font-medium text-foreground">
                    ₹{String(m.total_revenue)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Raw Query Panel ──────────────────────────────────────

function RawQueryPanel() {
  const executeQuery = useAction(api.d1.rawQuery);
  const [sql, setSql] = useState("SELECT * FROM audit_logs LIMIT 10");
  const [result, setResult] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    if (!sql.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await executeQuery({ sql: sql.trim() });
      setResult(res.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Query failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          rows={4}
          placeholder="Enter SQL query..."
          className="w-full rounded-lg border border-border bg-input/50 p-3 font-mono text-xs text-foreground placeholder-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring/20"
        />
        <button
          onClick={handleExecute}
          disabled={loading || !sql.trim()}
          className="flex items-center gap-2 rounded-lg bg-[var(--ring)] px-3 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Zap className="size-3.5" />
          )}
          Execute
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      {result !== null && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <pre className="p-4 font-mono text-[11px] text-foreground">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
