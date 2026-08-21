import { motion } from "framer-motion";
import {
  Printer,
  MapPin,
  FileUp,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const steps = [
  {
    icon: MapPin,
    label: "Pick a store",
    description: "Choose a nearby print shop from our curated list.",
    command: "$ locate --nearby stores",
  },
  {
    icon: FileUp,
    label: "Upload your file",
    description: "Drop your PDF, image, or document — set copies and options.",
    command: "$ upload --file document.pdf",
  },
  {
    icon: CheckCircle2,
    label: "Confirm & go",
    description: "Review details, submit, and pick up when it's ready.",
    command: "$ submit --wait ready",
  },
];

const features = [
  {
    icon: Zap,
    title: "Lightning fast",
    description: "From upload to print shop in under a minute. No phone calls.",
  },
  {
    icon: Shield,
    title: "Secure transfers",
    description: "Files are encrypted in transit and never stored longer than needed.",
  },
  {
    icon: Clock,
    title: "Real-time status",
    description: "Track your job from pending to ready for pickup.",
  },
  {
    icon: Printer,
    title: "Multi-format support",
    description: "PDFs, images, documents — we handle the common formats.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-mono">
      {/* Nav */}
      <nav className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded bg-success/15 text-success">
              <Printer className="size-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              cloud_print_pixie
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              sign in
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="rounded-md bg-foreground text-background px-4 py-1.5 text-xs font-medium hover:bg-foreground/90 transition-colors"
            >
              get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs text-success mb-6"
            >
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              v1.0 — now available
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl md:text-5xl font-bold tracking-tight leading-tight"
            >
              Send print jobs
              <br />
              in a few clicks.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-5 text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg"
            >
              Cloud Print Pixie lets you pick a local store, upload your file,
              and submit a print job — no calls, no lines, no hassle.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 rounded-md bg-success text-white px-5 py-2.5 text-sm font-medium hover:bg-success/90 transition-colors"
              >
                Start printing
                <ArrowRight className="size-4" />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                See how it works
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative terminal prompt */}
        <div className="absolute right-8 top-16 hidden lg:block text-success/20 select-none">
          <pre className="text-xs leading-5 font-mono">
{`> pixie.init()
> pixie.find_stores()
> pixie.upload("file.pdf")
> pixie.submit()
  ✓ done`}
          </pre>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-xs text-success font-medium mb-2">// how it works</p>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Three steps. Done.
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="rounded-lg border border-border bg-card p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-8 items-center justify-center rounded bg-success/10 text-success">
                    <step.icon className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    step {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-sm font-semibold mb-1">{step.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {step.description}
                </p>
                <code className="block text-xs text-success/70 bg-success/5 rounded px-2 py-1.5 font-mono">
                  {step.command}
                </code>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-xs text-success font-medium mb-2">// features</p>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Built for speed and simplicity.
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 rounded-lg border border-border bg-card p-5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded bg-muted text-foreground">
                  <feat.icon className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Ready to print?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
              Sign up in seconds and send your first print job in under a minute.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-2 rounded-md bg-success text-white px-6 py-2.5 text-sm font-medium hover:bg-success/90 transition-colors"
            >
              Get started — it's free
              <ArrowRight className="size-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Printer className="size-3" />
            <span className="font-medium">cloud_print_pixie</span>
            <span className="text-border">|</span>
            <span>v1.0.0</span>
          </div>
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Cloud Print Pixie. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
