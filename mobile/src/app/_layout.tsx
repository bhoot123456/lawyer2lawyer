import { Stack, usePathname } from "expo-router";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SidebarLayout from "@/components/SidebarLayout";
import BottomTabs from "@/components/BottomTabs";
import FloatingAIAgent from "@/components/FloatingAIAgent";
import AppErrorBoundary from "@/components/AppErrorBoundary";

export default function Layout() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        // Move content up when the keyboard opens so inputs are not covered.
        // Bottom tabs take some space on screen; tweak if you change their height.
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
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
          {!isAdminRoute && <BottomTabs />}
          {!isAdminRoute && <FloatingAIAgent />}
        </SidebarLayout>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}


