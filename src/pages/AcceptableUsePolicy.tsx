import LegalPage, { Section } from "@/components/LegalPage";

export default function AcceptableUsePolicy() {
  return (
    <LegalPage title="Acceptable Use Policy" lastUpdated="August 28, 2026">
      <Section title="1. Purpose">
        <p>This Acceptable Use Policy ("AUP") governs how you use PrintBeam's platform, including file uploads, messaging, API access (if applicable), and all other platform features. Violation of this policy may result in account suspension or termination.</p>
      </Section>

      <Section title="2. Permitted Uses">
        <p>PrintBeam is designed for legitimate print services. You may use the platform to:</p>
        <p>• Upload PDF documents for printing at partner stores.</p>
        <p>• Communicate with stores about order specifications and status.</p>
        <p>• Manage your store, printers, and print queue (store owners).</p>
        <p>• Track order status and history.</p>
      </Section>

      <Section title="3. Prohibited Content">
        <p>You may not upload, share, or request printing of:</p>
        <p>• Content that infringes on intellectual property rights (copyrighted material you don't have permission to print).</p>
        <p>• Illegal content under applicable law.</p>
        <p>• Content that is obscene, hateful, or promotes violence.</p>
        <p>• Malicious files (malware, scripts, or files designed to exploit the platform).</p>
        <p>• Confidential or personal information of third parties without authorization.</p>
      </Section>

      <Section title="4. File Upload Rules">
        <p>• Only PDF files are accepted for upload.</p>
        <p>• Maximum file size: 20 MB per file.</p>
        <p>• Files must not contain executable code, embedded scripts, or active content.</p>
        <p>• You must have the legal right to print every file you upload.</p>
        <p>• Automated or bulk uploads are prohibited without prior written approval.</p>
      </Section>

      <Section title="5. Messaging and Communication">
        <p>When using PrintBeam's messaging features:</p>
        <p>• Keep communications professional and relevant to orders.</p>
        <p>• Do not send spam, promotional content, or unsolicited messages.</p>
        <p>• Do not share others' personal information without consent.</p>
        <p>• Do not use messaging to circumvent platform fees or conduct off-platform transactions.</p>
      </Section>

      <Section title="6. API Access">
        <p>If API access is granted:</p>
        <p>• API keys must be kept confidential and not shared publicly.</p>
        <p>• Rate limits must be respected.</p>
        <p>• API access may not be used to scrape, clone, or replicate PrintBeam functionality.</p>
        <p>• Automated access must be clearly identified and comply with all platform policies.</p>
      </Section>

      <Section title="7. Store Owner Responsibilities">
        <p>Store owners must:</p>
        <p>• Maintain accurate store information, rates, and availability status.</p>
        <p>• Not misrepresent store capabilities or equipment.</p>
        <p>• Not use the platform to collect customer data outside of the platform's intended flow.</p>
        <p>• Keep printer limits within platform-enforced limits.</p>
      </Section>

      <Section title="8. Enforcement">
        <p>PrintBeam reserves the right to:</p>
        <p>• Issue warnings for minor violations.</p>
        <p>• Suspend accounts for repeated or serious violations.</p>
        <p>• Terminate accounts for egregious violations.</p>
        <p>• Report illegal activity to appropriate authorities.</p>
      </Section>

      <Section title="9. Reporting Violations">
        <p>If you encounter content or behavior that violates this policy, report it through the Support page. All reports are reviewed promptly and handled confidentially.</p>
      </Section>
    </LegalPage>
  );
}
