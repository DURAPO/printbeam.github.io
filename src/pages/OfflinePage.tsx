import { motion } from "framer-motion";
import { Zap, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-redirect when back online
  useEffect(() => {
    if (isOnline) {
      window.location.reload();
    }
  }, [isOnline]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-background font-mono"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted border border-border">
            <WifiOff className="size-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2">You're offline</h1>
          <p className="text-sm text-muted-foreground mb-3">
            It looks like you've lost your internet connection. PrintBeam requires an active connection to process orders and sync data.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4 mb-6 text-left">
            <div className="space-y-2 text-xs text-muted-foreground font-mono">
              <p><span className="text-success">$</span> printbeam connectivity</p>
              <p className="pl-3">▸ status: <span className="text-destructive">disconnected</span></p>
              <p className="pl-3">▸ network: <span className="text-foreground">unavailable</span></p>
              <p className="pl-3">▸ action: <span className="text-foreground">waiting for reconnection</span></p>
            </div>
          </div>
          <Button onClick={() => window.location.reload()} className="text-xs bg-[var(--ring)] hover:bg-[var(--ring)]/90 text-white gap-1.5">
            <RefreshCw className="size-3" /> Reconnect
          </Button>
        </div>
      </div>
      <div className="py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
          <Zap className="size-3" /><span className="font-semibold">PrintBeam</span>
        </div>
      </div>
    </motion.div>
  );
}
