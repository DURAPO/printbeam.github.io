import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Zap, LogOut, ArrowRight } from "lucide-react";

export default function SessionExpired() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const handleSignIn = () => {
    navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
  };

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
            <LogOut className="size-8 text-warning" />
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Session expired</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your session has ended due to inactivity. Please sign in again to continue where you left off.
          </p>
          <Button onClick={handleSignIn} className="text-xs bg-success hover:bg-success/90 text-white gap-1.5">
            Sign in <ArrowRight className="size-3" />
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
