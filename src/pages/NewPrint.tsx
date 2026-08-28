import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AppShell, { Container } from "@/components/layout/AppShell";
import {
  CheckCircle2,
  FileUp,
  MapPin,
  Zap,
  Loader2,
  X,
  Search,
  AlertTriangle,
  Phone,
  Copy,
  Circle,
} from "lucide-react";
import { useNavigate } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";

const BINDING_OPTIONS = [
  { value: "none" as const, label: "No binding" },
  { value: "one_pin" as const, label: "One Pin" },
  { value: "tape" as const, label: "Tape" },
  { value: "spiral" as const, label: "Spiral" },
];

const COLOR_MODES = [
  { value: "bw" as const, label: "B&W" },
  { value: "color" as const, label: "Color" },
  { value: "micro" as const, label: "Micro" },
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function countPdfPages(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const matches = text.match(/\/Type\s*\/Page[^s]/g);
      resolve(matches ? matches.length : 1);
    };
    reader.onerror = () => resolve(1);
    reader.readAsText(file);
  });
}

/* ── Section wrapper ──────────────────────────────────────── */
function Section({
  number,
  title,
  subtitle,
  active,
  completed,
  children,
}: {
  number: number;
  title: string;
  subtitle: string;
  active: boolean;
  completed: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: number * 0.06 }}
      className={`relative rounded-xl border transition-colors ${
        active
          ? "border-border bg-card"
          : completed
            ? "border-success/20 bg-success/[0.02]"
            : "border-border/40 bg-muted/20"
      }`}
    >
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-border/50">
        <div
          className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
            completed
              ? "bg-success text-white"
              : active
                ? "bg-[var(--ring)]/10 text-[var(--ring)] border border-[var(--ring)]/30"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {completed ? <CheckCircle2 className="size-4" /> : number}
        </div>
        <div className="min-w-0">
          <h3
            className={`text-sm font-semibold ${
              active || completed ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div
        className={`px-4 sm:px-5 py-4 sm:py-5 ${
          !active && !completed ? "opacity-40 pointer-events-none" : ""
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function NewPrint() {
  const navigate = useNavigate();
  const createOrder = useMutation(api.orders.create);
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [storageId, setStorageId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [selectedStoreId, setSelectedStoreId] =
    useState<Id<"stores"> | null>(null);
  const [selectedStoreName, setSelectedStoreName] = useState("");
  const [uidInput, setUidInput] = useState("");
  const [uidResult, setUidResult] = useState<{
    valid: boolean;
    error?: string;
    storeId?: Id<"stores">;
    storeName?: string;
  } | null>(null);
  const [storeMode, setStoreMode] = useState<"list" | "uid">("list");

  const [binding, setBinding] = useState<"none" | "one_pin" | "tape" | "spiral">("none");
  const [colorMode, setColorMode] = useState<"bw" | "color" | "micro">("bw");
  const [copies, setCopies] = useState(1);
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const onlineStores = useQuery(
    api.stores.listOnline,
    userLocation ? { latitude: userLocation.lat, longitude: userLocation.lng } : {}
  );

  const sortedStores = onlineStores
    ? [...onlineStores].sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      })
    : [];

  const selectedStore = sortedStores.find((s) => s._id === selectedStoreId);

  const estimatedTotal = selectedStore
    ? (() => {
        let perPage = 0;
        if (colorMode === "bw") perPage = selectedStore.rates.bwPerPage;
        else if (colorMode === "color") perPage = selectedStore.rates.colorPerPage;
        else perPage = selectedStore.rates.microPerPage;

        let bindingCost = 0;
        if (binding === "one_pin") bindingCost = selectedStore.rates.onePin;
        else if (binding === "tape") bindingCost = selectedStore.rates.tape;
        else if (binding === "spiral") bindingCost = selectedStore.rates.spiral;

        return ((perPage * pageCount * copies) + bindingCost).toFixed(2);
      })()
    : "0.00";

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setUploadError(null);
      if (selectedFile.type !== "application/pdf") {
        setUploadError("Only PDF files are accepted.");
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setUploadError("File exceeds 20 MB limit.");
        return;
      }
      setFile(selectedFile);
      setIsUploading(true);
      try {
        const pages = await countPdfPages(selectedFile);
        setPageCount(pages);
        const url = await generateUploadUrl();
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/pdf" },
          body: selectedFile,
        });
        const json = await result.json();
        setStorageId(json.storageId);
      } catch {
        setUploadError("Upload failed. Please try again.");
        setFile(null);
      } finally {
        setIsUploading(false);
      }
    },
    [generateUploadUrl]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFileSelect(dropped);
    },
    [handleFileSelect]
  );

  const handleSelectStore = (storeId: Id<"stores">, name: string) => {
    setSelectedStoreId(storeId);
    setSelectedStoreName(name);
  };

  const uidLookup = useQuery(
    api.stores.validateUid,
    uidInput.trim().length >= 6 ? { uid: uidInput.trim() } : "skip"
  );

  useEffect(() => {
    if (uidLookup) setUidResult(uidLookup);
  }, [uidLookup]);

  const handleSubmit = async () => {
    if (!selectedStoreId || !storageId || !file) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const orderId = await createOrder({
        storeId: selectedStoreId,
        fileStorageId: storageId,
        fileName: file.name,
        pageCount,
        binding,
        colorMode,
        copies,
        customerPhone,
        estimatedTotal: parseFloat(estimatedTotal),
      });
      setSubmittedOrderId(orderId);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit print request.";
      if (msg.includes("offline")) {
        setSubmitError("This store went offline. Pick another store or try again.");
      } else {
        setSubmitError(msg);
      }
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

  const formatDistance = (km: number | null) => {
    if (km === null) return "";
    if (km < 1) return `${(km * 1000).toFixed(0)}m`;
    return `${km.toFixed(1)} km`;
  };

  const resetForm = () => {
    setSubmitted(false);
    setSubmittedOrderId(null);
    setFile(null);
    setPageCount(0);
    setStorageId(null);
    setSelectedStoreId(null);
    setSelectedStoreName("");
    setBinding("none");
    setColorMode("bw");
    setCopies(1);
    setCustomerPhone("");
    setUidInput("");
    setUidResult(null);
  };

  /* ── Completed screen ──────────────────────────────────── */
  if (submitted) {
    return (
      <AppShell>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-md"
          >
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-success/10 border border-success/20">
              <CheckCircle2 className="size-8 text-success" />
            </div>
            <h1 className="text-xl font-bold mb-2">Print request submitted</h1>
            <p className="text-sm text-muted-foreground mb-1">
              Your job at{" "}
              <span className="text-foreground font-medium">{selectedStoreName}</span>{" "}
              is now in the queue.
            </p>
            {submittedOrderId && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
                <span className="text-[11px] text-muted-foreground">Order ID</span>
                <code className="text-xs font-bold text-foreground">
                  {submittedOrderId.slice(-8).toUpperCase()}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(submittedOrderId)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="size-3" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground/70 mt-3 mb-8">
              Track your order from the dashboard.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="text-xs">
                View dashboard
              </Button>
              <Button onClick={resetForm} className="text-xs gap-1.5">
                <Zap className="size-3" /> New print job
              </Button>
            </div>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  const uploadDone = !!file && !!storageId && !isUploading;
  const storeDone = !!selectedStoreId;
  const optionsDone = !!customerPhone.trim() && customerPhone.replace(/\D/g, "").length >= 7;
  const canSubmit = uploadDone && storeDone && optionsDone && !isSubmitting;

  /* ── Upload section content (shared) ────────────────────── */
  const uploadSection = (
    <Section number={1} title="Upload document" subtitle="PDF only · Max 20 MB" active={!uploadDone} completed={uploadDone}>
      {file ? (
        <div className="rounded-lg border border-border bg-background p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--ring)]/10 text-[var(--ring)] border border-[var(--ring)]/20">
              <FileUp className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[11px] text-muted-foreground">{formatFileSize(file.size)}</span>
                <span className="text-[11px] text-success font-medium">Uploaded pages: {pageCount}</span>
                {isUploading && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Loader2 className="size-3 animate-spin" /> uploading…
                  </span>
                )}
                {storageId && !isUploading && (
                  <span className="text-[11px] text-success flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> uploaded
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setStorageId(null); setUploadError(null); }} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 sm:p-10 cursor-pointer hover:border-[var(--ring)]/40 hover:bg-[var(--ring)]/[0.03] transition-all"
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-muted">
            <FileUp className="size-5 text-muted-foreground/50" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
            <p className="text-[11px] text-muted-foreground">PDF only · Max 20 MB</p>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
        </div>
      )}
      {uploadError && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
          <AlertTriangle className="size-3.5 text-destructive shrink-0" />
          <p className="text-xs text-destructive">{uploadError}</p>
        </div>
      )}
    </Section>
  );

  /* ── Store section content (shared) ─────────────────────── */
  const storeSection = (
    <Section number={2} title="Select store" subtitle={storeDone ? `Selected: ${selectedStoreName}` : "Choose an available store or enter a Store UID"} active={uploadDone && !storeDone} completed={storeDone}>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setStoreMode("list")} className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${storeMode === "list" ? "border-[var(--ring)] bg-[var(--ring)]/10 text-[var(--ring)]" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
          <MapPin className="size-3 inline mr-1.5" /> Browse stores
        </button>
        <button onClick={() => setStoreMode("uid")} className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${storeMode === "uid" ? "border-[var(--ring)] bg-[var(--ring)]/10 text-[var(--ring)]" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
          <Search className="size-3 inline mr-1.5" /> Enter Store UID
        </button>
      </div>
      {storeMode === "list" ? (
        <>
          {onlineStores === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-lg border border-border bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : sortedStores.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No stores currently available.</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {sortedStores.map((store) => (
                <button
                  key={store._id}
                  onClick={() => handleSelectStore(store._id, store.name)}
                  className={`w-full text-left rounded-lg border p-3 transition-all group ${
                    selectedStoreId === store._id
                      ? "border-[var(--ring)] bg-[var(--ring)]/5 ring-1 ring-[var(--ring)]/20"
                      : "border-border bg-background hover:border-[var(--ring)]/40 hover:bg-[var(--ring)]/[0.03]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold group-hover:text-[var(--ring)] transition-colors truncate">{store.name}</h3>
                        <Badge variant="outline" className="text-[10px] shrink-0 bg-success/10 text-success border-success/25">{store.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 shrink-0" />{store.address.street}, {store.address.city}
                        </span>
                        {store.distance !== null && <span className="text-success font-medium">{formatDistance(store.distance)}</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5 ml-4">UID: {store.uid}</p>
                    </div>
                    {selectedStoreId === store._id ? <CheckCircle2 className="size-4 text-success shrink-0 mt-1" /> : <Circle className="size-4 text-muted-foreground/30 shrink-0 mt-1" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1.5">Store UID</label>
            <div className="flex gap-2">
              <Input placeholder="e.g. CR1000007" value={uidInput} onChange={(e) => { setUidInput(e.target.value.toUpperCase()); setUidResult(null); }} className="text-xs font-mono flex-1" />
              <Button disabled={!uidInput.trim() || uidLookup === undefined || uidLookup === null} variant="outline" className="text-xs"><Search className="size-3" /></Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">2–4 letters followed by 4–14 digits</p>
          </div>
          {uidResult && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`rounded-lg border p-3 ${uidResult.valid ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
              {uidResult.valid ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success" />
                    <span className="text-xs font-medium">{uidResult.storeName}</span>
                  </div>
                  <Button size="sm" onClick={() => uidResult.storeId && handleSelectStore(uidResult.storeId, uidResult.storeName || "")} className="text-[11px] h-7">Select</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-destructive shrink-0" />
                  <span className="text-xs text-destructive">{uidResult.error}</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
      {storeDone && (
        <button onClick={() => { setSelectedStoreId(null); setSelectedStoreName(""); setUidInput(""); setUidResult(null); }} className="mt-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
          Change store
        </button>
      )}
    </Section>
  );

  /* ── Options section content (shared) ───────────────────── */
  const optionsSection = (
    <Section number={3} title="Print options" subtitle={optionsDone ? `${colorMode.toUpperCase()} · ${copies}× · ${BINDING_OPTIONS.find((b) => b.value === binding)?.label || "No binding"}` : "Configure binding, color mode, copies, and contact"} active={storeDone && !optionsDone} completed={optionsDone}>
      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium block mb-2">Binding</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BINDING_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setBinding(opt.value)} className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${binding === opt.value ? "border-[var(--ring)] bg-[var(--ring)]/10 text-[var(--ring)]" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                {opt.label}
                {selectedStore && opt.value !== "none" && (
                  <span className="block text-[10px] text-muted-foreground/70 mt-0.5">₹{selectedStore.rates[opt.value === "one_pin" ? "onePin" : opt.value]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium block mb-2">Color mode</label>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_MODES.map((opt) => (
              <button key={opt.value} onClick={() => setColorMode(opt.value)} className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${colorMode === opt.value ? "border-[var(--ring)] bg-[var(--ring)]/10 text-[var(--ring)]" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                {opt.label}
                {selectedStore && (
                  <span className="block text-[10px] text-muted-foreground/70 mt-0.5">₹{selectedStore.rates[opt.value === "bw" ? "bwPerPage" : opt.value === "color" ? "colorPerPage" : "microPerPage"]}/pg</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium block mb-2">Copies</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setCopies(Math.max(1, copies - 1))} className="size-10 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center">−</button>
            <Input type="number" min={1} max={120} value={copies} onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) setCopies(Math.min(120, Math.max(1, v))); }} className="w-20 text-center text-sm font-mono" />
            <button onClick={() => setCopies(Math.min(120, copies + 1))} className="size-10 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center">+</button>
            <span className="text-[11px] text-muted-foreground">1–120</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5">Phone number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Your contact number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="text-xs font-mono pl-9" />
          </div>
        </div>
      </div>
    </Section>
  );

  /* ── Submit section content (shared) ────────────────────── */
  const submitSection = (
    <Section number={4} title="Review & submit" subtitle={canSubmit ? `Estimated total: ₹${estimatedTotal}` : "Complete all sections above to submit"} active={canSubmit} completed={false}>
      <div className="rounded-lg border border-border bg-background p-4 space-y-2 mb-4">
        <SummaryRow label="Store" value={selectedStoreName || "—"} />
        <SummaryRow label="File" value={file?.name || "—"} />
        <SummaryRow label="Pages" value={pageCount > 0 ? `${pageCount}` : "—"} />
        <SummaryRow label="Binding" value={BINDING_OPTIONS.find((b) => b.value === binding)?.label || "None"} />
        <SummaryRow label="Color mode" value={colorMode.toUpperCase()} />
        <SummaryRow label="Copies" value={`${copies}×`} />
        <SummaryRow label="Phone" value={customerPhone || "—"} />
        <div className="border-t border-border pt-2 mt-2">
          <SummaryRow label="Estimated total" value={`₹${estimatedTotal}`} bold />
        </div>
      </div>
      {submitError && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-3.5 text-destructive shrink-0" />
            <p className="text-xs text-destructive font-medium">{submitError}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setSubmitError(null); handleSubmit(); }} disabled={isSubmitting} className="text-[11px] h-7">Retry</Button>
            <Button size="sm" variant="outline" onClick={() => { setSubmitError(null); setSelectedStoreId(null); setSelectedStoreName(""); }} className="text-[11px] h-7">Pick another store</Button>
          </div>
        </div>
      )}
      <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full text-xs gap-1.5">
        {isSubmitting ? <><Loader2 className="size-3 animate-spin" /> Submitting…</> : <><Zap className="size-3" /> Submit print request</>}
      </Button>
    </Section>
  );

  return (
    <AppShell>
      <Container className="py-6 sm:py-8">
        {/* Desktop: back link */}
        <div className="mb-6 hidden sm:block">
          <button onClick={() => navigate("/dashboard")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to dashboard
          </button>
        </div>

        {/* Mobile: single column stack */}
        <div className="space-y-4 sm:hidden">
          {uploadSection}
          {storeSection}
          {optionsSection}
          {submitSection}
        </div>

        {/* Tablet+: 2-column layout */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-6">
          {/* Left column — Upload + Store */}
          <div className="space-y-4">
            {uploadSection}
            {storeSection}
          </div>
          {/* Right column — Options + Submit */}
          <div className="space-y-4">
            {optionsSection}
            {submitSection}
          </div>
        </div>
      </Container>
    </AppShell>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right truncate ${bold ? "font-bold text-success text-sm" : "font-medium text-foreground"}`}>{value}</span>
    </div>
  );
}
