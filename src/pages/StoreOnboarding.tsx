import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Zap,
  Loader2,
  MapPin,
  Store,
} from "lucide-react";
import { useNavigate } from "react-router";

type Step = "welcome" | "info" | "rates" | "uid" | "done";

export default function StoreOnboarding() {
  const navigate = useNavigate();
  const createStore = useMutation(api.stores.createStore);

  const [step, setStep] = useState<Step>("welcome");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store info
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [road, setRoad] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [locationLoading, setLocationLoading] = useState(false);

  // Rates
  const [onePinRate, setOnePinRate] = useState(5);
  const [tapeRate, setTapeRate] = useState(10);
  const [spiralRate, setSpiralRate] = useState(20);
  const [bwRate, setBwRate] = useState(1);
  const [colorRate, setColorRate] = useState(3);
  const [microRate, setMicroRate] = useState(2);

  // UID
  const [customUid, setCustomUid] = useState("");
  const generatedUid = storeName && phone
    ? (storeName.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() +
        phone.replace(/[^0-9]/g, "").slice(-Math.max(4, 14 - storeName.replace(/[^a-zA-Z]/g, "").slice(0, 4).length)))
    : "";

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        // User denied or error — let them enter manually
      }
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createStore({
        name: storeName,
        phone,
        address: { street, road: road || undefined, area: area || undefined, city, pincode },
        latitude,
        longitude,
        rates: {
          onePin: onePinRate,
          tape: tapeRate,
          spiral: spiralRate,
          bwPerPage: bwRate,
          colorPerPage: colorRate,
          microPerPage: microRate,
        },
        customUid: customUid.trim() || undefined,
      });
      setStep("done");
    } catch (err) {
      console.error("Failed to create store:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepIndex = ["welcome", "info", "rates", "uid"].indexOf(step);

  if (step === "done") {
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
            <h1 className="text-xl font-bold mb-2">Store created</h1>
            <p className="text-sm text-muted-foreground mb-1">
              <span className="text-foreground font-medium">{storeName}</span> is
              now live and discoverable by customers.
            </p>
            <p className="text-xs text-muted-foreground/70 mb-2">
              Store UID: <code className="font-bold">{customUid || generatedUid}</code>
            </p>
            <p className="text-xs text-muted-foreground/70 mb-8">
              Set up your printers and configure your dashboard to start
              accepting print jobs.
            </p>
            <Button
              onClick={() => navigate("/store-dashboard")}
              className="text-xs bg-success hover:bg-success/90 text-white"
            >
              Open store dashboard <ArrowRight className="size-3" />
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background font-mono">
      <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                step === "welcome"
                  ? navigate("/")
                  : step === "info"
                    ? setStep("welcome")
                    : step === "rates"
                      ? setStep("info")
                      : setStep("rates")
              }
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-success" />
              <span className="text-xs font-bold">New Store</span>
            </div>
          </div>
          {step !== "welcome" && (
            <div className="flex items-center gap-1.5">
              {["info", "rates", "uid"].map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div
                    className={`size-2 rounded-full transition-colors ${
                      ["info", "rates", "uid"].indexOf(step) >= i
                        ? "bg-success"
                        : "bg-border"
                    }`}
                  />
                  {i < 2 && <div className="w-3 h-px bg-border" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Welcome */}
        {step === "welcome" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-success/10 border border-success/20">
              <Store className="size-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-3">
              Open your print store
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
              Register your store, configure printing rates, and start
              accepting print orders from customers in your area. Setup takes
              less than two minutes.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Button
                onClick={() => setStep("info")}
                className="text-xs bg-success hover:bg-success/90 text-white"
              >
                Get started <ArrowRight className="size-3" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="text-xs"
              >
                Back to home
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 1: Store Information */}
        {step === "info" && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[11px] text-success font-medium mb-1 tracking-wide">
              // step 01 · store information
            </p>
            <h2 className="text-lg font-bold mb-1">Store details</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Tell us about your store so customers can find you.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5">
                    Store name *
                  </label>
                  <Input
                    placeholder="e.g. Quick Print Hub"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5">
                    Phone number *
                  </label>
                  <Input
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1.5">
                  Street address *
                </label>
                <Input
                  placeholder="e.g. 123 Main Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5">
                    Road / Landmark
                  </label>
                  <Input
                    placeholder="Optional"
                    value={road}
                    onChange={(e) => setRoad(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5">
                    Area / Locality
                  </label>
                  <Input
                    placeholder="Optional"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5">
                    City *
                  </label>
                  <Input
                    placeholder="e.g. Bangalore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5">
                    Pincode *
                  </label>
                  <Input
                    placeholder="e.g. 560001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-medium block mb-1.5">
                  Store location
                </label>
                <Button
                  variant="outline"
                  onClick={useCurrentLocation}
                  disabled={locationLoading}
                  className="text-xs w-full"
                >
                  {locationLoading ? (
                    <Loader2 className="size-3 animate-spin mr-2" />
                  ) : (
                    <MapPin className="size-3 mr-2" />
                  )}
                  {latitude !== 0
                    ? `Location set (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
                    : "Use my current location"}
                </Button>
                {latitude === 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Allow location access or enter coordinates manually for
                    distance-based discovery.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => setStep("rates")}
                disabled={!storeName || !phone || !street || !city || !pincode}
                className="w-full text-xs bg-success hover:bg-success/90 text-white"
              >
                Continue to rates <ArrowRight className="size-3" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Printing Rates */}
        {step === "rates" && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[11px] text-success font-medium mb-1 tracking-wide">
              // step 02 · printing rates
            </p>
            <h2 className="text-lg font-bold mb-1">Configure rates</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Set your per-page and binding rates. Customers will see these
              when calculating their print estimate.
            </p>

            <Card className="border-border mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                  Binding rates (per job)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <RateRow label="One Pin" value={onePinRate} onChange={setOnePinRate} />
                <RateRow label="Tape" value={tapeRate} onChange={setTapeRate} />
                <RateRow label="Spiral" value={spiralRate} onChange={setSpiralRate} />
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                  Per-page rates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <RateRow label="B&W" value={bwRate} onChange={setBwRate} />
                <RateRow label="Color" value={colorRate} onChange={setColorRate} />
                <RateRow label="Micro" value={microRate} onChange={setMicroRate} />
              </CardContent>
            </Card>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("info")}
                className="text-xs"
              >
                <ArrowLeft className="size-3" /> Back
              </Button>
              <Button
                onClick={() => setStep("uid")}
                className="flex-1 text-xs bg-success hover:bg-success/90 text-white"
              >
                Continue to UID <ArrowRight className="size-3" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Store UID */}
        {step === "uid" && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[11px] text-success font-medium mb-1 tracking-wide">
              // step 03 · store UID
            </p>
            <h2 className="text-lg font-bold mb-1">Store UID</h2>
            <p className="text-xs text-muted-foreground mb-6">
              A unique identifier customers can use to find your store. We've
              generated one based on your store name and phone number.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium block mb-1.5">
                  Generated UID
                </label>
                <div className="rounded-lg border border-success/20 bg-success/5 px-4 py-3">
                  <code className="text-lg font-bold text-success">
                    {generatedUid}
                  </code>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  2–4 letters + 4–14 digits (e.g. "CR1000007")
                </p>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1.5">
                  Custom UID{" "}
                  <span className="text-muted-foreground/50">(optional)</span>
                </label>
                <Input
                  placeholder={generatedUid}
                  value={customUid}
                  onChange={(e) => setCustomUid(e.target.value.toUpperCase())}
                  className="text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Leave blank to use the generated UID, or enter a custom one
                  that follows the format.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("rates")}
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
                    <Loader2 className="size-3 animate-spin" /> Creating store…
                  </>
                ) : (
                  <>
                    <Zap className="size-3" /> Create store
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

function RateRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
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
