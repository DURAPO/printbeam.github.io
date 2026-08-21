import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  FileText,
  MapPin,
  Clock,
  Zap,
  Send,
  CheckCircle2,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";

const statusConfig: Record<string, { label: string; className: string; description: string }> = {
  pending: { label: "pending", className: "bg-warning/15 text-warning border-warning/30", description: "Your job is in the queue waiting to be processed." },
  scheduled: { label: "scheduled", className: "bg-chart-3/15 text-chart-3 border-chart-3/30", description: "Your job has been scheduled for a pickup window." },
  processing: { label: "processing", className: "bg-chart-3/15 text-chart-3 border-chart-3/30", description: "Your job is currently being printed." },
  ready: { label: "ready", className: "bg-success/15 text-success border-success/30", description: "Your job is ready for pickup at the pressroom." },
  completed: { label: "completed", className: "bg-success/15 text-success border-success/30", description: "This job has been completed and picked up." },
  cancelled: { label: "cancelled", className: "bg-muted text-muted-foreground border-border", description: "This job was cancelled." },
};

export default function PrintJobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const job = useQuery(api.printJobs.get, id ? { jobId: id as Id<"printJobs"> } : "skip");
  const messages = useQuery(api.messages.listByJob, id ? { printJobId: id as Id<"printJobs"> } : "skip");
  const sendMessage = useMutation(api.messages.send);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim() || !id) return;
    setIsSending(true);
    try {
      await sendMessage({ printJobId: id as Id<"printJobs">, content: newMessage.trim() });
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (job === undefined) {
    return (
      <main className="min-h-screen bg-background font-mono">
        <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-3xl flex items-center gap-3 px-6 py-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="size-4" /></button>
            <span className="text-xs font-bold">Loading…</span>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-6 py-8"><div className="h-40 rounded-lg border border-border bg-card animate-pulse" /></div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-background font-mono">
        <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-3xl flex items-center gap-3 px-6 py-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="size-4" /></button>
            <span className="text-xs font-bold">PrintBeam</span>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <FileText className="size-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Print job not found or you don't have access.</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="mt-4 text-xs">Back to dashboard</Button>
        </div>
      </main>
    );
  }

  const sc = statusConfig[job.status] || statusConfig.pending;

  return (
    <main className="min-h-screen bg-background font-mono">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="size-4" /></button>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-success" />
              <span className="text-xs font-bold">Print Job Detail</span>
            </div>
          </div>
          <Badge variant="outline" className={`text-[10px] gap-1 ${sc.className}`}>{sc.label}</Badge>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Status banner */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
              {job.status === "ready" || job.status === "completed" ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : job.status === "cancelled" ? (
                <ArrowLeft className="size-4 text-muted-foreground" />
              ) : (
                <Clock className="size-4 text-warning" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold mb-0.5">{sc.description}</h2>
              <p className="text-[11px] text-muted-foreground">Submitted {formatDate(job.createdAt)}</p>
            </div>
          </div>
        </motion.div>

        {/* Job details grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="border-border">
            <CardHeader className="pb-3"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">File details</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              <DetailRow label="File name" value={job.fileName} />
              <DetailRow label="File size" value={formatFileSize(job.fileSize || 0)} />
              <DetailRow label="Copies" value={`${job.copies}×`} />
              <DetailRow label="Color" value={job.color ? "Yes" : "No (B&W)"} />
              <DetailRow label="Paper size" value={job.paperSize} />
              <DetailRow label="Double-sided" value={job.doubleSided ? "Yes" : "No"} />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Order details</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              <DetailRow label="Pressroom" value={job.storeName} icon={<MapPin className="size-3 text-muted-foreground" />} />
              {job.scheduledAt && <DetailRow label="Scheduled" value={formatDate(job.scheduledAt)} icon={<Calendar className="size-3 text-muted-foreground" />} />}
              <DetailRow label="Payment" value="Team balance" icon={<CreditCard className="size-3 text-muted-foreground" />} />
              <DetailRow label="Total" value={`$${(job.amount || 0).toFixed(2)}`} valueClassName="text-success font-bold" />
              {job.notes && <DetailRow label="Notes" value={job.notes} />}
            </CardContent>
          </Card>
        </div>

        {/* Messages / Comments */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {messages === undefined ? (
              <div className="space-y-3">{[1, 2].map((i) => (<div key={i} className="h-10 rounded border border-border animate-pulse" />))}</div>
            ) : (
              <>
                {messages.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No comments yet. Add a note for your team.</p>
                )}
                <div className="space-y-3 mb-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-lg border border-border p-3 ${msg.userId === user?._id ? "bg-success/[0.03] border-success/20" : "bg-card"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium">{msg.userName}</span>
                        <span className="text-[10px] text-muted-foreground">{formatDate(msg.createdAt)}</span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{msg.content}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Message input */}
                <div className="flex items-center gap-2 border-t border-border pt-3">
                  <input
                    type="text"
                    placeholder="Add a comment…"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    className="flex-1 text-xs font-mono bg-transparent border border-input rounded-md px-3 py-2 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                    disabled={isSending}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!newMessage.trim() || isSending}
                    className="bg-success hover:bg-success/90 text-white shrink-0"
                  >
                    <Send className="size-3.5" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function DetailRow({ label, value, icon, valueClassName }: { label: string; value: string; icon?: React.ReactNode; valueClassName?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-xs">
      <span className="text-muted-foreground shrink-0 flex items-center gap-1.5">{icon}{label}</span>
      <span className={`text-right truncate ${valueClassName || "text-foreground font-medium"}`}>{value}</span>
    </div>
  );
}
