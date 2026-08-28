import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function ServerError() {
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    // Give a brief delay then reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Generate a pseudo-random correlation ID for support reference
  const correlationId = `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-background font-mono"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-warning/10 border border-warning/20">
            <AlertTriangle className="size-8 text-warning" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">500</h1>
          <p className="text-sm text-muted-foreground mb-2">Something went wrong.</p>
          <p className="text-xs text-muted-foreground/70 mb-4">
            An unexpected error occurred on our end. Our team has been notified. Please try again or contact support if the issue persists.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-3 mb-6">
            <p className="text-[10px] text-muted-foreground">
              Error ID: <span className="font-medium text-foreground">{correlationId}</span>
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
              Reference this ID when contacting support.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")} className="text-xs gap-1.5">
              <ArrowLeft className="size-3" /> Go home
            </Button>
            <Button onClick={handleRetry} disabled={retrying} className="text-xs bg-[var(--ring)] hover:bg-[var(--ring)]/90 text-white">
              <RefreshCw className={`mr-1.5 size-3 ${retrying ? "animate-spin" : ""}`} />
              {retrying ? "Retrying…" : "Retry"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
