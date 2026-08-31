import { Redirect } from "expo-router";

// Android App Link entry point: https://lawyer2lawyer-production.up.railway.app/open
// Immediately redirects to the home screen.
export default function OpenRoute() {
  return <Redirect href="/" />;
}
