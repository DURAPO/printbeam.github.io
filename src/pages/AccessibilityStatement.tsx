import LegalPage, { Section } from "@/components/LegalPage";

export default function AccessibilityStatement() {
  return (
    <LegalPage title="Accessibility Statement" lastUpdated="August 28, 2026">
      <Section title="1. Our Commitment">
        <p>PrintBeam is committed to ensuring digital accessibility for all users, including people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards.</p>
      </Section>

      <Section title="2. Standards We Follow">
        <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.</p>
      </Section>

      <Section title="3. Current Accessibility Features">
        <p>PrintBeam includes the following accessibility features:</p>
        <p>• Semantic HTML structure with proper heading hierarchy.</p>
        <p>• Keyboard-navigable interface for all interactive elements.</p>
        <p>• Sufficient color contrast ratios for text and interactive elements.</p>
        <p>• Form labels and error messages associated with their inputs.</p>
        <p>• Responsive design that works across screen sizes and zoom levels.</p>
        <p>• Screen reader-friendly status indicators and notifications.</p>
        <p>• Focus indicators on all interactive elements.</p>
      </Section>

      <Section title="4. Known Limitations">
        <p>We are actively working to address the following known accessibility limitations:</p>
        <p>• File upload drag-and-drop may require keyboard alternative interaction.</p>
        <p>• Some interactive maps and location pickers may have limited screen reader support.</p>
        <p>• Complex data tables in the store dashboard are being improved for full screen reader access.</p>
      </Section>

      <Section title="5. Third-Party Content">
        <p>Some features integrate third-party services (e.g., payment processors, map providers) that may not fully conform to WCAG 2.1. We work with these providers to improve accessibility where possible.</p>
      </Section>

      <Section title="6. Feedback">
        <p>We welcome your feedback on the accessibility of PrintBeam. If you encounter accessibility barriers or have suggestions for improvement, please contact us through the Support page or email accessibility@printbeam.com. We take all accessibility feedback seriously and aim to respond within 5 business days.</p>
      </Section>

      <Section title="7. Enforcement">
        <p>If you are not satisfied with our response to an accessibility concern, you may contact us for further review. We are committed to working with you to resolve any accessibility issues.</p>
      </Section>
    </LegalPage>
  );
}
