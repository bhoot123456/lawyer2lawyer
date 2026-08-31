import React, { useEffect, useMemo, useState } from "react";
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
import { getKnowledgeHubPhase10 } from "@/services/knowledgeHubApi";

type Resource = {
  label: string;
  url: string;
};

type Section = {
  key: string;
  title: string;
  icon: string;
  description: string;
  resources?: Resource[];
};

export default function KnowledgeHubSectionScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getKnowledgeHubPhase10();
        setData(res);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const section: Section | undefined = useMemo(() => {
    const sections: Section[] = data?.sections || [];
    return sections.find((s) => s.key === key);
  }, [data, key]);

  const resources: Resource[] = section?.resources || [];

  const getIconName = (iconKey: string): string => {
    const iconMap: Record<string, string> = {
      "book-outline": "book-outline",
      "scale-outline": "scale-outline",
      "notifications-outline": "notifications-outline",
      "document-text-outline": "document-text-outline",
      "location-outline": "location-outline",
      "business-outline": "business-outline",
      "cash-outline": "cash-outline",
      "calculator-outline": "calculator-outline",
      "briefcase-outline": "briefcase-outline",
      "document-outline": "document-outline",
    };
    return iconMap[iconKey] || "link-outline";
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <GlassCard borderColor="rgba(181, 141, 61, 0.35)" accent="#B58D3D">
        <View style={styles.headerRow}>
          <View style={styles.badgeIcon}>
            <Ionicons
              name={getIconName(section?.icon || "") as any}
              size={20}
              color="#D4AF37"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{section?.title || "Loading…"}</Text>
            <Text style={styles.subtitle}>
              {resources.length} resource{resources.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </GlassCard>

      {loading ? (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator size="small" color="#B58D3D" />
        </View>
      ) : null}

      {!loading && !section ? (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.errorText}>Section not found.</Text>
          <Pressable
            onPress={() => router.push("/knowledge-hub")}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>Back to Knowledge Hub</Text>
          </Pressable>
        </View>
      ) : null}

      {section ? (
        <View style={styles.contentWrap}>
          {section.description ? (
            <View style={styles.descBox}>
              <Text style={styles.descText}>{section.description}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionHeader}>Resources</Text>

          {resources.length ? (
            <View style={styles.resourceList}>
              {resources.map((r, idx) => (
                <Pressable
                  key={`${r.url}-${idx}`}
                  style={({ pressed }) => [
                    styles.resourceRow,
                    pressed ? { opacity: 0.92 } : null,
                  ]}
                  onPress={() => Linking.openURL(r.url)}
                >
                  <View style={styles.resourceIconWrap}>
                    <Ionicons name="link-outline" size={16} color="#B58D3D" />
                  </View>
                  <Text style={styles.resourceLabel} numberOfLines={2}>
                    {r.label}
                  </Text>
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color="rgba(181,141,61,0.6)"
                  />
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No resources added yet.</Text>
          )}

          <Pressable
            style={styles.backBtn}
            onPress={() => router.push("/knowledge-hub")}
          >
            <Ionicons name="arrow-back-outline" size={16} color="#B58D3D" />
            <Text style={styles.backText}>Back to Knowledge Hub</Text>
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
    backgroundColor: "#0B0B0B",
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
    backgroundColor: "rgba(181,141,61,0.12)",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
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
  descBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.20)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  descText: {
    color: "rgba(248,250,252,0.82)",
    fontWeight: "800",
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 14,
    marginTop: 4,
  },
  resourceList: {
    gap: 10,
  },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.18)",
    backgroundColor: "rgba(181,141,61,0.08)",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  resourceIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(181,141,61,0.12)",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  resourceLabel: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  emptyText: {
    color: "rgba(248,250,252,0.65)",
    fontWeight: "800",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    backgroundColor: "rgba(181,141,61,0.10)",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.35)",
    paddingVertical: 12,
  },
  backText: {
    color: "rgba(181,141,61,0.95)",
    fontWeight: "900",
  },
  errorText: {
    color: "rgba(248,250,252,0.75)",
    fontWeight: "900",
    marginBottom: 12,
  },
});