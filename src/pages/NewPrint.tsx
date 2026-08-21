import { useState, useEffect } from "react";
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
  Printer,
  Loader2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";

type Step = "store" | "details" | "confirm";

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

export default function NewPrint() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stores = useQuery(api.stores.list);
  const createJob = useMutation(api.printJobs.create);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const seedStores = useMutation(api.stores.seed);

  // Auto-seed stores on first load
  useEffect(() => {
    if (stores && stores.length === 0) {
      seedStores();
    }
  }, [stores, seedStores]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDetails((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
      }));
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
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to create print job:", err);
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

  // Success screen
  if (submitted) {
    return (
      <main className="min-h-screen bg-background font-mono">
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="size-7 text-success" />
            </div>
            <h1 className="text-xl font-bold mb-2">Print job submitted!</h1>
            <p className="text-sm text-muted-foreground mb-1">
              Your job at <span className="text-foreground font-medium">{selectedStoreName}</span> is now pending.
            </p>
            <p className="text-xs text-muted-foreground mb-8">
              We'll notify you when it's ready for pickup.
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
                onClick={() => {
                  setSubmitted(false);
                  setStep("store");
                  setSelectedStoreId(null);
                  setSelectedStoreName("");
                  setDetails({
                    fileName: "",
                    fileSize: 0,
                    copies: 1,
                    color: false,
                    paperSize: "Letter (8.5×11)",
                    doubleSided: false,
                    notes: "",
                  });
                }}
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

  const stepIndex = step === "store" ? 0 : step === "details" ? 1 : 2;

  return (
    <main className="min-h-screen bg-background font-mono">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <Printer className="size-4 text-success" />
              <span className="text-xs font-bold">new_print_job</span>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {["store", "details", "confirm"].map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className={`size-2 rounded-full transition-colors ${
                    i <= stepIndex
                      ? "bg-success"
                      : "bg-border"
                  }`}
                />
                {i < 2 && <div className="w-4 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Step: Pick Store */}
        {step === "store" && (
          <motion.div
            key="store"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs text-success font-medium mb-1">// step 01</p>
            <h2 className="text-lg font-bold mb-1">Pick a print store</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Choose a nearby store to send your print job to.
            </p>

            {stores === undefined ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-lg border border-border bg-card animate-pulse" />
                ))}
              </div>
            ) : stores.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No stores available yet. Check back soon.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {stores.map((store) => (
                  <button
                    key={store._id}
                    onClick={() => handleSelectStore(store._id, store.name)}
                    className="w-full text-left rounded-lg border border-border bg-card p-4 hover:border-success/50 hover:bg-success/5 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold group-hover:text-success transition-colors truncate">
                            {store.name}
                          </h3>
                          <Badge
                            variant={
                              store.status === "open"
                                ? "default"
                                : store.status === "busy"
                                ? "secondary"
                                : "outline"
                            }
                            className={`text-[10px] shrink-0 ${
                              store.status === "open"
                                ? "bg-success/15 text-success border-success/30 hover:bg-success/15"
                                : store.status === "busy"
                                ? "bg-warning/15 text-warning border-warning/30 hover:bg-warning/15"
                                : "text-muted-foreground"
                            }`}
                          >
                            {store.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">
                            {store.address}, {store.city}
                          </span>
                        </div>
                        {store.hours && (
                          <p className="text-[11px] text-muted-foreground/70 mt-1 ml-4">
                            {store.hours}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-success transition-colors shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step: Print Details */}
        {step === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setStep("store")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1"
            >
              <ArrowLeft className="size-3" />
              back to stores
            </button>
            <p className="text-xs text-success font-medium mb-1">// step 02</p>
            <h2 className="text-lg font-bold mb-1">Print details</h2>
            <p className="text-xs text-muted-foreground mb-1">
              Sending to: <span className="text-foreground font-medium">{selectedStoreName}</span>
            </p>

            <div className="space-y-5 mt-6">
              {/* File upload */}
              <div>
                <label className="text-xs font-medium block mb-2">File</label>
                {details.fileName ? (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <FileUp className="size-4 text-success shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{details.fileName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatFileSize(details.fileSize)}
                      </p>
                    </div>
                    <button
                      onClick={() => setDetails((p) => ({ ...p, fileName: "", fileSize: 0 }))}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:border-success/50 hover:bg-success/5 transition-colors">
                    <FileUp className="size-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Click to upload PDF, image, or document
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                    />
                  </label>
                )}
              </div>

              {/* File name manual entry fallback */}
              {!details.fileName && (
                <div>
                  <label className="text-xs font-medium block mb-1.5">
                    Or enter file name
                  </label>
                  <Input
                    placeholder="e.g. resume_final.pdf"
                    value={details.fileName}
                    onChange={(e) =>
                      setDetails((p) => ({ ...p, fileName: e.target.value }))
                    }
                    className="text-xs font-mono"
                  />
                </div>
              )}

              {/* Copies */}
              <div>
                <label className="text-xs font-medium block mb-1.5">Copies</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setDetails((p) => ({
                        ...p,
                        copies: Math.max(1, p.copies - 1),
                      }))
                    }
                    className="size-8 rounded border border-border bg-card text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {details.copies}
                  </span>
                  <button
                    onClick={() =>
                      setDetails((p) => ({
                        ...p,
                        copies: Math.min(99, p.copies + 1),
                      }))
                    }
                    className="size-8 rounded border border-border bg-card text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Color & Double-sided */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5">Color</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDetails((p) => ({ ...p, color: false }))}
                      className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                        !details.color
                          ? "border-success bg-success/10 text-success"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      B&W
                    </button>
                    <button
                      onClick={() => setDetails((p) => ({ ...p, color: true }))}
                      className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                        details.color
                          ? "border-success bg-success/10 text-success"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Color
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5">Double-sided</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDetails((p) => ({ ...p, doubleSided: false }))}
                      className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                        !details.doubleSided
                          ? "border-success bg-success/10 text-success"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      No
                    </button>
                    <button
                      onClick={() => setDetails((p) => ({ ...p, doubleSided: true }))}
                      className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                        details.doubleSided
                          ? "border-success bg-success/10 text-success"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>

              {/* Paper size */}
              <div>
                <label className="text-xs font-medium block mb-1.5">Paper size</label>
                <div className="flex flex-wrap gap-2">
                  {paperSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setDetails((p) => ({ ...p, paperSize: size }))}
                      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                        details.paperSize === size
                          ? "border-success bg-success/10 text-success"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium block mb-1.5">
                  Notes <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <textarea
                  placeholder="Any special instructions..."
                  value={details.notes}
                  onChange={(e) =>
                    setDetails((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none min-h-[72px] resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("store")}
                className="text-xs"
              >
                <ArrowLeft className="size-3" />
                Back
              </Button>
              <Button
                onClick={() => setStep("confirm")}
                disabled={!details.fileName}
                className="flex-1 text-xs bg-success hover:bg-success/90 text-white"
              >
                Review order
                <ArrowRight className="size-3" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setStep("details")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1"
            >
              <ArrowLeft className="size-3" />
              back to details
            </button>
            <p className="text-xs text-success font-medium mb-1">// step 03</p>
            <h2 className="text-lg font-bold mb-1">Confirm your order</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Review everything before submitting.
            </p>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Row label="Store" value={selectedStoreName} />
                <Row label="File" value={details.fileName} />
                {details.fileSize > 0 && (
                  <Row label="Size" value={formatFileSize(details.fileSize)} />
                )}
                <Row label="Copies" value={String(details.copies)} />
                <Row label="Color" value={details.color ? "Yes" : "No (B&W)"} />
                <Row label="Paper" value={details.paperSize} />
                <Row label="Double-sided" value={details.doubleSided ? "Yes" : "No"} />
                {details.notes && <Row label="Notes" value={details.notes} />}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex items-center gap-2 text-xs text-success">
                    <CheckCircle2 className="size-3.5" />
                    <span>Ready to submit</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("details")}
                className="text-xs"
              >
                <ArrowLeft className="size-3" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 text-xs bg-success hover:bg-success/90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit print job
                    <ArrowRight className="size-3" />
                  </>
                )}
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


