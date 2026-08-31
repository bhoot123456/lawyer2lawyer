import LegalDocumentScreen from "@/components/legal/LegalDocumentScreen";

// DRAFT wording — requires legal approval before public release.
const SECTIONS = [
  {
    heading: "Information We Collect",
    body: "Lawyer2Lawyer collects the information you provide when you register an account (such as your name, email address and phone number), the content you create in the app (such as cases, drafts and favourites), device identifiers used to keep your data scoped to your device, and basic technical information required to operate the service.",
  },
  {
    heading: "How We Use Your Information",
    body: "Your information is used only to provide the Lawyer2Lawyer service: authenticating you, storing and displaying your cases and drafts, showing legal reference content, and providing AI-assisted legal information features. We do not sell your personal information.",
  },
  {
    heading: "Third-Party Services",
    body: "The service relies on third-party providers to operate: a cloud hosting provider for the application backend, a managed database service for data storage, and an AI service provider for AI-assisted features. When you use an AI feature, the text you submit is sent to that AI provider to generate a response. Account credentials are stored only by the service's own authentication system.",
  },
  {
    heading: "AI Features Disclaimer",
    body: "AI-assisted features provide general legal information generated automatically. They do not constitute legal advice, may be inaccurate or incomplete, and must not be relied upon as a substitute for advice from a qualified lawyer.",
  },
  {
    heading: "Data Retention and Deletion",
    body: "You may request deletion of your account and associated data. Cases, drafts and favourites you create remain associated with your account or device until deleted by you or upon account deletion.",
  },
  {
    heading: "Contact",
    body: "For privacy questions or data deletion requests, contact the Lawyer2Lawyer support team. (Support contact details to be confirmed before release.)",
  },
  {
    heading: "Legal Content Disclaimer",
    body: "All legal content in this app (bare acts, judgments, court information and directories) is provided for general information only. It may be outdated or incomplete and is not legal advice.",
  },
];

export default function PrivacyPolicyRoute() {
  return (
    <LegalDocumentScreen
      title="Privacy Policy"
      lastUpdated="August 31, 2026 (draft)"
      sections={SECTIONS}
    />
  );
}
