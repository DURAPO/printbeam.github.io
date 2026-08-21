import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileUp,
  MapPin,
  Zap,
  Loader2,
  X,
  Calendar,
  Clock,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";

type Step = "store" | "details" | "schedule" | "checkout" | "confirm";

interface PrintDetails {
  fileName: string;
  fileSize: number;
  copies: number;
  color: boolean;
  paperSize: string;
  doubleSided: boolean;
  notes: string;
}

const paperSizes = ["Letter (8.5×11)", "Legal (8.5×14)", "A4", "A3", "Tabloid"];

const timeSlots = [
  "ASAP (next available)",
  "Today 10:00 AM",
  "Today 12:00 PM",
  "Today 2:00 PM",
  "Today 4:00 PM",
  "Tomorrow 9:00 AM",
  "Tomorrow 12:00 PM",
  "Tomorrow 3:00 PM",
];

const ratePerCopy: Record<string, { bw: number; color: number }> = {
  "Letter (8.5×11)": { bw: 0.05, color: 0.15 },
  "Legal (8.5×14)": { bw: 0.08, color: 0.2 },
  A4: { bw: 0.05, color: 0.15 },
  A3: { bw: 0.12, color: 0.3 },
  Tabloid: { bw: 0.15, color: 0.45 },
};

