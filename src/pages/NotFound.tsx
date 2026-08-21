import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen flex flex-col bg-background font-mono">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <p className="text-sm text-muted-foreground mb-6">Page not found.</p>
          <Button variant="outline" onClick={() => navigate("/")} className="text-xs gap-1.5">
            <ArrowLeft className="size-3" /> Back to home
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
