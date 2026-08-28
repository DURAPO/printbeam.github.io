import LegalPage, { Section } from "@/components/LegalPage";

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="August 28, 2026">
      <Section title="1. Introduction">
        <p>PrintBeam ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our print-on-demand platform and related services.</p>
        <p>By using PrintBeam, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of the platform.</p>
      </Section>

      <Section title="2. Information We Collect">
        <p>We collect information you provide directly and information generated through your use of the platform:</p>
        <p><strong>Account Information:</strong> Name, email address, phone number, and authentication credentials when you sign up or sign in.</p>
        <p><strong>Payment Information:</strong> Billing details processed through our third-party payment processors. We do not store full card numbers on our servers.</p>
        <p><strong>Print Jobs:</strong> Files you upload, print configuration details (color mode, binding, copies), and order history.</p>
        <p><strong>Store Information (Store Owners):</strong> Store name, address, phone number, geolocation data, printing rates, and printer configurations.</p>
        <p><strong>Usage Data:</strong> Pages visited, features used, session duration, device type, browser information, and IP address.</p>
        <p><strong>Communications:</strong> Messages sent between customers and store owners through the platform.</p>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>We use collected information to:</p>
        <p>• Provide, maintain, and improve the PrintBeam platform.</p>
        <p>• Process print orders and connect customers with stores.</p>
        <p>• Calculate distances, rates, and order estimates.</p>
        <p>• Send transactional notifications (order status updates, confirmations).</p>
        <p>• Detect and prevent fraud, abuse, and security incidents.</p>
        <p>• Comply with legal obligations and enforce our terms.</p>
      </Section>

      <Section title="4. File Storage and Handling">
        <p>Uploaded files are stored in encrypted cloud storage and are accessible only to you and the store fulfilling your order. Files are automatically deleted within 72 hours of order completion. We use short-lived signed URLs for file access to minimize exposure.</p>
      </Section>

      <Section title="5. Data Sharing">
        <p>We share information only as necessary to provide the service:</p>
        <p>• <strong>With Stores:</strong> When you submit a print order, the store receives your print job details and file access to fulfill the order.</p>
        <p>• <strong>With Service Providers:</strong> We use third-party services for hosting, payment processing, authentication, and analytics. These providers access information only as needed to perform their services.</p>
        <p>• <strong>For Legal Compliance:</strong> We may disclose information if required by law, regulation, or valid legal process.</p>
      </Section>

      <Section title="6. Data Security">
        <p>We implement industry-standard security measures including encryption in transit (TLS 1.3), encryption at rest, access controls, and regular security audits. However, no method of transmission or storage is 100% secure.</p>
      </Section>

      <Section title="7. Your Rights">
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <p>• Access, correct, or delete your personal data.</p>
        <p>• Export your data in a portable format.</p>
        <p>• Opt out of non-essential data processing.</p>
        <p>• Request account deletion through your Account Settings or by contacting us.</p>
      </Section>

      <Section title="8. Cookies and Tracking">
        <p>PrintBeam uses essential cookies for authentication and session management. We do not use advertising trackers. See our Cookie Policy for full details.</p>
      </Section>

      <Section title="9. Children's Privacy">
        <p>PrintBeam is not intended for users under the age of 16. We do not knowingly collect information from children.</p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>We may update this policy from time to time. Material changes will be communicated through the platform or by email. Continued use after changes constitutes acceptance of the updated policy.</p>
      </Section>

      <Section title="11. Contact Us">
        <p>Questions about this Privacy Policy? Contact us through the Support page or email privacy@printbeam.com.</p>
      </Section>
    </LegalPage>
  );
}
