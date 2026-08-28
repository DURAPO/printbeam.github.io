import LegalPage, { Section } from "@/components/LegalPage";

export default function CookiePolicy() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="August 28, 2026">
      <Section title="1. What Are Cookies">
        <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, maintain your session, and provide a better experience.</p>
      </Section>

      <Section title="2. How PrintBeam Uses Cookies">
        <p>PrintBeam uses only essential cookies required for the platform to function. We do not use advertising, analytics, or third-party tracking cookies.</p>
      </Section>

      <Section title="3. Essential Cookies">
        <p><strong>Authentication Cookies:</strong> Maintain your signed-in session and verify your identity across requests. These are strictly necessary for the platform to work.</p>
        <p><strong>Session Cookies:</strong> Track your current session state (e.g., form progress, file upload state) to prevent data loss during navigation.</p>
        <p><strong>Security Cookies:</strong> Protect against cross-site request forgery (CSRF) and other security threats.</p>
      </Section>

      <Section title="4. Local Storage">
        <p>PrintBeam may use browser local storage to cache preferences (e.g., theme settings, recently used stores) and to improve performance. This data is stored entirely on your device and is not transmitted to our servers.</p>
      </Section>

      <Section title="5. Third-Party Services">
        <p>Our authentication provider (Convex Auth) may set its own cookies during the sign-in process. These cookies are necessary for authentication and are governed by the provider's privacy policy.</p>
      </Section>

      <Section title="6. Managing Cookies">
        <p>You can control cookies through your browser settings. Disabling essential cookies may prevent you from using PrintBeam effectively. Most browsers allow you to:</p>
        <p>• View and delete stored cookies.</p>
        <p>• Block cookies from specific sites.</p>
        <p>• Block all cookies (not recommended for PrintBeam).</p>
        <p>• Clear cookies on browser exit.</p>
      </Section>

      <Section title="7. Changes to This Policy">
        <p>We may update this Cookie Policy when our cookie usage changes. Check this page periodically for updates.</p>
      </Section>

      <Section title="8. Contact">
        <p>Questions about our cookie practices? Contact us through the Support page.</p>
      </Section>
    </LegalPage>
  );
}
