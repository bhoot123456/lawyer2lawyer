import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SidebarLayout from "@/components/SidebarLayout";
import BottomTabs from "@/components/BottomTabs";
import FloatingAIAgent from "@/components/FloatingAIAgent";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import { ThemeProvider } from "@/theme/ThemeProvider";

export default function Layout() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isCourtDeskRoute = pathname.startsWith("/courtdesk");
  const hideShell = isAdminRoute || isCourtDeskRoute || pathname === "/lawyer-login" || pathname === "/register";

  return (
    <SafeAreaProvider>
      <ThemeProvider defaultMode="dark">
        <SidebarLayout>
          <View style={{ flex: 1 }}>
            <AppErrorBoundary>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />
            </AppErrorBoundary>
          </View>
          {!hideShell && <BottomTabs />}
          {!hideShell && (
            <AppErrorBoundary>
              <FloatingAIAgent />
            </AppErrorBoundary>
          )}
        </SidebarLayout>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}


