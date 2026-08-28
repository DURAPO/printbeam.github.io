import LegalPage, { Section } from "@/components/LegalPage";

export default function RefundPolicy() {
  return (
    <LegalPage title="Refund & Cancellation Policy" lastUpdated="August 28, 2026">
      <Section title="1. Overview">
        <p>PrintBeam connects customers with independent print stores. Refunds and cancellations are subject to both PrintBeam's platform policies and the individual store's policies. When these policies conflict, the store's policy applies if it offers greater consumer protection.</p>
      </Section>

      <Section title="2. Order Cancellation by Customers">
        <p><strong>Before Acceptance:</strong> You may cancel a print order at any time before the store accepts it. No charges will apply.</p>
        <p><strong>After Acceptance:</strong> Once a store accepts your order, cancellation is subject to the store's policy. Contact the store directly through the order's messaging feature.</p>
        <p><strong>During Printing:</strong> Orders already in printing cannot be canceled. If printing fails, the order status will update to "Failed" and a refund may be issued automatically.</p>
      </Section>

      <Section title="3. Order Rejection by Stores">
        <p>If a store rejects your order, you will be notified immediately. No charges will be applied. You may submit the order to a different store at no additional cost.</p>
      </Section>

      <Section title="4. Failed Print Jobs">
        <p>If a print job fails due to a store-side issue (printer malfunction, quality problems), the order status will change to "Failed." A full refund of the print charges will be issued to your original payment method within 5–10 business days.</p>
      </Section>

      <Section title="5. Quality Disputes">
        <p>If the printed output does not match the specifications in your order (wrong color mode, incorrect binding, missing pages), contact the store within 48 hours of pickup/delivery. The store is responsible for reprinting or issuing a refund for the disputed items.</p>
        <p>If the store is unresponsive, escalate through PrintBeam Support and we will mediate the dispute.</p>
      </Section>

      <Section title="6. Refund Processing">
        <p>Approved refunds are processed to the original payment method. Processing times:</p>
        <p>• <strong>Credit/Debit Cards:</strong> 5–10 business days.</p>
        <p>• <strong>Digital Wallets:</strong> 1–3 business days.</p>
        <p>• <strong>Other Methods:</strong> As specified at checkout.</p>
      </Section>

      <Section title="7. Store Owner Cancellations">
        <p>Store owners may reject orders before accepting them. Repeated unexplained rejections may affect store visibility and standing on the platform.</p>
      </Section>

      <Section title="8. Platform Fees">
        <p>Platform service fees are refunded in full when an order is canceled before acceptance or rejected by the store. For post-acceptance refunds due to quality issues, the platform fee is also refunded.</p>
      </Section>

      <Section title="9. Contact">
        <p>Need help with a refund? Contact us through the Support page or email us at durapomain@gmail.com.</p>
      </Section>
    </LegalPage>
  );
}
