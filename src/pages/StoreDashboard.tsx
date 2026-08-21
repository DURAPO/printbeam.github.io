import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  XCircle,
  RotateCw,
  Power,
  Printer,
  Store,
  Settings,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";

type Tab = "queue" | "history" | "printers" | "profile" | "integrations";

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
    className: "bg-chart-3/15 text-chart-3 border-chart-3/30",
    icon: CheckCircle2,
  },
  printing: {
    label: "printing",
    className: "bg-chart-3/15 text-chart-3 border-chart-3/30",
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

export default function StoreDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const stores = useQuery(api.stores.listByOwner);
  const store = stores?.[0];

  const toggleOnline = useMutation(api.stores.toggleOnline);
  const toggleAutoAccept = useMutation(api.stores.toggleAutoAccept);

  const [activeTab, setActiveTab] = useState<Tab>("queue");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleToggleOnline = async () => {
    if (!store) return;
    await toggleOnline({ storeId: store._id });
  };

  const handleToggleAutoAccept = async () => {
    if (!store) return;
    await toggleAutoAccept({ storeId: store._id });
  };

  // No store — redirect to onboarding (in effect, not render)
  useEffect(() => {
    if (stores !== undefined && stores.length === 0) {
      navigate("/store-onboarding", { replace: true });
    }
  }, [stores, navigate]);

  if (!store) {
    return (
      <main className="min-h-screen bg-background font-mono flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background font-mono">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-md bg-success/10 text-success border border-success/20">
                <Zap className="size-3.5" />
              </div>
              <span className="text-xs font-bold tracking-tight">
                PrintBeam
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground hidden sm:block">
              {store.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Online/Offline Toggle */}
            <button
              onClick={handleToggleOnline}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-all ${
                store.status === "online"
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              <Power className="size-3" />
              {store.status === "online" ? "Online" : "Offline"}
            </button>
            <span className="text-[11px] text-muted-foreground hidden sm:block">
              {user?.name || user?.email}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Tab navigation */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto">
          {(
            [
              { key: "queue", label: "Live Queue", icon: Clock },
              { key: "history", label: "History", icon: FileText },
              { key: "printers", label: "Printers", icon: Printer },
              { key: "profile", label: "Profile & Rates", icon: Store },
              { key: "integrations", label: "Integrations", icon: Settings },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-success/10 text-success border border-success/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className="size-3" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "queue" && (
            <LiveQueue key="queue" storeId={store._id} />
          )}
          {activeTab === "history" && (
            <PrintingHistory key="history" storeId={store._id} />
          )}
          {activeTab === "printers" && (
            <PrinterManager key="printers" storeId={store._id} />
          )}
          {activeTab === "profile" && (
            <StoreProfile key="profile" store={store} />
          )}
          {activeTab === "integrations" && (
            <Integrations key="integrations" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Live Queue ──────────────────────────────────────────────────────── */

function LiveQueue({ storeId }: { storeId: Id<"stores"> }) {
  const pendingOrders = useQuery(api.orders.listByStoreAndStatus, {
    storeId,
    status: "pending",
  });
  const acceptedOrders = useQuery(api.orders.listByStoreAndStatus, {
    storeId,
    status: "accepted",
  });
  const printingOrders = useQuery(api.orders.listByStoreAndStatus, {
    storeId,
    status: "printing",
  });
  const retryingOrders = useQuery(api.orders.listByStoreAndStatus, {
    storeId,
    status: "retrying",
  });

  const acceptOrder = useMutation(api.orders.accept);
  const rejectOrder = useMutation(api.orders.reject);
  const startPrinting = useMutation(api.orders.startPrinting);
  const markDone = useMutation(api.orders.markDone);
  const markFailed = useMutation(api.orders.markFailed);

  const printers = useQuery(api.printers.listOnlineByStore, { storeId });

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const allQueue = [
    ...(pendingOrders || []).map((o) => ({ ...o, queueStatus: "pending" as const })),
    ...(acceptedOrders || []).map((o) => ({ ...o, queueStatus: "accepted" as const })),
    ...(printingOrders || []).map((o) => ({ ...o, queueStatus: "printing" as const })),
    ...(retryingOrders || []).map((o) => ({ ...o, queueStatus: "retrying" as const })),
  ].sort((a, b) => a.createdAt - b.createdAt);

  const isLoading =
    pendingOrders === undefined ||
    acceptedOrders === undefined ||
    printingOrders === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] text-success font-medium mb-0.5 tracking-wide">
            // live queue
          </p>
          <h2 className="text-lg font-bold">
            Active orders ({allQueue.length})
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-lg border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : allQueue.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <Clock className="size-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-xs text-muted-foreground">
              No active orders in the queue.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {allQueue.map((order) => {
            const sc = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{order.fileName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {order.pageCount} pages · {order.copies}× ·{" "}
                        {order.colorMode.toUpperCase()} ·{" "}
                        {order.binding === "none"
                          ? "no binding"
                          : order.binding}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] gap-1 ${sc.className}`}
                  >
                    <StatusIcon
                      className={`size-2.5 ${
                        order.status === "printing" ||
                        order.status === "retrying"
                          ? "animate-spin"
                          : ""
                      }`}
                    />
                    {sc.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
                  <span>
                    ₹{order.estimatedTotal.toFixed(2)} · {order.customerPhone}
                  </span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>

                {/* Actions based on status */}
                <div className="flex items-center gap-2 flex-wrap">
                  {order.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={async () => {
                          await acceptOrder({ orderId: order._id });
                        }}
                        className="text-[11px] bg-success hover:bg-success/90 text-white h-7"
                      >
                        <CheckCircle2 className="size-3 mr-1" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await rejectOrder({ orderId: order._id });
                        }}
                        className="text-[11px] text-destructive hover:text-destructive h-7"
                      >
                        <XCircle className="size-3 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {order.status === "accepted" && (
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (printers && printers.length > 0) {
                          await startPrinting({
                            orderId: order._id,
                            printerId: printers[0]._id,
                          });
                        }
                      }}
                      disabled={!printers || printers.length === 0}
                      className="text-[11px] bg-success hover:bg-success/90 text-white h-7"
                    >
                      <Printer className="size-3 mr-1" /> Start printing
                    </Button>
                  )}
                  {order.status === "printing" && (
                    <Button
                      size="sm"
                      onClick={async () => {
                        await markDone({ orderId: order._id });
                      }}
                      className="text-[11px] bg-success hover:bg-success/90 text-white h-7"
                    >
                      <CheckCircle2 className="size-3 mr-1" /> Mark done
                    </Button>
                  )}
                  {order.status === "retrying" && (
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (printers && printers.length > 0) {
                          await startPrinting({
                            orderId: order._id,
                            printerId: printers[0]._id,
                          });
                        }
                      }}
                      disabled={!printers || printers.length === 0}
                      className="text-[11px] bg-success hover:bg-success/90 text-white h-7"
                    >
                      <RotateCw className="size-3 mr-1" /> Retry printing
                    </Button>
                  )}
                  {(order.status === "printing" || order.status === "accepted" || order.status === "retrying") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await markFailed({ orderId: order._id });
                      }}
                      className="text-[11px] text-destructive hover:text-destructive h-7"
                    >
                      Mark failed
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ── Printing History ─────────────────────────────────────────────────── */

function PrintingHistory({ storeId }: { storeId: Id<"stores"> }) {
  const doneOrders = useQuery(api.orders.listByStoreAndStatus, {
    storeId,
    status: "done",
  });
  const rejectedOrders = useQuery(api.orders.listByStoreAndStatus, {
    storeId,
    status: "rejected",
  });
  const failedOrders = useQuery(api.orders.listByStoreAndStatus, {
    storeId,
    status: "failed",
  });
  const navigate = useNavigate();

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const allHistory = [
    ...(doneOrders || []).map((o) => ({ ...o, historyStatus: "done" as const })),
    ...(rejectedOrders || []).map((o) => ({
      ...o,
      historyStatus: "rejected" as const,
    })),
    ...(failedOrders || []).map((o) => ({
      ...o,
      historyStatus: "failed" as const,
    })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  const isLoading =
    doneOrders === undefined ||
    rejectedOrders === undefined ||
    failedOrders === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <p className="text-[11px] text-success font-medium mb-0.5 tracking-wide">
        // printing history
      </p>
      <h2 className="text-lg font-bold mb-4">
        Completed & past orders ({allHistory.length})
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : allHistory.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <FileText className="size-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-xs text-muted-foreground">
              No completed orders yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-[11px] text-muted-foreground">
                    File
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">
                    Options
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">
                    Total
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allHistory.map((order) => {
                  const sc = statusConfig[order.historyStatus] || statusConfig.done;
                  const StatusIcon = sc.icon;
                  return (
                    <TableRow
                      key={order._id}
                      className="border-border cursor-pointer hover:bg-muted/30"
                      onClick={() => navigate(`/print/${order._id}`)}
                    >
                      <TableCell className="text-xs font-medium">
                        {order.fileName}
                      </TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">
                        {order.copies}× · {order.colorMode.toUpperCase()}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        ₹{order.estimatedTotal.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] gap-1 ${sc.className}`}
                        >
                          <StatusIcon className="size-2.5" />
                          {sc.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden space-y-3">
            {allHistory.map((order) => {
              const sc = statusConfig[order.historyStatus] || statusConfig.done;
              const StatusIcon = sc.icon;
              return (
                <div
                  key={order._id}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-xs font-medium">{order.fileName}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] gap-1 ${sc.className}`}
                    >
                      <StatusIcon className="size-2.5" />
                      {sc.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {order.copies}× · ₹{order.estimatedTotal.toFixed(2)}
                    </span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}

/* ── Printer Manager ─────────────────────────────────────────────────── */

function PrinterManager({ storeId }: { storeId: Id<"stores"> }) {
  const printers = useQuery(api.printers.listByStore, { storeId });
  const addPrinter = useMutation(api.printers.add);
  const removePrinter = useMutation(api.printers.remove);
  const togglePrinterStatus = useMutation(api.printers.toggleStatus);

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"color" | "bw" | "micro">("bw");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setIsAdding(true);
    try {
      await addPrinter({ storeId, name: newName.trim(), type: newType });
      setNewName("");
    } catch (err) {
      console.error("Failed to add printer:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const counts = printers
    ? {
        color: printers.filter((p) => p.type === "color").length,
        bw: printers.filter((p) => p.type === "bw").length,
        micro: printers.filter((p) => p.type === "micro").length,
      }
    : { color: 0, bw: 0, micro: 0 };

  const limits = { color: 6, bw: 7, micro: 5 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <p className="text-[11px] text-success font-medium mb-0.5 tracking-wide">
        // printer manager
      </p>
      <h2 className="text-lg font-bold mb-4">Manage printers</h2>

      {/* Counts */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(["color", "bw", "micro"] as const).map((type) => (
          <div
            key={type}
            className="rounded-lg border border-border bg-card p-3"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              {type.toUpperCase()}
            </p>
            <p className="text-lg font-bold">
              {counts[type]}{" "}
              <span className="text-xs text-muted-foreground font-normal">
                / {limits[type]}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Add printer */}
      <Card className="border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Add printer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Printer name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-xs font-mono flex-1"
            />
            <div className="flex gap-1">
              {(["color", "bw", "micro"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setNewType(type)}
                  className={`rounded-md border px-3 py-2 text-[11px] font-medium transition-colors ${
                    newType === type
                      ? "border-success bg-success/10 text-success"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
            <Button
              onClick={handleAdd}
              disabled={!newName.trim() || isAdding}
              size="sm"
              className="bg-success hover:bg-success/90 text-white text-[11px] h-9"
            >
              <Plus className="size-3 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Printer list */}
      {printers === undefined ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : printers.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-8 text-center">
            <Printer className="size-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-xs text-muted-foreground">
              No printers configured yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {printers.map((printer) => (
            <div
              key={printer._id}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`size-2 rounded-full ${
                    printer.status === "online"
                      ? "bg-success"
                      : printer.status === "error"
                        ? "bg-destructive"
                        : "bg-muted-foreground"
                  }`}
                />
                <div>
                  <p className="text-xs font-medium">{printer.name}</p>
                  <p className="text-[11px] text-muted-foreground uppercase">
                    {printer.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePrinterStatus({ printerId: printer._id })}
                  className="text-[11px] h-7"
                >
                  {printer.status === "online" ? "Disable" : "Enable"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removePrinter({ printerId: printer._id })}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Store Profile & Rates ───────────────────────────────────────────── */

function StoreProfile({ store }: { store: any }) {
  const updateStore = useMutation(api.stores.updateStore);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(store.name);
  const [phone, setPhone] = useState(store.phone);
  const [street, setStreet] = useState(store.address.street);
  const [road, setRoad] = useState(store.address.road || "");
  const [area, setArea] = useState(store.address.area || "");
  const [city, setCity] = useState(store.address.city);
  const [pincode, setPincode] = useState(store.address.pincode);
  const [customUid, setCustomUid] = useState(store.uid);

  const [onePinRate, setOnePinRate] = useState(store.rates.onePin);
  const [tapeRate, setTapeRate] = useState(store.rates.tape);
  const [spiralRate, setSpiralRate] = useState(store.rates.spiral);
  const [bwRate, setBwRate] = useState(store.rates.bwPerPage);
  const [colorRate, setColorRate] = useState(store.rates.colorPerPage);
  const [microRate, setMicroRate] = useState(store.rates.microPerPage);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateStore({
        storeId: store._id,
        name,
        phone,
        address: {
          street,
          road: road || undefined,
          area: area || undefined,
          city,
          pincode,
        },
        customUid: customUid.trim() !== store.uid ? customUid.trim() : undefined,
        rates: {
          onePin: onePinRate,
          tape: tapeRate,
          spiral: spiralRate,
          bwPerPage: bwRate,
          colorPerPage: colorRate,
          microPerPage: microRate,
        },
      });
    } catch (err) {
      console.error("Failed to update store:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <p className="text-[11px] text-success font-medium mb-0.5 tracking-wide">
        // store profile & rates
      </p>
      <h2 className="text-lg font-bold mb-4">Store settings</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Store Info */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Store information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">
                Store name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">
                Phone
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">
                Street
              </label>
              <Input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Road
                </label>
                <Input
                  value={road}
                  onChange={(e) => setRoad(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Area
                </label>
                <Input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  City
                </label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Pincode
                </label>
                <Input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">
                Store UID
              </label>
              <Input
                value={customUid}
                onChange={(e) => setCustomUid(e.target.value.toUpperCase())}
                className="text-xs font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rates */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Printing rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProfileRateRow label="One Pin binding" value={onePinRate} onChange={setOnePinRate} />
            <ProfileRateRow label="Tape binding" value={tapeRate} onChange={setTapeRate} />
            <ProfileRateRow label="Spiral binding" value={spiralRate} onChange={setSpiralRate} />
            <div className="border-t border-border pt-3 mt-3">
              <ProfileRateRow label="B&W per page" value={bwRate} onChange={setBwRate} />
              <ProfileRateRow label="Color per page" value={colorRate} onChange={setColorRate} />
              <ProfileRateRow label="Micro per page" value={microRate} onChange={setMicroRate} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="text-xs bg-success hover:bg-success/90 text-white"
        >
          {isSaving ? (
            <Loader2 className="size-3 animate-spin mr-2" />
          ) : null}
          Save changes
        </Button>
      </div>
    </motion.div>
  );
}

function ProfileRateRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">₹</span>
        <Input
          type="number"
          min={0}
          step={0.5}
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v >= 0) onChange(v);
          }}
          className="w-20 text-center text-xs font-mono"
        />
      </div>
    </div>
  );
}

/* ── Integrations ────────────────────────────────────────────────────── */

function Integrations() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <p className="text-[11px] text-success font-medium mb-0.5 tracking-wide">
        // integrations
      </p>
      <h2 className="text-lg font-bold mb-4">Connected services</h2>

      <div className="space-y-3">
        <Card className="border-border">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-md bg-success/10 flex items-center justify-center text-success border border-success/20">
                <MessageSquare className="size-4" />
              </div>
              <div>
                <p className="text-xs font-medium">WhatsApp</p>
                <p className="text-[11px] text-muted-foreground">
                  Send order notifications to customers
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-[11px] h-7">
              Connect
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground border border-border">
                <Store className="size-4" />
              </div>
              <div>
                <p className="text-xs font-medium">Instagram</p>
                <p className="text-[11px] text-muted-foreground">
                  Optional — link your store's Instagram profile
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-[11px] h-7">
              Connect
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
