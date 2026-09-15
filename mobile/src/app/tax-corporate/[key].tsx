import React, { useEffect, useMemo, useState } from "react";
import { colors } from "@/theme/designSystem";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Linking,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import GlassCard from "@/components/ui/GlassCard";
import { getTaxCorporatePhase9 } from "@/services/taxCorporateApi";

type DownloadLink = { label: string; url: string };

type Topic = {
  key: string;
  title: string;
  category?: string;
  procedure?: string[];
  requiredDocuments?: string[];
  fees?: string;
  timeline?: string;
  downloadForms?: DownloadLink[];
  faqs?: { q: string; a: string }[];
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 8 }}>
      {items.map((x, idx) => (
        <Text key={`${idx}-${x.slice(0, 10)}`} style={styles.bulletText}>
          • {x}
        </Text>
      ))}
    </View>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <View style={styles.faqRow}>
      <Text style={styles.faqQ}>{q}</Text>
      <Text style={styles.faqA}>{a}</Text>
    </View>
  );
}

export default function TaxCorporateTopicScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getTaxCorporatePhase9();
        setData(res);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const topic: Topic | undefined = useMemo(() => {
    const topics: Topic[] = data?.topics || [];
    return topics.find((t) => t.key === key);
  }, [data, key]);

  const downloads: DownloadLink[] = topic?.downloadForms || [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <GlassCard borderColor={colors.border.gold} accent={colors.accent.gold}>
        <View style={styles.headerRow}>
          <View style={styles.badgeIcon}>
            <Ionicons name="document-text-outline" size={20} color="#D4AF37" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{topic?.title || "Loading…"}</Text>
            <Text style={styles.subtitle}>
              Procedure • Documents • Fees • Timeline • Downloads • FAQs
            </Text>
          </View>
        </View>
      </GlassCard>

      {loading ? (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator size="small" color={colors.accent.gold} />
        </View>
      ) : null}

      {!loading && !topic ? (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.errorText}>Topic not found.</Text>
          <Pressable
            onPress={() => router.push("/tax-corporate")}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>Back to topics</Text>
          </Pressable>
        </View>
      ) : null}

      {topic ? (
        <View style={styles.contentWrap}>
          <Section title="Procedure">
            {topic.procedure?.length ? <List items={topic.procedure} /> : null}
          </Section>

          <Section title="Required Documents">
            {topic.requiredDocuments?.length ? (
              <List items={topic.requiredDocuments} />
            ) : null}
          </Section>

          <Section title="Fees">
            <Text style={styles.paragraph}>{topic.fees || "—"}</Text>
          </Section>

          <Section title="Timeline">
            <Text style={styles.paragraph}>{topic.timeline || "—"}</Text>
          </Section>

          <Section title="Download Forms">
            {downloads.length ? (
              <View style={styles.downloadList}>
                {downloads.map((d, idx) => (
                  <Pressable
                    key={`${d.url}-${idx}`}
                    style={({ pressed }) => [
                      styles.downloadRow,
                      pressed ? { opacity: 0.92 } : null,
                    ]}
                    onPress={() => Linking.openURL(d.url)}
                  >
                    <Ionicons
                      name="download-outline"
                      size={16}
                      color={colors.accent.gold}
                    />
                    <Text style={styles.downloadLabel} numberOfLines={1}>
                      {d.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.paragraph}>No download links added.</Text>
            )}
          </Section>

          <Section title="FAQs">
            {topic.faqs?.length ? (
              <View style={{ gap: 10 }}>
                {topic.faqs.map((f, idx) => (
                  <FAQ key={`${idx}-${f.q.slice(0, 12)}`} q={f.q} a={f.a} />
                ))}
              </View>
            ) : (
              <Text style={styles.paragraph}>No FAQs added.</Text>
            )}
          </Section>

          <Pressable
            style={styles.backBtn}
            onPress={() => router.push("/tax-corporate")}
          >
            <Ionicons name="arrow-back-outline" size={16} color={colors.accent.gold} />
            <Text style={styles.backText}>Back to topics</Text>
          </Pressable>

          <View style={{ height: 16 }} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 110,
    backgroundColor: colors.bg.primary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: colors.border.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "rgba(248,250,252,0.75)",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
    lineHeight: 16,
  },
  contentWrap: {
    gap: 12,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  sectionTitle: {
    color: "#D4AF37",
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 10,
  },
  sectionBody: {
    gap: 8,
  },
  bulletText: {
    color: "rgba(248,250,252,0.82)",
    fontWeight: "800",
    fontSize: 12,
    lineHeight: 17,
  },
  paragraph: {
    color: "rgba(248,250,252,0.82)",
    fontWeight: "800",
    fontSize: 12,
    lineHeight: 18,
  },
  downloadList: {
    gap: 10,
  },
  downloadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.accent.goldLight,
    backgroundColor: colors.accent.goldSubtle,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  downloadLabel: {
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 12,
    flex: 1,
  },
  faqRow: {
    gap: 6,
  },
  faqQ: {
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 12,
    lineHeight: 18,
  },
  faqA: {
    color: "rgba(248,250,252,0.80)",
    fontWeight: "800",
    fontSize: 12,
    lineHeight: 18,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    backgroundColor: colors.accent.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    paddingVertical: 12,
  },
  backText: {
    color: colors.accent.gold,
    fontWeight: "800",
  },
  errorText: {
    color: "rgba(248,250,252,0.75)",
    fontWeight: "800",
    marginBottom: 12,
  },
});

