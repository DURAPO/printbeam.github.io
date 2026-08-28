import { motion } from "framer-motion";
import { Zap, Shield, Clock, ArrowRight, Layers, Store, Printer } from "lucide-react";
import { useNavigate } from "react-router";
import ThemeSwitcher from "@/components/ThemeSwitcher";

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
      {/* Nav */}
      <nav className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-success/10 text-success border border-success/20">
              <Zap className="size-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">PrintBeam</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeSwitcher />
            <button onClick={() => navigate("/auth")} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Sign in</button>
            <button onClick={() => navigate("/auth")} className="rounded-md bg-success text-white px-4 py-2 text-xs font-medium hover:bg-success/90 transition-colors">Get started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 md:py-28">
          <motion.div initial="hidden" animate="visible" className="max-w-2xl">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/5 px-3 py-1 text-[11px] text-success mb-6 font-medium tracking-wide">
              <span className="size-1.5 rounded-full bg-success" />
              Global print infrastructure
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight leading-[1.15]">
              Print anything.<br />In under a minute.
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-5 text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg">
              PrintBeam connects customers with print stores worldwide. Upload a file, pick a nearby store, and have it printed in under a minute. For store owners, it takes just a few minutes to register and start accepting orders.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate("/auth")} className="inline-flex items-center gap-2 rounded-md bg-success text-white px-5 py-2.5 text-sm font-medium hover:bg-success/90 transition-colors">
                Start printing <ArrowRight className="size-4" />
              </button>
              <button onClick={() => navigate("/store-onboarding")} className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                <Store className="size-4" /> Register your store
              </button>
            </motion.div>
          </motion.div>
        </div>
        {/* Decorative terminal prompt */}
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

      {/* Stats */}
      <section className="border-b border-border/60 bg-surface/50">
        <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-lg md:text-xl font-bold text-success">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-10">
            <p className="text-[11px] text-success font-medium mb-2 tracking-wide">// capabilities</p>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Built for speed and reliability.</h2>
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

      {/* Workflow */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-10">
            <p className="text-[11px] text-success font-medium mb-2 tracking-wide">// how it works</p>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Two flows. Both simple.</h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Customer flow */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-md bg-success/10 flex items-center justify-center text-success border border-success/20"><Zap className="size-4" /></div>
                <h3 className="text-sm font-semibold">For customers</h3>
              </div>
              <div className="space-y-3">
                {[
                  { step: "01", label: "Upload your PDF" },
                  { step: "02", label: "Pick a nearby store" },
                  { step: "03", label: "Choose print options" },
                  { step: "04", label: "Confirm & track" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <span className="text-[10px] text-success font-medium tracking-wider w-6">{item.step}</span>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Store owner flow */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-md bg-success/10 flex items-center justify-center text-success border border-success/20"><Printer className="size-4" /></div>
                <h3 className="text-sm font-semibold">For store owners</h3>
              </div>
              <div className="space-y-3">
                {[
                  { step: "01", label: "Register your store" },
                  { step: "02", label: "Set your printing rates" },
                  { step: "03", label: "Connect your printers" },
                  { step: "04", label: "Accept & fulfill orders" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <span className="text-[10px] text-success font-medium tracking-wider w-6">{item.step}</span>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Ready to print?</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">Sign in to submit your first print job, or register your store to start accepting orders.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => navigate("/auth")} className="inline-flex items-center gap-2 rounded-md bg-success text-white px-6 py-2.5 text-sm font-medium hover:bg-success/90 transition-colors">
                Start printing <ArrowRight className="size-4" />
              </button>
              <button onClick={() => navigate("/store-onboarding")} className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                <Store className="size-4" /> Register your store
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-surface/50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="size-3 text-success" /><span className="text-xs font-bold">PrintBeam</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Print anything. In under a minute.</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-foreground mb-2 tracking-wide uppercase">Product</p>
              <div className="space-y-1.5">
                <button onClick={() => navigate("/auth")} className="block text-[10px] text-muted-foreground hover:text-foreground transition-colors">Start printing</button>
                <button onClick={() => navigate("/store-onboarding")} className="block text-[10px] text-muted-foreground hover:text-foreground transition-colors">Register your store</button>
                <button onClick={() => navigate("/support")} className="block text-[10px] text-muted-foreground hover:text-foreground transition-colors">Support</button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-foreground mb-2 tracking-wide uppercase">Legal</p>
              <div className="space-y-1.5">
                <button onClick={() => navigate("/privacy-policy")} className="block text-[10px] text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</button>
                <button onClick={() => navigate("/terms-of-service")} className="block text-[10px] text-muted-foreground hover:text-foreground transition-colors">Terms of Service</button>
                <button onClick={() => navigate("/cookie-policy")} className="block text-[10px] text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</button>
                <button onClick={() => navigate("/refund-policy")} className="block text-[10px] text-muted-foreground hover:text-foreground transition-colors">Refund Policy</button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-foreground mb-2 tracking-wide uppercase">Company</p>
              <div className="space-y-1.5">
                <button onClick={() => navigate("/accessibility")} className="block text-[10px] text-muted-foreground hover:text-foreground transition-colors">Accessibility</button>
                <button onClick={() => navigate("/security")} className="block text-[10px] text-muted-foreground hover:text-foreground transition-colors">Security</button>
                <button onClick={() => navigate("/acceptable-use")} className="block text-[10px] text-muted-foreground hover:text-foreground transition-colors">Acceptable Use</button>
                <button onClick={() => navigate("/community-guidelines")} className="block text-[10px] text-muted-foreground hover:text-foreground transition-colors">Community Guidelines</button>
              </div>
            </div>
          </div>
          <div className="border-t border-border/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[10px] text-muted-foreground/60">© {new Date().getFullYear()} PrintBeam. All rights reserved.</p>
            <div className="flex gap-4">
              <button onClick={() => navigate("/privacy-policy")} className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">Privacy</button>
              <button onClick={() => navigate("/terms-of-service")} className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">Terms</button>
              <button onClick={() => navigate("/cookie-policy")} className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">Cookies</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
