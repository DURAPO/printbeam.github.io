import LegalPage, { Section } from "@/components/LegalPage";

export default function TermsOfService() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="August 28, 2026">
      <Section title="1. Acceptance of Terms">
        <p>By accessing or using PrintBeam ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Platform.</p>
      </Section>

      <Section title="2. Description of Service">
        <p>PrintBeam is a platform that connects customers needing print services with independent print stores. We facilitate order placement, payment processing, and order tracking. We are not a party to the transaction between customers and stores.</p>
      </Section>

      <Section title="3. User Accounts">
        <p>You must be at least 16 years old to create an account. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. You agree to provide accurate information and keep it updated.</p>
      </Section>

      <Section title="4. Customer Obligations">
        <p>When using PrintBeam as a customer, you agree to:</p>
        <p>• Upload only content you have the right to print.</p>
        <p>• Ensure uploaded files are in PDF format and under 20 MB.</p>
        <p>• Provide accurate contact information for order fulfillment.</p>
        <p>• Pay all applicable charges for completed print orders.</p>
        <p>• Comply with the Acceptable Use Policy for file uploads and messaging.</p>
      </Section>

      <Section title="5. Store Owner Obligations">
        <p>When using PrintBeam as a store owner, you agree to:</p>
        <p>• Provide accurate store information, rates, and availability.</p>
        <p>• Fulfill accepted orders promptly and to the specifications provided.</p>
        <p>• Maintain your printers and equipment in working order.</p>
        <p>• Keep your store status (online/offline) accurate and current.</p>
        <p>• Comply with all applicable local regulations for print services.</p>
      </Section>

      <Section title="6. Payments and Pricing">
        <p>Prices are determined by individual store owners based on their configured rates. PrintBeam charges a platform fee on completed transactions. All payments are processed through our secure payment processor. Refunds are subject to the store's refund policy and these Terms.</p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>You retain ownership of files you upload. By uploading a file, you grant PrintBeam and the selected store a limited license to process and print the file solely to fulfill your order. You represent that you have the right to print the uploaded content.</p>
      </Section>

      <Section title="8. Prohibited Conduct">
        <p>You may not use PrintBeam to:</p>
        <p>• Upload illegal, harmful, or infringing content.</p>
        <p>• Circumvent platform fees or payment mechanisms.</p>
        <p>• Interfere with platform operations or other users' accounts.</p>
        <p>• Misrepresent your identity or store affiliation.</p>
        <p>• Scrape, index, or bulk-download platform data.</p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>PrintBeam provides the platform "as is" and "as available." We are not liable for the quality of print services provided by stores, delays in fulfillment, or disputes between customers and stores. Our total liability is limited to the platform fees paid in the 12 months preceding the claim.</p>
      </Section>

      <Section title="10. Termination">
        <p>We may suspend or terminate your account for violation of these Terms, with or without notice. You may delete your account at any time through Account Settings.</p>
      </Section>

      <Section title="11. Dispute Resolution">
        <p>Disputes arising from these Terms will be resolved through binding arbitration, except where prohibited by applicable law. Class action waivers apply to the extent permitted by law.</p>
      </Section>

      <Section title="12. Changes to Terms">
        <p>We may update these Terms periodically. Material changes will be communicated through the platform. Continued use after changes constitutes acceptance.</p>
      </Section>

      <Section title="13. Contact">
        <p>Questions about these Terms? Contact us through the Support page or email us at durapomain@gmail.com.</p>
      </Section>
    </LegalPage>
  );
}
