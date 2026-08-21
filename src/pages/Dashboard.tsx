import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Zap,
  Plus,
  LogOut,
  FileText,
  Clock,
  CheckCircle2,
  Loader2,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router";

const statusConfig: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "pending", className: "bg-warning/15 text-warning border-warning/30", icon: Clock },
  scheduled: { label: "scheduled", className: "bg-chart-3/15 text-chart-3 border-chart-3/30", icon: Clock },
  processing: { label: "processing", className: "bg-chart-3/15 text-chart-3 border-chart-3/30", icon: Loader2 },
  ready: { label: "ready", className: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  completed: { label: "completed", className: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  cancelled: { label: "cancelled", className: "bg-muted text-muted-foreground border-border", icon: FileText },
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const jobs = useQuery(api.printJobs.listByUser);
  const stats = useQuery(api.printJobs.stats);
  const cancelJob = useMutation(api.printJobs.cancel);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCancel = async (jobId: string) => {
    try {
      await cancelJob({ jobId: jobId as never });
    } catch (err) {
      console.error("Failed to cancel:", err);
    }
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const totalSpent = jobs?.reduce((sum, j) => sum + (j.amount || 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-background font-mono">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-success/10 text-success border border-success/20">
              <Zap className="size-3.5" />
            </div>
            <span className="text-xs font-bold tracking-tight">PrintBeam</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground hidden sm:block">{user?.name || user?.email || "user"}</span>
            <Button variant="ghost" size="icon-sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] text-success font-medium mb-0.5 tracking-wide">// dashboard</p>
              <h1 className="text-lg font-bold">Welcome{user?.name ? `, ${user.name}` : ""}</h1>
            </div>
            <Button onClick={() => navigate("/new-print")} className="text-xs bg-success hover:bg-success/90 text-white gap-1.5">
              <Plus className="size-3.5" /> New print job
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="total jobs" value={stats?.total ?? "—"} icon={FileText} />
            <StatCard label="in progress" value={stats?.pending ?? "—"} icon={Clock} accent="warning" />
            <StatCard label="completed" value={stats?.completed ?? "—"} icon={CheckCircle2} accent="success" />
            <StatCard label="total spent" value={totalSpent > 0 ? `$${totalSpent.toFixed(2)}` : "—"} icon={DollarSign} accent="success" />
          </div>
        </div>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent print jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {jobs === undefined ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-12 rounded border border-border animate-pulse" />))}</div>
            ) : jobs.length === 0 ? (
              <div className="py-12 text-center">
                <Zap className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground mb-4">No print jobs yet. Submit your first one.</p>
                <Button onClick={() => navigate("/new-print")} variant="outline" className="text-xs gap-1.5"><Plus className="size-3.5" /> Create print job</Button>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-[11px] text-muted-foreground">File</TableHead>
                        <TableHead className="text-[11px] text-muted-foreground">Pressroom</TableHead>
                        <TableHead className="text-[11px] text-muted-foreground">Options</TableHead>
                        <TableHead className="text-[11px] text-muted-foreground">Amount</TableHead>
                        <TableHead className="text-[11px] text-muted-foreground">Status</TableHead>
                        <TableHead className="text-[11px] text-muted-foreground">Date</TableHead>
                        <TableHead className="text-[11px] text-muted-foreground text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => {
                        const sc = statusConfig[job.status];
                        const StatusIcon = sc.icon;
                        return (
                          <TableRow key={job._id} className="border-border cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/print/${job._id}`)}>
                            <TableCell className="text-xs font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="size-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[160px]">{job.fileName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground"><span className="truncate max-w-[130px] block">{job.storeName}</span></TableCell>
                            <TableCell className="text-[11px] text-muted-foreground">{job.copies}× · {job.color ? "color" : "B&W"} · {job.paperSize.split(" ")[0]}</TableCell>
                            <TableCell className="text-xs font-medium text-success">{job.amount > 0 ? `$${job.amount.toFixed(2)}` : "—"}</TableCell>
                            <TableCell><Badge variant="outline" className={`text-[10px] gap-1 ${sc.className}`}><StatusIcon className={`size-2.5 ${job.status === "processing" ? "animate-spin" : ""}`} />{sc.label}</Badge></TableCell>
                            <TableCell className="text-[11px] text-muted-foreground">{formatDate(job.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              {(job.status === "pending" || job.status === "scheduled" || job.status === "processing") && (
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleCancel(job._id); }} className="text-[11px] text-destructive hover:text-destructive h-7">Cancel</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-3">
                  {jobs.map((job) => {
                    const sc = statusConfig[job.status];
                    const StatusIcon = sc.icon;
                    return (
                      <div key={job._id} className="rounded-lg border border-border bg-background p-3 cursor-pointer" onClick={() => navigate(`/print/${job._id}`)}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="size-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs font-medium truncate">{job.fileName}</span>
                          </div>
                          <Badge variant="outline" className={`text-[10px] gap-1 shrink-0 ml-2 ${sc.className}`}><StatusIcon className={`size-2.5 ${job.status === "processing" ? "animate-spin" : ""}`} />{sc.label}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-1">{job.storeName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground/70">{job.copies}× · {job.color ? "color" : "B&W"} · {formatDate(job.createdAt)}</span>
                          <span className="text-[10px] font-medium text-success">{job.amount > 0 ? `$${job.amount.toFixed(2)}` : ""}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; accent?: "success" | "warning" }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <div className={`size-6 rounded flex items-center justify-center ${accent === "success" ? "bg-success/15 text-success" : accent === "warning" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"}`}>
          <Icon className="size-3" />
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
