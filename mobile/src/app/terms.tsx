import LegalDocumentScreen from "@/components/legal/LegalDocumentScreen";

// DRAFT wording — requires legal approval before public release.
const SECTIONS = [
  {
    heading: "Acceptance of Terms",
    body: "By accessing or using Lawyer2Lawyer you agree to these Terms of Service. If you do not agree, do not use the app.",
  },
  {
    heading: "Nature of the Service",
    body: "Lawyer2Lawyer provides legal reference information (bare acts, judgments, court and directory information), tools for organising your own case information, and AI-assisted legal information features. Lawyer2Lawyer is not a law firm, does not provide legal advice, and does not create a lawyer-client relationship through the app.",
  },
  {
    heading: "No Legal Advice",
    body: "All content, including AI-generated responses, is provided for general information only and may be inaccurate, incomplete or outdated. You must not rely on it as a substitute for advice from a qualified lawyer.",
  },
  {
    heading: "Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate registration information.",
  },
  {
    heading: "Acceptable Use",
    body: "You agree not to misuse the service, including attempting to access other users' data, interfering with the service's operation, or using it for any unlawful purpose.",
  },
  {
    heading: "Third-Party Services",
    body: "The app uses third-party providers for hosting, data storage and AI features. Your use of AI features is additionally subject to the applicable AI provider's terms.",
  },
  {
    heading: "Availability and Changes",
    body: "The service is provided on an 'as is' and 'as available' basis. Features may be modified, suspended or discontinued. We do not guarantee uninterrupted or error-free operation.",
  },
  {
    heading: "Limitation of Liability",
    body: "To the maximum extent permitted by law, Lawyer2Lawyer is not liable for indirect, incidental or consequential damages, or for any loss arising from reliance on content or AI-generated information in the app.",
  },
  {
    heading: "Contact",
    body: "Questions about these terms can be directed to the Lawyer2Lawyer support team. (Support contact details to be confirmed before release.)",
  },
];

export default function TermsOfServiceRoute() {
  return (
    <LegalDocumentScreen
      title="Terms of Service"
      lastUpdated="August 31, 2026 (draft)"
      sections={SECTIONS}
    />
  );
}
