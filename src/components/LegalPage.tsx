import { useNavigate } from "react-router";
import { Zap, ArrowLeft } from "lucide-react";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-mono">
      <nav className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-success/10 text-success border border-success/20">
              <Zap className="size-3.5" />
            </div>
            <span className="text-xs font-bold tracking-tight">PrintBeam</span>
          </button>
          <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <ArrowLeft className="size-3" /> Home
          </button>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold tracking-tight mb-1">{title}</h1>
        <p className="text-xs text-muted-foreground mb-10">Last updated: {lastUpdated}</p>
        <div className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground/80 space-y-6">
          {children}
        </div>
      </main>
      <footer className="border-t border-border/60 bg-surface/50">
        <div className="mx-auto max-w-3xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="size-3 text-success" /><span className="font-semibold">PrintBeam</span>
          </div>
          <p className="text-[11px] text-muted-foreground/60">© {new Date().getFullYear()} PrintBeam.</p>
        </div>
      </footer>
    </div>
  );
}

/** Reusable section component for legal pages */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-bold mb-2 text-foreground">{title}</h2>
      <div className="text-xs text-foreground/70 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
