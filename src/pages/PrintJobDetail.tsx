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
  XCircle,
  RotateCw,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";

const TIMELINE_STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "accepted", label: "Accepted", icon: CheckCircle2 },
  { key: "printing", label: "Printing", icon: Loader2 },
  { key: "done", label: "Done", icon: CheckCircle2 },
];

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: "pending",
    className: "bg-warning/15 text-warning border-warning/30",
    description: "Your order is in the queue waiting to be accepted.",
    icon: Clock,
  },
  accepted: {
    label: "accepted",
    className: "bg-chart-3/15 text-chart-3 border-chart-3/30",
    description: "Your order has been accepted and is waiting to be printed.",
    icon: CheckCircle2,
  },
  printing: {
    label: "printing",
    className: "bg-chart-3/15 text-chart-3 border-chart-3/30",
    description: "Your order is currently being printed.",
    icon: Loader2,
  },
  done: {
    label: "done",
    className: "bg-success/15 text-success border-success/30",
    description: "Your order is complete and ready for pickup.",
    icon: CheckCircle2,
  },
  rejected: {
    label: "rejected",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    description: "Your order was rejected by the store.",
    icon: XCircle,
  },
  failed: {
    label: "failed",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    description: "The print job failed. Contact the store for details.",
    icon: XCircle,
  },
  retrying: {
    label: "retrying",
    className: "bg-warning/15 text-warning border-warning/30",
    description: "The store is retrying your print job.",
    icon: RotateCw,
  },
};

export default function PrintJobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const job = useQuery(
    api.printJobs.get,
    id ? { orderId: id as Id<"orders"> } : "skip"
  );
  const timeline = useQuery(
    api.orders.getTimeline,
    id ? { orderId: id as Id<"orders"> } : "skip"
  );
  const messages = useQuery(
    api.messages.listByOrder,
    id ? { orderId: id as Id<"orders"> } : "skip"
  );
  const sendMessage = useMutation(api.messages.send);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim() || !id) return;
    setIsSending(true);
    try {
      await sendMessage({
        orderId: id as Id<"orders">,
        content: newMessage.trim(),
      });
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

  if (job === undefined) {
    return (
      <main className="min-h-screen bg-background font-mono">
        <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-3xl flex items-center gap-3 px-6 py-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <span className="text-xs font-bold">Loading…</span>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="h-40 rounded-lg border border-border bg-card animate-pulse" />
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-background font-mono">
        <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-3xl flex items-center gap-3 px-6 py-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <span className="text-xs font-bold">PrintBeam</span>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <FileText className="size-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Order not found or you don't have access.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="mt-4 text-xs"
          >
            Back to dashboard
          </Button>
        </div>
      </main>
    );
  }

  const sc = statusConfig[job.status] || statusConfig.pending;
  const StatusIcon = sc.icon;

  // Find current step in timeline
  const currentStepIndex = TIMELINE_STEPS.findIndex(
    (s) => s.key === job.status
  );
  const isTerminal =
    job.status === "rejected" || job.status === "failed" || job.status === "done";

  return (
    <main className="min-h-screen bg-background font-mono">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-success" />
              <span className="text-xs font-bold">Order Detail</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] gap-1 ${sc.className}`}
          >
            <StatusIcon
              className={`size-2.5 ${
                job.status === "printing" || job.status === "retrying"
                  ? "animate-spin"
                  : ""
              }`}
            />
            {sc.label}
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Status banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-start gap-3">
            <div
              className={`size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                job.status === "done"
                  ? "bg-success/10"
                  : job.status === "rejected" || job.status === "failed"
                    ? "bg-destructive/10"
                    : "bg-warning/10"
              }`}
            >
              <StatusIcon
                className={`size-4 ${
                  job.status === "done"
                    ? "text-success"
                    : job.status === "rejected" || job.status === "failed"
                      ? "text-destructive"
                      : "text-warning"
                } ${job.status === "printing" || job.status === "retrying" ? "animate-spin" : ""}`}
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold mb-0.5">
                {sc.description}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Submitted {formatDate(job.createdAt)}
                {job.acceptedAt && ` · Accepted ${formatDate(job.acceptedAt)}`}
                {job.doneAt && ` · Completed ${formatDate(job.doneAt)}`}
                {job.retryCount > 0 &&
                  ` · Retry #${job.retryCount}`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Timeline Progress */}
        <div className="mb-6">
          <p className="text-[11px] text-success font-medium mb-3 tracking-wide">
            // order timeline
          </p>
          <div className="flex items-center gap-0">
            {TIMELINE_STEPS.map((step, i) => {
              const isActive =
                currentStepIndex >= 0 && i <= currentStepIndex;
              const isCurrent = step.key === job.status;
              const StepIcon = step.icon;
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center border transition-colors ${
                        isActive
                          ? "bg-success/15 border-success/30 text-success"
                          : "bg-muted border-border text-muted-foreground"
                      } ${isCurrent ? "ring-2 ring-success/20" : ""}`}
                    >
                      <StepIcon
                        className={`size-3.5 ${
                          isCurrent &&
                          (job.status === "printing" || job.status === "retrying")
                            ? "animate-spin"
                            : ""
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] mt-1 ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-1 ${
                        i < currentStepIndex ? "bg-success/40" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {/* Terminal states */}
          {(job.status === "rejected" || job.status === "failed") && (
            <div className="mt-3 flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-[10px] gap-1 ${sc.className}`}
              >
                <StatusIcon className="size-2.5" />
                {sc.label}
              </Badge>
            </div>
          )}
        </div>

        {/* Job details grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                File details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <DetailRow label="File name" value={job.fileName} />
              <DetailRow label="Pages" value={`${job.pageCount}`} />
              <DetailRow label="Copies" value={`${job.copies}×`} />
              <DetailRow
                label="Color mode"
                value={job.colorMode.toUpperCase()}
              />
              <DetailRow
                label="Binding"
                value={
                  job.binding === "none"
                    ? "None"
                    : job.binding === "one_pin"
                      ? "One Pin"
                      : job.binding === "tape"
                        ? "Tape"
                        : "Spiral"
                }
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Order details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <DetailRow
                label="Store"
                value={job.storeName}
                icon={<MapPin className="size-3 text-muted-foreground" />}
              />
              <DetailRow label="Phone" value={job.customerPhone} />
              <DetailRow
                label="Estimated total"
                value={`₹${job.estimatedTotal.toFixed(2)}`}
              />
              <DetailRow label="Order ID" value={job._id.slice(-8).toUpperCase()} />
            </CardContent>
          </Card>
        </div>

        {/* Timeline log */}
        {timeline && timeline.length > 0 && (
          <Card className="border-border mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Status history</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeline.map((entry) => {
                  const ec =
                    statusConfig[entry.status] || statusConfig.pending;
                  const EntryIcon = ec.icon;
                  return (
                    <div
                      key={entry._id}
                      className="flex items-start gap-3"
                    >
                      <div className="size-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <EntryIcon className="size-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">
                            {ec.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(entry.createdAt)}
                          </span>
                        </div>
                        {entry.message && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {entry.message}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages / Comments */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {messages === undefined ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded border border-border animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No comments yet. Add a note for the store.
                  </p>
                )}
                <div className="space-y-3 mb-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-lg border border-border p-3 ${
                        msg.userId === user?._id?.toString()
                          ? "bg-success/[0.03] border-success/20"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium">
                          {msg.userName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">
                        {msg.content}
                      </p>
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
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

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-xs">
      <span className="text-muted-foreground shrink-0 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-foreground font-medium text-right truncate">
        {value}
      </span>
    </div>
  );
}
