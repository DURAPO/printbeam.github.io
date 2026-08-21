import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  Search,
  AlertTriangle,
  Phone,
  Copy,
} from "lucide-react";
import { useNavigate } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";

type Step = "upload" | "store" | "options" | "confirm";

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

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

function countPdfPages(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Simple regex count of /Type /Page (not /Pages)
      const matches = text.match(/\/Type\s*\/Page[^s]/g);
      resolve(matches ? matches.length : 1);
    };
    reader.onerror = () => resolve(1);
    // Read as text to find page count markers
    reader.readAsText(file);
  });
}

export default function NewPrint() {
  const navigate = useNavigate();
  const onlineStores = useQuery(api.stores.listOnline, {});
  const createOrder = useMutation(api.orders.create);
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
  const confirmStore = useQuery(
    api.stores.confirmStore,
    // @ts-expect-error Id type mismatch workaround
    {}
  );

  const [step, setStep] = useState<Step>("upload");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [storageId, setStorageId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store state
  const [selectedStoreId, setSelectedStoreId] = useState<Id<"stores"> | null>(null);
  const [selectedStoreName, setSelectedStoreName] = useState("");
  const [uidInput, setUidInput] = useState("");
  const [uidResult, setUidResult] = useState<{
    valid: boolean;
    error?: string;
    storeId?: Id<"stores">;
    storeName?: string;
  } | null>(null);
  const [storeMode, setStoreMode] = useState<"list" | "uid">("list");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Options state
  const [binding, setBinding] = useState<"none" | "one_pin" | "tape" | "spiral">("none");
  const [colorMode, setColorMode] = useState<"bw" | "color" | "micro">("bw");
  const [copies, setCopies] = useState(1);
  const [customerPhone, setCustomerPhone] = useState("");

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Location not available, proceed without distance
        }
      );
    }
  }, []);

  // Sort stores by distance
  const sortedStores = onlineStores
    ? [...onlineStores].sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      })
    : [];

  // Get selected store rates for live calculation
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

        return ((perPage * pageCount + bindingCost) * copies).toFixed(2);
      })()
    : "0.00";

  const handleFileSelect = useCallback(async (selectedFile: File) => {
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
      // Count pages client-side
      const pages = await countPdfPages(selectedFile);
      setPageCount(pages);

      // Upload to Convex storage
      const url = await generateUploadUrl();
      const result = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/pdf" },
        body: selectedFile,
      });
      const json = await result.json();
      setStorageId(json.storageId);
    } catch (err) {
      setUploadError("Upload failed. Please try again.");
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  }, [generateUploadUrl]);

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
    setStep("options");
  };

  const handleUidLookup = async () => {
    if (!uidInput.trim()) return;
    // This would use a query, but since we don't have the validateUid wired up
    // with the frontend properly, we'll find the store from the list
    const match = sortedStores.find(
      (s) => s.uid.toUpperCase() === uidInput.trim().toUpperCase()
    );
    if (!match) {
      setUidResult({ valid: false, error: "Store not found or offline" });
    } else if (match.status !== "online") {
      setUidResult({ valid: false, error: "Store is currently offline" });
    } else {
      setUidResult({
        valid: true,
        storeId: match._id,
        storeName: match.name,
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedStoreId || !storageId || !file) return;
    setIsSubmitting(true);
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
    } catch (err) {
      console.error("Failed to submit order:", err);
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
    setStep("upload");
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

  if (submitted) {
    return (
      <main className="min-h-screen bg-background font-mono">
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-success/10 border border-success/20">
              <CheckCircle2 className="size-8 text-success" />
            </div>
            <h1 className="text-xl font-bold mb-2">Print request submitted</h1>
            <p className="text-sm text-muted-foreground mb-1">
              Your job at{" "}
              <span className="text-foreground font-medium">
                {selectedStoreName}
              </span>{" "}
              is now in the queue.
            </p>
            {submittedOrderId && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
                <span className="text-[11px] text-muted-foreground">
                  Order ID
                </span>
                <code className="text-xs font-bold text-foreground">
                  {submittedOrderId.slice(-8).toUpperCase()}
                </code>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(submittedOrderId)
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="size-3" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground/70 mt-3 mb-8">
              Track your order from the dashboard. You'll see real-time status
              updates.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="text-xs"
              >
                View dashboard
              </Button>
              <Button
                onClick={resetForm}
                className="text-xs bg-success hover:bg-success/90 text-white"
              >
                New print job
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  const stepIndex = ["upload", "store", "options", "confirm"].indexOf(step);

  return (
    <main className="min-h-screen bg-background font-mono">
      <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                step === "upload" ? navigate("/dashboard") : setStep(step === "store" ? "upload" : step === "options" ? "store" : "options")
              }
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-success" />
              <span className="text-xs font-bold">New Print Job</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {["upload", "store", "options", "confirm"].map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className={`size-2 rounded-full transition-colors ${
                    i <= stepIndex ? "bg-success" : "bg-border"
                  }`}
                />
                {i < 3 && <div className="w-3 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-[11px] text-success font-medium mb-1 tracking-wide">
                // step 01 · upload document
              </p>
              <h2 className="text-lg font-bold mb-1">Upload your PDF</h2>
              <p className="text-xs text-muted-foreground mb-6">
                Select the file you want to print. Only PDF files up to 20 MB
                are accepted.
              </p>

              {file ? (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-success/10 text-success border border-success/20">
                      <FileUp className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-[11px] text-success font-medium">
                          {pageCount} page{pageCount !== 1 ? "s" : ""}
                        </span>
                        {isUploading && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Loader2 className="size-3 animate-spin" />
                            uploading…
                          </span>
                        )}
                        {storageId && !isUploading && (
                          <span className="text-[11px] text-success flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            uploaded
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFile(null);
                        setPageCount(0);
                        setStorageId(null);
                        setUploadError(null);
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-12 cursor-pointer hover:border-success/40 hover:bg-success/[0.03] transition-all"
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <FileUp className="size-6 text-muted-foreground/50" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      PDF only · Max 20 MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                </div>
              )}

              {uploadError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
                  <AlertTriangle className="size-3.5 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">{uploadError}</p>
                </div>
              )}

              <div className="mt-6">
                <Button
                  onClick={() => setStep("store")}
                  disabled={!file || !storageId || isUploading}
                  className="w-full text-xs bg-success hover:bg-success/90 text-white"
                >
                  Continue to store selection <ArrowRight className="size-3" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Store Selection */}
          {step === "store" && (
            <motion.div
              key="store"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-[11px] text-success font-medium mb-1 tracking-wide">
                // step 02 · select store
              </p>
              <h2 className="text-lg font-bold mb-1">Pick a store</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Choose an available store or enter a Store UID manually.
              </p>

              {/* Toggle: List vs UID */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setStoreMode("list")}
                  className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                    storeMode === "list"
                      ? "border-success bg-success/10 text-success"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <MapPin className="size-3 inline mr-1.5" />
                  Browse stores
                </button>
                <button
                  onClick={() => setStoreMode("uid")}
                  className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                    storeMode === "uid"
                      ? "border-success bg-success/10 text-success"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Search className="size-3 inline mr-1.5" />
                  Enter Store UID
                </button>
              </div>

              {storeMode === "list" ? (
                <>
                  {onlineStores === undefined ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-20 rounded-lg border border-border bg-card animate-pulse"
                        />
                      ))}
                    </div>
                  ) : sortedStores.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-sm text-muted-foreground">
                        No stores currently available. Try again later.
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {sortedStores.map((store) => (
                        <button
                          key={store._id}
                          onClick={() =>
                            handleSelectStore(store._id, store.name)
                          }
                          className="w-full text-left rounded-lg border border-border bg-card p-4 hover:border-success/40 hover:bg-success/[0.03] transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-semibold group-hover:text-success transition-colors truncate">
                                  {store.name}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] shrink-0 ${
                                    store.status === "online"
                                      ? "bg-success/10 text-success border-success/25"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {store.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="size-3 shrink-0" />
                                  {store.address.street}, {store.address.city}
                                </span>
                                {store.distance !== null && (
                                  <span className="text-success font-medium">
                                    {formatDistance(store.distance)}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground/60 mt-1 ml-4">
                                UID: {store.uid}
                              </p>
                            </div>
                            <ArrowRight className="size-4 text-muted-foreground group-hover:text-success transition-colors shrink-0 mt-1" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* UID Entry Mode */
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium block mb-1.5">
                      Store UID
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. CR1000007"
                        value={uidInput}
                        onChange={(e) => {
                          setUidInput(e.target.value.toUpperCase());
                          setUidResult(null);
                        }}
                        className="text-xs font-mono flex-1"
                      />
                      <Button
                        onClick={handleUidLookup}
                        disabled={!uidInput.trim()}
                        variant="outline"
                        className="text-xs"
                      >
                        <Search className="size-3" />
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      2–4 letters followed by 4–14 digits (e.g. "CR1000007")
                    </p>
                  </div>

                  {uidResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-lg border p-3 ${
                        uidResult.valid
                          ? "border-success/30 bg-success/5"
                          : "border-destructive/30 bg-destructive/5"
                      }`}
                    >
                      {uidResult.valid ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-success" />
                            <span className="text-xs font-medium">
                              {uidResult.storeName}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              uidResult.storeId &&
                              handleSelectStore(
                                uidResult.storeId,
                                uidResult.storeName || ""
                              )
                            }
                            className="text-[11px] bg-success hover:bg-success/90 text-white h-7"
                          >
                            Select
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="size-4 text-destructive shrink-0" />
                          <span className="text-xs text-destructive">
                            {uidResult.error}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep("upload")}
                  className="text-xs"
                >
                  <ArrowLeft className="size-3" /> Back
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Print Options */}
          {step === "options" && (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setStep("store")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1"
              >
                <ArrowLeft className="size-3" /> back to stores
              </button>
              <p className="text-[11px] text-success font-medium mb-1 tracking-wide">
                // step 03 · print options
              </p>
              <h2 className="text-lg font-bold mb-1">Print settings</h2>
              <p className="text-xs text-muted-foreground mb-6">
                Store:{" "}
                <span className="text-foreground font-medium">
                  {selectedStoreName}
                </span>
              </p>

              <div className="space-y-6">
                {/* Binding */}
                <div>
                  <label className="text-xs font-medium block mb-2">
                    Binding
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BINDING_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setBinding(opt.value)}
                        className={`rounded-md border px-3 py-2.5 text-xs font-medium transition-colors ${
                          binding === opt.value
                            ? "border-success bg-success/10 text-success"
                            : "border-border bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {opt.label}
                        {selectedStore && opt.value !== "none" && (
                          <span className="block text-[10px] text-muted-foreground/70 mt-0.5">
                            ₹{selectedStore.rates[opt.value === "one_pin" ? "onePin" : opt.value]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Mode */}
                <div>
                  <label className="text-xs font-medium block mb-2">
                    Color mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_MODES.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setColorMode(opt.value)}
                        className={`rounded-md border px-3 py-2.5 text-xs font-medium transition-colors ${
                          colorMode === opt.value
                            ? "border-success bg-success/10 text-success"
                            : "border-border bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {opt.label}
                        {selectedStore && (
                          <span className="block text-[10px] text-muted-foreground/70 mt-0.5">
                            ₹{selectedStore.rates[opt.value === "bw" ? "bwPerPage" : opt.value === "color" ? "colorPerPage" : "microPerPage"]}/pg
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Copies */}
                <div>
                  <label className="text-xs font-medium block mb-2">
                    Copies
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCopies(Math.max(1, copies - 1))}
                      className="size-9 rounded border border-border bg-card text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center"
                    >
                      −
                    </button>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      value={copies}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        if (!isNaN(v)) setCopies(Math.min(120, Math.max(1, v)));
                      }}
                      className="w-20 text-center text-sm font-mono"
                    />
                    <button
                      onClick={() => setCopies(Math.min(120, copies + 1))}
                      className="size-9 rounded border border-border bg-card text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-[11px] text-muted-foreground">
                      1–120
                    </span>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-xs font-medium block mb-1.5">
                    Phone number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Your contact number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="text-xs font-mono pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Live Estimate */}
              {selectedStore && pageCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-lg border border-success/20 bg-success/5 p-4"
                >
                  <p className="text-[11px] text-success font-medium mb-2 tracking-wide">
                    // estimate
                  </p>
                  <div className="space-y-1.5">
                    <EstRow label="Pages" value={`${pageCount}`} />
                    <EstRow label="Copies" value={`${copies}`} />
                    <EstRow label="Color mode" value={colorMode.toUpperCase()} />
                    <EstRow
                      label="Binding"
                      value={BINDING_OPTIONS.find((b) => b.value === binding)?.label || "None"}
                    />
                    <EstRow label="Store" value={selectedStore.name} />
                    <div className="border-t border-success/20 pt-1.5 mt-1.5">
                      <EstRow
                        label="Estimated total"
                        value={`₹${estimatedTotal}`}
                        bold
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("store")}
                  className="text-xs"
                >
                  <ArrowLeft className="size-3" /> Back
                </Button>
                <Button
                  onClick={() => setStep("confirm")}
                  disabled={!customerPhone.trim()}
                  className="flex-1 text-xs bg-success hover:bg-success/90 text-white"
                >
                  Review order <ArrowRight className="size-3" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setStep("options")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1"
              >
                <ArrowLeft className="size-3" /> back to options
              </button>
              <p className="text-[11px] text-success font-medium mb-1 tracking-wide">
                // step 04 · review & submit
              </p>
              <h2 className="text-lg font-bold mb-1">Confirm your order</h2>
              <p className="text-xs text-muted-foreground mb-6">
                Review everything below, then submit to queue your print job.
              </p>

              <Card className="border-border mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Order summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <Row label="Store" value={selectedStoreName} />
                  <Row label="File" value={file?.name || "—"} />
                  <Row label="Pages" value={`${pageCount}`} />
                  <Row
                    label="Binding"
                    value={
                      BINDING_OPTIONS.find((b) => b.value === binding)
                        ?.label || "None"
                    }
                  />
                  <Row label="Color mode" value={colorMode.toUpperCase()} />
                  <Row label="Copies" value={`${copies}×`} />
                  <Row label="Phone" value={customerPhone} />
                  <div className="border-t border-border pt-2.5 mt-2.5">
                    <Row
                      label="Estimated total"
                      value={`₹${estimatedTotal}`}
                      bold
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("options")}
                  className="text-xs"
                >
                  <ArrowLeft className="size-3" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 text-xs bg-success hover:bg-success/90 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3 animate-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      <Zap className="size-3" /> Submit print request
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-right truncate ${
          bold ? "font-bold text-success text-sm" : "font-medium text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function EstRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-xs">
      <span className="text-success/70 shrink-0">{label}</span>
      <span
        className={`text-right truncate ${
          bold
            ? "font-bold text-success text-sm"
            : "font-medium text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
