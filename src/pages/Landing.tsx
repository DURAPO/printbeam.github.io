import { motion } from "framer-motion";
import { Zap, Shield, Clock, ArrowRight, Layers } from "lucide-react";
import { useNavigate } from "react-router";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const capabilities = [
  { icon: Zap, title: "Under a minute", description: "From file upload to print submission in seconds. No phone calls, no drive-by stops." },
  { icon: Clock, title: "Schedule ahead", description: "Book a pickup window that works for you. Morning, afternoon, or end of day." },
  { icon: Layers, title: "Full control", description: "Color, paper size, duplex, copies — every option you need, none you don't." },
  { icon: Shield, title: "Team-grade security", description: "Files encrypted in transit, never stored longer than needed, accessible only to you." },
];

const stats = [
  { value: "<60s", label: "average turnaround" },
  { value: "100%", label: "encrypted transfers" },
  { value: "24/7", label: "queue visibility" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-mono">
      <nav className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-success/10 text-success border border-success/20">
              <Zap className="size-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">PrintBeam</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/auth")} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Sign in</button>
            <button onClick={() => navigate("/auth")} className="rounded-md bg-foreground text-background px-4 py-2 text-xs font-medium hover:bg-foreground/90 transition-colors">Get started</button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <motion.div initial="hidden" animate="visible" className="max-w-2xl">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/5 px-3 py-1 text-[11px] text-success mb-6 font-medium tracking-wide">
              <span className="size-1.5 rounded-full bg-success" />
              Internal print infrastructure
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.15]">
              Print anything.<br />In under a minute.
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-5 text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg">
              PrintBeam lets your team submit print jobs to any connected pressroom — pick a location, upload your file, schedule a time, and check out. No friction, no delays.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate("/auth")} className="inline-flex items-center gap-2 rounded-md bg-success text-white px-5 py-2.5 text-sm font-medium hover:bg-success/90 transition-colors">
                Start printing <ArrowRight className="size-4" />
              </button>
              <button onClick={() => document.getElementById("capabilities")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                See how it works
              </button>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute right-8 top-16 hidden lg:block text-success/15 select-none">
          <pre className="text-[11px] leading-5 font-mono">
{`$ printbeam submit \\
  --file deck-v3.pdf \\
  --store pressroom-a \\
  --schedule 2pm \\
  --copies 3

  ✓ queued · ready by 2:15pm`}
          </pre>
        </div>
      </section>

      <section className="border-b border-border/60 bg-surface/50">
        <div className="mx-auto max-w-5xl px-6 py-6 grid grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-lg md:text-xl font-bold text-success">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="capabilities" className="border-b border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-10">
            <p className="text-[11px] text-success font-medium mb-2 tracking-wide">// capabilities</p>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Built for internal workflows.</h2>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2">
            {capabilities.map((cap, i) => (
              <motion.div key={cap.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-9 items-center justify-center rounded-md bg-success/8 text-success border border-success/15"><cap.icon className="size-4" /></div>
                  <h3 className="text-sm font-semibold">{cap.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-10">
            <p className="text-[11px] text-success font-medium mb-2 tracking-wide">// workflow</p>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Four steps. Done.</h2>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { step: "01", label: "Pick a pressroom", code: "printbeam pick" },
              { step: "02", label: "Upload your file", code: "printbeam upload" },
              { step: "03", label: "Schedule pickup", code: "printbeam book" },
              { step: "04", label: "Check out", code: "printbeam pay" },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-lg border border-border bg-card p-4">
                <span className="text-[10px] text-success font-medium tracking-wider">{item.step}</span>
                <h3 className="text-sm font-semibold mt-1.5 mb-2">{item.label}</h3>
                <code className="block text-[11px] text-muted-foreground/70 bg-surface rounded px-2 py-1 font-mono">$ {item.code}</code>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Ready to print?</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">Sign in with your team credentials and submit your first job in under sixty seconds.</p>
            <button onClick={() => navigate("/auth")} className="inline-flex items-center gap-2 rounded-md bg-success text-white px-6 py-2.5 text-sm font-medium hover:bg-success/90 transition-colors">
              Open PrintBeam <ArrowRight className="size-4" />
            </button>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-surface/50">
        <div className="mx-auto max-w-5xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="size-3 text-success" /><span className="font-semibold">PrintBeam</span><span className="text-border">·</span><span>v1.0.0</span>
          </div>
          <p className="text-[11px] text-muted-foreground/60">© {new Date().getFullYear()} PrintBeam. Internal use only.</p>
        </div>
      </footer>
    </div>
  );
}
