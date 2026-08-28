import LegalPage, { Section } from "@/components/LegalPage";

export default function SecurityPolicy() {
  return (
    <LegalPage title="Security Policy" lastUpdated="August 28, 2026">
      <Section title="1. Our Security Commitment">
        <p>PrintBeam takes security seriously. We implement multiple layers of protection to safeguard user data, file uploads, and platform integrity. This policy outlines our security practices and how to report vulnerabilities.</p>
      </Section>

      <Section title="2. Infrastructure Security">
        <p>• <strong>Encryption in Transit:</strong> All communications are encrypted using TLS 1.3.</p>
        <p>• <strong>Encryption at Rest:</strong> Stored data is encrypted using AES-256.</p>
        <p>• <strong>Cloud Infrastructure:</strong> Hosted on enterprise-grade cloud platforms with SOC 2 Type II compliance.</p>
        <p>• <strong>Access Controls:</strong> Strict role-based access controls limit who can access production systems.</p>
        <p>• <strong>Monitoring:</strong> Continuous security monitoring, anomaly detection, and automated alerting.</p>
      </Section>

      <Section title="3. Data Protection">
        <p>• Files are stored in isolated, encrypted buckets with short-lived signed URLs for access.</p>
        <p>• User data is partitioned by account and inaccessible across accounts.</p>
        <p>• Sensitive credentials (API keys, tokens) are stored in encrypted environment variables, never in source code.</p>
        <p>• Database access requires authenticated, encrypted connections.</p>
      </Section>

      <Section title="4. Authentication and Sessions">
        <p>• Authentication is handled through Convex Auth with industry-standard session management.</p>
        <p>• Email verification is required for account creation.</p>
        <p>• Session tokens are rotated and expire after inactivity.</p>
        <p>• Failed authentication attempts are rate-limited to prevent brute-force attacks.</p>
      </Section>

      <Section title="5. File Upload Security">
        <p>• Uploaded files are validated for format (PDF only) and size (max 20 MB) on both client and server.</p>
        <p>• Files are scanned for malicious content before storage.</p>
        <p>• Access to uploaded files is restricted to the uploading user and the assigned store.</p>
        <p>• Files are automatically deleted within 72 hours of order completion.</p>
      </Section>

      <Section title="6. Vulnerability Reporting">
        <p>We welcome responsible disclosure of security vulnerabilities. If you discover a security issue:</p>
        <p>• <strong>Do:</strong> Report the issue privately to durapomain@gmail.com with detailed reproduction steps.</p>
        <p>• <strong>Do:</strong> Allow reasonable time for us to address the issue before public disclosure.</p>
        <p>• <strong>Don't:</strong> Access, modify, or delete data belonging to other users.</p>
        <p>• <strong>Don't:</strong> Perform testing that could disrupt the service or affect other users.</p>
      </Section>

      <Section title="7. Bug Bounty">
        <p>We recognize and appreciate security researchers who help us improve our platform. Valid reports may be eligible for recognition. Contact durapomain@gmail.com for details.</p>
      </Section>

      <Section title="8. Incident Response">
        <p>In the event of a security incident:</p>
        <p>• We will contain and remediate the issue as quickly as possible.</p>
        <p>• Affected users will be notified within 72 hours of confirming the breach.</p>
        <p>• We will provide a clear summary of what happened, what data was affected, and what steps are being taken.</p>
      </Section>

      <Section title="9. Contact">
        <p>Security reports: durapomain@gmail.com</p>
        <p>General inquiries: durapomain@gmail.com</p>
      </Section>
    </LegalPage>
  );
}
