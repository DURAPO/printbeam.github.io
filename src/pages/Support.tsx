import { useNavigate } from "react-router";
import { Zap, ArrowLeft, ChevronDown, MessageSquare, Mail, FileText } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "How do I submit a print order?",
    a: "Sign in to your account, then navigate to 'New Print Job' from your dashboard. Upload a PDF (max 20 MB), select a nearby store or enter a Store UID, choose your print options (binding, color mode, copies), and submit. You'll receive an order ID and can track the status in real time.",
  },
  {
    q: "What file formats are supported?",
    a: "PrintBeam currently supports PDF files only, with a maximum file size of 20 MB. Your page count is displayed automatically after upload so you can verify the document before proceeding.",
  },
  {
    q: "How is the print cost calculated?",
    a: "Costs are calculated live based on the selected store's rates. The estimate includes per-page printing charges (based on your color mode selection), binding costs (if any), and the number of copies. The store's own rates are used, so prices may vary between stores.",
  },
  {
    q: "Can I cancel my order?",
    a: "You can cancel an order at any time before the store accepts it. Once accepted, cancellation is subject to the store's policy — use the messaging feature within the order to communicate with the store directly.",
  },
  {
    q: "What happens if my print job fails?",
    a: "If a print job fails (printer malfunction, quality issue), the order status updates to 'Failed' and a full refund is issued to your original payment method within 5–10 business days.",
  },
  {
    q: "How do I become a store partner?",
    a: "Click 'Register your store' on the PrintBeam home page. You'll complete an onboarding flow where you enter your store information, set printing rates, generate a Store UID, and connect your printers. Once set up, customers can discover and submit orders to your store.",
  },
  {
    q: "How does store matching work?",
    a: "When you select a store, PrintBeam uses your device's location to sort nearby stores by distance. You can also search for a specific store by its Store UID. Stores appear only when they're online and accepting orders.",
  },
  {
    q: "What are the printer limits for stores?",
    a: "Each store can connect up to 6 color printers, 7 B&W printers, and 5 micro printers. These limits are enforced at the database level to ensure consistent service quality.",
  },
];

function FaqItem({ faq }: { faq: (typeof faqs)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="text-xs font-medium">{faq.q}</span>
        <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
          {faq.a}
        </div>
      )}
    </div>
  );
}

export default function Support() {
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
        <h1 className="text-2xl font-bold tracking-tight mb-1">Support</h1>
        <p className="text-xs text-muted-foreground mb-10">Find answers to common questions or get in touch with our team.</p>

        {/* Quick Links */}
        <div className="grid gap-4 sm:grid-cols-3 mb-12">
          <button
            onClick={() => navigate("/privacy-policy")}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <FileText className="size-4 text-success shrink-0" />
            <div>
              <p className="text-xs font-medium">Legal</p>
              <p className="text-[10px] text-muted-foreground">Privacy, Terms, and policies</p>
            </div>
          </button>
          <button
            onClick={() => window.location.href = "mailto:durapomain@gmail.com"}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <Mail className="size-4 text-success shrink-0" />
            <div>
              <p className="text-xs font-medium">Email</p>
              <p className="text-[10px] text-muted-foreground">durapomain@gmail.com</p>
            </div>
          </button>
          <button
            onClick={() => window.location.href = "mailto:durapomain@gmail.com"}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <MessageSquare className="size-4 text-success shrink-0" />
            <div>
              <p className="text-xs font-medium">Security</p>
              <p className="text-[10px] text-muted-foreground">Report a vulnerability</p>
            </div>
          </button>
        </div>

        {/* FAQs */}
        <div className="mb-6">
          <p className="text-[11px] text-success font-medium mb-2 tracking-wide">// frequently asked questions</p>
          <h2 className="text-lg font-bold tracking-tight">Common questions</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <FaqItem key={i} faq={faq} />
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-12 rounded-lg border border-border bg-card p-6 text-center">
          <h3 className="text-sm font-semibold mb-2">Still need help?</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Our team typically responds within 24 hours on business days.
          </p>
          <button
            onClick={() => window.location.href = "mailto:durapomain@gmail.com?subject=PrintBeam Support Request"}
            className="inline-flex items-center gap-2 rounded-md bg-success text-white px-5 py-2 text-xs font-medium hover:bg-success/90 transition-colors"
          >
            <Mail className="size-3.5" /> Contact support
          </button>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-surface/50 mt-12">
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
