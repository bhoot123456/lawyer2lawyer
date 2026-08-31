import React from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { UI } from "../constants/ui";

const COURT_VC_LINKS: {
  title: string;
  url: string;
  judgeName: string;
}[] = [
  {
    title: "Court No. 1",
    url: "https://sci-vc.webex.com/meet/court01",
    judgeName: "—",
  },

  {
    title: "Court No. 2",
    url: "https://sci-vc.webex.com/meet/court02",
    judgeName: "—",
  },
  {
    title: "Court No. 3",
    url: "https://sci-vc.webex.com/meet/court03",
    judgeName: "—",
  },
  {
    title: "Court No. 4",
    url: "https://sci-vc.webex.com/meet/court04",
    judgeName: "—",
  },
  {
    title: "Court No. 5",
    url: "https://sci-vc.webex.com/meet/court05",
    judgeName: "—",
  },
  {
    title: "Court No. 6",
    url: "https://sci-vc.webex.com/meet/court06",
    judgeName: "—",
  },
  {
    title: "Court No. 7",
    url: "https://sci-vc.webex.com/meet/court07",
    judgeName: "—",
  },
  {
    title: "Court No. 8",
    url: "https://sci-vc.webex.com/meet/court08",
    judgeName: "—",
  },
  {
    title: "Court No. 9",
    url: "https://sci-vc.webex.com/meet/court09",
    judgeName: "—",
  },
  {
    title: "Court No. 10",
    url: "https://sci-vc.webex.com/meet/court10",
    judgeName: "—",
  },
  {
    title: "Court No. 11",
    url: "https://sci-vc.webex.com/meet/court11",
    judgeName: "—",
  },
  {
    title: "Court No. 12",
    url: "https://sci-vc.webex.com/meet/court12",
    judgeName: "—",
  },
  {
    title: "Court No. 13",
    url: "https://sci-vc.webex.com/meet/court13",
    judgeName: "—",
  },
  {
    title: "Court No. 14",
    url: "https://sci-vc.webex.com/meet/court14",
    judgeName: "—",
  },
  {
    title: "Court No. 15",
    url: "https://sci-vc.webex.com/meet/court15",
    judgeName: "—",
  },
  {
    title: "Court No. 16",
    url: "https://sci-vc.webex.com/meet/court16",
    judgeName: "—",
  },
  {
    title: "Court No. 17",
    url: "https://sci-vc.webex.com/meet/court17",
    judgeName: "—",
  },
  {
    title: "Reg. Court 01",
    url: "https://sci-vc.webex.com/meet/registrarcourt01",
    judgeName: "—",
  },
  {
    title: "Reg. Court 02",
    url: "https://sci-vc.webex.com/meet/registrarcourt02",
    judgeName: "—",
  },
];

function getHost(url: string) {
  try {
    const u = new URL(url);
    return u.host;
  } catch {
    return url;
  }
}

export default function SupremeCourtVcLinksScreen() {
  // Keep a tiny state placeholder if you later want to fetch dynamically.
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={UI.brand.primary} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>SUPREME COURT VC LINKS</Text>
          <Text style={styles.pageSubtitle}>
            Court numbers with direct Webex VC links.
          </Text>
        </View>

        <View style={styles.list}>
          {COURT_VC_LINKS.map((item) => {
            const host = getHost(item.url);

            return (
              <Pressable
                key={item.title}
                onPress={() => Linking.openURL(item.url)}
                accessibilityRole="button"
                accessibilityLabel={`Open Webex VC for ${item.title}`}
                style={({ pressed }) => [
                  styles.card,
                  pressed
                    ? { opacity: 0.92, transform: [{ scale: 0.99 }] }
                    : null,
                ]}
              >
                <View style={styles.cardInner}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>VC</Text>
                  </View>

                  <View style={styles.cardTextWrap}>
                    <Text style={styles.cardTitle}>{item.title}</Text>

                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>VC Link</Text>
                      <Text style={styles.metaValue} numberOfLines={1}>
                        {host}
                      </Text>
                    </View>

                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Judge</Text>
                      <Text style={styles.metaValue} numberOfLines={1}>
                        {item.judgeName}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.chevronWrap}>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footerHint}>
          <Text style={styles.footerHintText}>
            Tap any card to open the Webex meeting.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.colors.surface2,
  },
  body: {
    padding: UI.spacing.md,
    paddingBottom: UI.spacing.xl,
    gap: UI.spacing.sm,
  },

  header: {
    marginTop: 6,
    marginBottom: UI.spacing.sm,
  },
  pageTitle: {
    color: UI.colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    color: UI.colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
    fontWeight: "700",
  },

  list: {
    gap: 12,
    marginTop: 8,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: UI.radius.lg,
    borderWidth: 1,
    borderColor: "#EAE5DB",
    overflow: "hidden",
    ...UI.shadow.sm,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },

  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: UI.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#0B0B0B",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 0.4,
  },

  cardTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  cardTitle: {
    color: UI.brand.primaryDark,
    fontSize: 16,
    fontWeight: "900",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  metaLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "900",
  },
  metaValue: {
    color: UI.colors.link,
    fontSize: 12,
    fontWeight: "800",
    flex: 1,
  },

  chevronWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chevron: {
    color: UI.brand.primaryDark,
    fontSize: 22,
    lineHeight: 22,
    fontWeight: "900",
    marginTop: -2,
  },

  footerHint: {
    marginTop: 10,
    paddingVertical: UI.spacing.sm,
    paddingHorizontal: UI.spacing.sm,
    borderRadius: UI.radius.md,
    borderWidth: 1,
    borderColor: "#EAE5DB",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  footerHintText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
  },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: UI.colors.surface2,
  },
  loadingText: {
    color: UI.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
});
