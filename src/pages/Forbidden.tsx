import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldX } from "lucide-react";

export default function Forbidden() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-background font-mono"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20">
            <ShieldX className="size-8 text-destructive" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">403</h1>
          <p className="text-sm text-muted-foreground mb-2">Permission denied.</p>
          <p className="text-xs text-muted-foreground/70 mb-6">
            You don't have access to this page. If you believe this is an error, contact your administrator or try signing in with a different account.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")} className="text-xs gap-1.5">
              <ArrowLeft className="size-3" /> Go home
            </Button>
            <Button onClick={() => navigate("/auth")} className="text-xs bg-success hover:bg-success/90 text-white">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