export default function NewPrint() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stores = useQuery(api.stores.list);
  const createJob = useMutation(api.printJobs.create);
  const seedStores = useMutation(api.stores.seed);

  const [step, setStep] = useState<Step>("store");
  const [selectedStoreId, setSelectedStoreId] = useState<Id<"stores"> | null>(null);
  const [selectedStoreName, setSelectedStoreName] = useState("");
  const [details, setDetails] = useState<PrintDetails>({
    fileName: "",
    fileSize: 0,
    copies: 1,
    color: false,
    paperSize: "Letter (8.5×11)",
    doubleSided: false,
    notes: "",
  });
  const [scheduledSlot, setScheduledSlot] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"team-balance" | "card">("team-balance");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (stores && stores.length === 0) {
      seedStores();
    }
  }, [stores, seedStores]);

  const estimatedAmount = useMemo(() => {
    const rates = ratePerCopy[details.paperSize] || ratePerCopy["Letter (8.5×11)"];
    const perCopy = details.color ? rates.color : rates.bw;
    const base = perCopy * details.copies;
    const duplexDiscount = details.doubleSided ? 0.85 : 1;
    return Math.round(base * duplexDiscount * 100) / 100;
  }, [details.copies, details.color, details.paperSize, details.doubleSided]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDetails((prev) => ({ ...prev, fileName: file.name, fileSize: file.size }));
    }
  };

  const handleSelectStore = (storeId: Id<"stores">, storeName: string) => {
    setSelectedStoreId(storeId);
    setSelectedStoreName(storeName);
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!selectedStoreId) return;
    setIsSubmitting(true);
    try {
      await createJob({
        storeId: selectedStoreId,
        storeName: selectedStoreName,
        fileName: details.fileName,
        fileSize: details.fileSize || undefined,
        copies: details.copies,
        color: details.color,
        paperSize: details.paperSize,
        doubleSided: details.doubleSided,
        notes: details.notes || undefined,
        amount: estimatedAmount,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit print job:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const resetForm = () => {
    setSubmitted(false);
    setStep("store");
    setSelectedStoreId(null);
    setSelectedStoreName("");
    setDetails({ fileName: "", fileSize: 0, copies: 1, color: false, paperSize: "Letter (8.5×11)", doubleSided: false, notes: "" });
    setScheduledSlot(null);
    setPaymentMethod("team-balance");
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-background font-mono">
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-success/10 border border-success/20">
              <CheckCircle2 className="size-8 text-success" />
            </div>
            <h1 className="text-xl font-bold mb-2">Print job submitted</h1>
            <p className="text-sm text-muted-foreground mb-1">
              Your job at <span className="text-foreground font-medium">{selectedStoreName}</span> is now in the queue.
            </p>
            <p className="text-xs text-muted-foreground/70 mb-8">
              Status updates will appear on your dashboard. Estimated cost:{" "}
              <span className="text-foreground font-medium">{formatCurrency(estimatedAmount)}</span>
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="text-xs">View dashboard</Button>
              <Button onClick={resetForm} className="text-xs bg-success hover:bg-success/90 text-white">New print job</Button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  const stepIndex = ["store", "details", "schedule", "checkout", "confirm"].indexOf(step);

  return (
    <main className="min-h-screen bg-background font-mono">
      <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-success" />
              <span className="text-xs font-bold">New Print Job</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {["store", "details", "schedule", "checkout", "confirm"].map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`size-2 rounded-full transition-colors ${i <= stepIndex ? "bg-success" : "bg-border"}`} />
                {i < 4 && <div className="w-3 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {step === "store" && (
          <motion.div key="store" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <p className="text-[11px] text-success font-medium mb-1 tracking-wide">// step 01 · select pressroom</p>
            <h2 className="text-lg font-bold mb-1">Pick a pressroom</h2>
            <p className="text-xs text-muted-foreground mb-6">Choose where to send your print job.</p>
            {stores === undefined ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-20 rounded-lg border border-border bg-card animate-pulse" />))}</div>
            ) : stores.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Setting up pressrooms… one moment.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {stores.map((store) => (
                  <button key={store._id} onClick={() => handleSelectStore(store._id, store.name)} className="w-full text-left rounded-lg border border-border bg-card p-4 hover:border-success/40 hover:bg-success/[0.03] transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold group-hover:text-success transition-colors truncate">{store.name}</h3>
                          <Badge variant="outline" className={`text-[10px] shrink-0 ${store.status === "open" ? "bg-success/10 text-success border-success/25" : store.status === "busy" ? "bg-warning/10 text-warning border-warning/25" : "text-muted-foreground"}`}>{store.status}</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">{store.address}, {store.city}</span>
                        </div>
                        {store.hours && <p className="text-[11px] text-muted-foreground/60 mt-1 ml-4">{store.hours}</p>}
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-success transition-colors shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {step === "details" && (
          <motion.div key="details" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <button onClick={() => setStep("store")} className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1">
              <ArrowLeft className="size-3" /> back to pressrooms
            </button>
            <p className="text-[11px] text-success font-medium mb-1 tracking-wide">// step 02 · print settings</p>
            <h2 className="text-lg font-bold mb-1">Print details</h2>
            <p className="text-xs text-muted-foreground mb-1">Destination: <span className="text-foreground font-medium">{selectedStoreName}</span></p>
            <div className="space-y-5 mt-6">
              <div>
                <label className="text-xs font-medium block mb-2">File</label>
                {details.fileName ? (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <FileUp className="size-4 text-success shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{details.fileName}</p>
                      <p className="text-[11px] text-muted-foreground">{formatFileSize(details.fileSize)}</p>
                    </div>
                    <button onClick={() => setDetails((p) => ({ ...p, fileName: "", fileSize: 0 }))} className="text-muted-foreground hover:text-foreground transition-colors"><X className="size-4" /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:border-success/40 hover:bg-success/[0.03] transition-all">
                    <FileUp className="size-6 text-muted-foreground/40" />
                    <span className="text-xs text-muted-foreground">Click to upload PDF, image, or document</span>
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt" onChange={handleFileSelect} />
                  </label>
                )}
              </div>
              {!details.fileName && (
                <div>
                  <label className="text-xs font-medium block mb-1.5">Or enter file name</label>
                  <Input placeholder="e.g. Q4-report.pdf" value={details.fileName} onChange={(e) => setDetails((p) => ({ ...p, fileName: e.target.value }))} className="text-xs font-mono" />
                </div>
              )}
              <div>
                <label className="text-xs font-medium block mb-1.5">Copies</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDetails((p) => ({ ...p, copies: Math.max(1, p.copies - 1) }))} className="size-8 rounded border border-border bg-card text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center">−</button>
                  <span className="w-8 text-center text-sm font-medium">{details.copies}</span>
                  <button onClick={() => setDetails((p) => ({ ...p, copies: Math.min(99, p.copies + 1) }))} className="size-8 rounded border border-border bg-card text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center">+</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5">Color</label>
                  <div className="flex gap-2">
                    {[false, true].map((val) => (
                      <button key={String(val)} onClick={() => setDetails((p) => ({ ...p, color: val }))} className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${details.color === val ? "border-success bg-success/10 text-success" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>{val ? "Color" : "B&W"}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5">Double-sided</label>
                  <div className="flex gap-2">
                    {[false, true].map((val) => (
                      <button key={String(val)} onClick={() => setDetails((p) => ({ ...p, doubleSided: val }))} className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${details.doubleSided === val ? "border-success bg-success/10 text-success" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>{val ? "Yes" : "No"}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5">Paper size</label>
                <div className="flex flex-wrap gap-2">
                  {paperSizes.map((size) => (
                    <button key={size} onClick={() => setDetails((p) => ({ ...p, paperSize: size }))} className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${details.paperSize === size ? "border-success bg-success/10 text-success" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>{size}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5">Notes <span className="text-muted-foreground/50">(optional)</span></label>
                <textarea placeholder="Any special instructions…" value={details.notes} onChange={(e) => setDetails((p) => ({ ...p, notes: e.target.value }))} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none min-h-[72px] resize-none" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStep("store")} className="text-xs"><ArrowLeft className="size-3" /> Back</Button>
              <Button onClick={() => setStep("schedule")} disabled={!details.fileName} className="flex-1 text-xs bg-success hover:bg-success/90 text-white">Schedule pickup <ArrowRight className="size-3" /></Button>
            </div>
          </motion.div>
        )}

        {step === "schedule" && (
          <motion.div key="schedule" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <button onClick={() => setStep("details")} className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1">
              <ArrowLeft className="size-3" /> back to details
            </button>
            <p className="text-[11px] text-success font-medium mb-1 tracking-wide">// step 03 · scheduling</p>
            <h2 className="text-lg font-bold mb-1">Schedule pickup</h2>
            <p className="text-xs text-muted-foreground mb-6">Choose a pickup window or go with the next available slot.</p>
            <div className="space-y-2">
              {timeSlots.map((slot) => (
                <button key={slot} onClick={() => setScheduledSlot(slot)} className={`w-full text-left rounded-lg border p-3 text-xs font-medium transition-all flex items-center gap-3 ${scheduledSlot === slot ? "border-success bg-success/10 text-success" : "border-border bg-card text-foreground hover:border-success/30 hover:bg-success/[0.03]"}`}>
                  {slot.startsWith("ASAP") ? <Zap className="size-4 shrink-0" /> : slot.includes("Tomorrow") ? <Calendar className="size-4 shrink-0" /> : <Clock className="size-4 shrink-0" />}
                  {slot}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStep("details")} className="text-xs"><ArrowLeft className="size-3" /> Back</Button>
              <Button onClick={() => setStep("checkout")} disabled={!scheduledSlot} className="flex-1 text-xs bg-success hover:bg-success/90 text-white">Continue to checkout <ArrowRight className="size-3" /></Button>
            </div>
          </motion.div>
        )}

        {step === "checkout" && (
          <motion.div key="checkout" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <button onClick={() => setStep("schedule")} className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1">
              <ArrowLeft className="size-3" /> back to scheduling
            </button>
            <p className="text-[11px] text-success font-medium mb-1 tracking-wide">// step 04 · payment</p>
            <h2 className="text-lg font-bold mb-1">Checkout</h2>
            <p className="text-xs text-muted-foreground mb-6">Review the cost and select a payment method.</p>
            <Card className="border-border mb-6">
              <CardContent className="p-4 space-y-3">
                <Row label="File" value={details.fileName} />
                <Row label="Copies" value={`${details.copies}×`} />
                <Row label="Mode" value={`${details.color ? "Color" : "B&W"} · ${details.doubleSided ? "Duplex" : "Simplex"}`} />
                <Row label="Paper" value={details.paperSize} />
                <Row label="Pickup" value={scheduledSlot || "ASAP"} />
                <div className="border-t border-border pt-3 flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Estimated total</span>
                  <span className="text-lg font-bold text-success">{formatCurrency(estimatedAmount)}</span>
                </div>
              </CardContent>
            </Card>
            <p className="text-xs font-medium mb-3">Payment method</p>
            <div className="space-y-2 mb-6">
              {([["team-balance", "Team balance", null] as const, ["card", "Credit card", CreditCard] as const]).map(([key, label, Icon]) => (
                <button key={key} onClick={() => setPaymentMethod(key)} className={`w-full text-left rounded-lg border p-3 text-xs font-medium transition-all flex items-center gap-3 ${paymentMethod === key ? "border-success bg-success/10 text-success" : "border-border bg-card text-foreground hover:border-success/30"}`}>
                  <div className="size-4 rounded-full border-2 border-current flex items-center justify-center">
                    {paymentMethod === key && <div className="size-2 rounded-full bg-current" />}
                  </div>
                  {Icon && <Icon className="size-4" />}
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("schedule")} className="text-xs"><ArrowLeft className="size-3" /> Back</Button>
              <Button onClick={() => setStep("confirm")} className="flex-1 text-xs bg-success hover:bg-success/90 text-white">Review order <ArrowRight className="size-3" /></Button>
            </div>
          </motion.div>
        )}

        {step === "confirm" && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <button onClick={() => setStep("checkout")} className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1">
              <ArrowLeft className="size-3" /> back to checkout
            </button>
            <p className="text-[11px] text-success font-medium mb-1 tracking-wide">// step 05 · review & submit</p>
            <h2 className="text-lg font-bold mb-1">Confirm your order</h2>
            <p className="text-xs text-muted-foreground mb-6">Everything look good? Submit to queue your print job.</p>
            <Card className="border-border">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Order summary</CardTitle></CardHeader>
              <CardContent className="space-y-2.5">
                <Row label="Pressroom" value={selectedStoreName} />
                <Row label="File" value={details.fileName} />
                {details.fileSize > 0 && <Row label="Size" value={formatFileSize(details.fileSize)} />}
                <Row label="Copies" value={`${details.copies}×`} />
                <Row label="Color" value={details.color ? "Yes" : "No (B&W)"} />
                <Row label="Paper" value={details.paperSize} />
                <Row label="Double-sided" value={details.doubleSided ? "Yes" : "No"} />
                <Row label="Pickup" value={scheduledSlot || "ASAP"} />
                <Row label="Payment" value={paymentMethod === "team-balance" ? "Team balance" : "Credit card"} />
                {details.notes && <Row label="Notes" value={details.notes} />}
                <div className="border-t border-border pt-3 mt-3 flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="text-base font-bold text-success">{formatCurrency(estimatedAmount)}</span>
                </div>
              </CardContent>
            </Card>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStep("checkout")} className="text-xs"><ArrowLeft className="size-3" /> Back</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 text-xs bg-success hover:bg-success/90 text-white">
                {isSubmitting ? <><Loader2 className="size-3 animate-spin" /> Submitting…</> : <><Zap className="size-3" /> Submit print job</>}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground font-medium text-right truncate">{value}</span>
    </div>
  );
}
