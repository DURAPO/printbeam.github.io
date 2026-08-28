import { motion } from "framer-motion";
import { Zap, Wrench } from "lucide-react";

export default function Maintenance() {
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
            <Wrench className="size-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Scheduled Maintenance</h1>
          <p className="text-sm text-muted-foreground mb-3">
            PrintBeam is currently undergoing scheduled maintenance. We'll be back online shortly.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4 mb-6 text-left">
            <div className="space-y-2 text-xs text-muted-foreground font-mono">
              <p><span className="text-success">$</span> printbeam status</p>
              <p className="pl-3">▸ status: <span className="text-warning">maintenance</span></p>
              <p className="pl-3">▸ estimated return: <span className="text-foreground">checking…</span></p>
              <p className="pl-3">▸ affected services: <span className="text-foreground">all</span></p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/70">
            For urgent matters, contact support@printbeam.com
          </p>
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
