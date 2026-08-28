import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppShell, { PageHeader, Container } from "@/components/layout/AppShell";
import {
  Zap,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Loader2,
  XCircle,
  RotateCw,
} from "lucide-react";
import { useNavigate } from "react-router";

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: "pending",
    className: "bg-warning/15 text-warning border-warning/30",
    icon: Clock,
  },
  accepted: {
    label: "accepted",
    className: "bg-[var(--chart-3)]/15 text-[var(--chart-3)] border-[var(--chart-3)]/30",
    icon: CheckCircle2,
  },
  printing: {
    label: "printing",
    className: "bg-[var(--chart-3)]/15 text-[var(--chart-3)] border-[var(--chart-3)]/30",
    icon: Loader2,
  },
  done: {
    label: "done",
    className: "bg-success/15 text-success border-success/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "rejected",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    icon: XCircle,
  },
  failed: {
    label: "failed",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    icon: XCircle,
  },
  retrying: {
    label: "retrying",
    className: "bg-warning/15 text-warning border-warning/30",
    icon: RotateCw,
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const jobs = useQuery(api.printJobs.listByUser);
  const stats = useQuery(api.printJobs.stats);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AppShell>
      <Container className="py-6 sm:py-8">
        <PageHeader
          title={`Welcome${user?.name ? `, ${user.name}` : ""}`}
          subtitle="// dashboard"
          actions={
            <Button
              onClick={() => navigate("/new-print")}
              className="text-xs gap-1.5"
            >
              <Plus className="size-3.5" /> New print job
            </Button>
          }
        />

        {/* Stats grid — responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <StatCard
            label="total orders"
            value={stats?.total ?? "—"}
            icon={FileText}
          />
          <StatCard
            label="active"
            value={stats?.active ?? "—"}
            icon={Clock}
            accent="warning"
          />
          <StatCard
            label="completed"
            value={stats?.completed ?? "—"}
            icon={CheckCircle2}
            accent="success"
          />
          <StatCard
            label="printers online"
            value="—"
            icon={Zap}
            accent="info"
          />
        </div>

        {/* Orders section */}
        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Your print orders</h2>
          </div>
          <div className="p-5">
            {jobs === undefined ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-lg border border-border animate-pulse bg-muted/30"
                  />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="py-16 text-center">
                <Zap className="size-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  No print orders yet.
                </p>
                <Button
                  onClick={() => navigate("/new-print")}
                  variant="outline"
                  className="text-xs gap-1.5"
                >
                  <Plus className="size-3.5" /> Create print order
                </Button>
              </div>
            ) : (
              /* Desktop table */
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 pr-4">
                        File
                      </th>
                      <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 pr-4 hidden sm:table-cell">
                        Store
                      </th>
                      <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 pr-4 hidden md:table-cell">
                        Options
                      </th>
                      <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 pr-4">
                        Status
                      </th>
                      <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 hidden lg:table-cell">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const sc =
                        statusConfig[job.status] || statusConfig.pending;
                      const StatusIcon = sc.icon;
                      return (
                        <tr
                          key={job._id}
                          className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => navigate(`/print/${job._id}`)}
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <FileText className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="text-xs font-medium truncate max-w-[180px]">
                                {job.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-xs text-muted-foreground hidden sm:table-cell">
                            <span className="truncate max-w-[140px] block">
                              {job.storeName}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-[11px] text-muted-foreground hidden md:table-cell">
                            {job.copies}× · {job.colorMode.toUpperCase()} ·{" "}
                            {job.binding === "none" ? "no binding" : job.binding}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant="outline"
                              className={`text-[10px] gap-1 ${sc.className}`}
                            >
                              <StatusIcon
                                className={`size-2.5 ${
                                  job.status === "printing" ||
                                  job.status === "retrying"
                                    ? "animate-spin"
                                    : ""
                                }`}
                              />
                              {sc.label}
                            </Badge>
                          </td>
                          <td className="py-3 text-[11px] text-muted-foreground hidden lg:table-cell">
                            {formatDate(job.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Container>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "success" | "warning" | "info";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className={`size-7 rounded-lg flex items-center justify-center ${
            accent === "success"
              ? "bg-success/15 text-success"
              : accent === "warning"
                ? "bg-warning/15 text-warning"
                : accent === "info"
                  ? "bg-[var(--ring)]/15 text-[var(--ring)]"
                  : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="size-3.5" />
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
