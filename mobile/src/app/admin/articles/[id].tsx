import React, { useState, useCallback } from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import GlassCard from "@/components/ui/GlassCard";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getAdminArticleById, updateAdminArticle, publishAdminArticle, unpublishAdminArticle, deleteAdminArticle } from "@/services/adminApi";

type InfoRowProps = {
  label: string;
  value: string | number | undefined | null;
};

const InfoRow = ({ label, value }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "N/A"}</Text>
  </View>
);

export default function AdminArticleDetailScreen() {
  const { id } = useLocalSearchParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Cross-platform confirm/notice dialogs (Alert.alert is a no-op on web).
  const { confirm: confirmDialog, notice: noticeDialog, element: dialogElement } = useConfirmDialog();

  const fetchArticle = useCallback(async () => {
    try {
      const res = await getAdminArticleById(id as string);
      if (res?.success) {
        setArticle(res.data);
      }
    } catch (err) {
      console.error("Fetch article error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchArticle();
    }, [fetchArticle]),
  );

  const handlePublishToggle = async () => {
    try {
      if (article.status === "published") {
        const res = await unpublishAdminArticle(id as string);
        if (res?.success) setArticle(res.data);
      } else {
        const res = await publishAdminArticle(id as string);
        if (res?.success) setArticle(res.data);
      }
    } catch (err) {
      void noticeDialog({ title: "Error", message: "Failed to update article status", danger: true });
    }
  };

  const handleToggleFeatured = async () => {
    try {
      const res = await updateAdminArticle(id as string, { isFeatured: !article.isFeatured });
      if (res?.success) setArticle(res.data);
    } catch (err) {
      void noticeDialog({ title: "Error", message: "Failed to update article", danger: true });
    }
  };

  const handleDelete = () => {
    void (async () => {
      // Shared ConfirmDialog renders on web too (RN Alert.alert is a no-op there).
      const ok = await confirmDialog({
        title: "Delete Article",
        message: "Delete this article? Cannot be undone.",
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok) return;
      try {
        await deleteAdminArticle(id as string);
        router.back();
      } catch (err) {
        void noticeDialog({ title: "Error", message: "Failed to delete article", danger: true });
      }
    })();
  };

  const formatDate = (date: string | undefined | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Article Details" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent.gold} /></View>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Article Details" showBack />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Article not found</Text>
        </View>
      </View>
    );
  }

  return (
    <>
    <View style={styles.container}>
      <AdminHeader title={article.title} subtitle={`${article.category || "Uncategorized"} • ${article.status || "draft"}`} showBack />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Card */}
        <GlassCard>
          <Text style={styles.articleTitle}>{article.title}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, {
              backgroundColor: article.status === "published" ? "rgba(16, 185, 129, 0.15)" : article.status === "archived" ? "rgba(100, 116, 139, 0.15)" : "rgba(245, 158, 11, 0.15)",
              borderColor: article.status === "published" ? "rgba(16, 185, 129, 0.3)" : article.status === "archived" ? "rgba(100, 116, 139, 0.3)" : "rgba(245, 158, 11, 0.3)",
            }]}>
              <Text style={[styles.badgeText, {
                color: article.status === "published" ? "#10B981" : article.status === "archived" ? "#64748B" : "#F59E0B",
              }]}>{article.status}</Text>
            </View>
            {article.isFeatured && (
              <View style={[styles.badge, { backgroundColor: "rgba(139, 92, 246, 0.15)", borderColor: "rgba(139, 92, 246, 0.3)" }]}>
                <Text style={[styles.badgeText, { color: "#8B5CF6" }]}>Featured</Text>
              </View>
            )}
          </View>
        </GlassCard>

        {/* Metadata */}
        <Text style={styles.sectionTitle}>Details</Text>
        <GlassCard>
          <InfoRow label="Category" value={article.category} />
          {article.author && <InfoRow label="Author" value={article.author?.name || "Unknown"} />}
          <InfoRow label="Slug" value={article.slug} />
          {article.readTime != null && <InfoRow label="Read Time" value={`${article.readTime} min`} />}
          {article.views != null && <InfoRow label="Views" value={article.views} />}
          {article.likes != null && <InfoRow label="Likes" value={article.likes} />}
          {article.createdAt && <InfoRow label="Created" value={formatDate(article.createdAt)} />}
          {article.updatedAt && <InfoRow label="Updated" value={formatDate(article.updatedAt)} />}
          {article.publishedAt && <InfoRow label="Published" value={formatDate(article.publishedAt)} />}
        </GlassCard>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Tags</Text>
            <GlassCard>
              <View style={styles.tagsRow}>
                {article.tags.map((tag: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </>
        )}

        {/* Excerpt */}
        {article.excerpt ? (
          <>
            <Text style={styles.sectionTitle}>Excerpt</Text>
            <GlassCard>
              <Text style={styles.contentText}>{article.excerpt}</Text>
            </GlassCard>
          </>
        ) : null}

        {/* Content */}
        {article.content ? (
          <>
            <Text style={styles.sectionTitle}>Content</Text>
            <GlassCard>
              <Text style={styles.contentText}>{article.content}</Text>
            </GlassCard>
          </>
        ) : null}

        {/* Actions */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsWrap}>
          {article.status !== "archived" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: article.status === "published" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)" }]}
              onPress={handlePublishToggle}
            >
              <Ionicons name={article.status === "published" ? "eye-off-outline" : "eye-outline"} size={20} color={article.status === "published" ? "#F59E0B" : "#10B981"} />
              <Text style={[styles.actionBtnText, { color: article.status === "published" ? "#F59E0B" : "#10B981" }]}>
                {article.status === "published" ? "Unpublish" : "Publish"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "rgba(139, 92, 246, 0.15)" }]}
            onPress={handleToggleFeatured}
          >
            <Ionicons name={article.isFeatured ? "star" : "star-outline"} size={20} color="#8B5CF6" />
            <Text style={[styles.actionBtnText, { color: "#8B5CF6" }]}>
              {article.isFeatured ? "Unfeature" : "Feature"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>Delete Article</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {dialogElement}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  errorText: { color: "#EF4444", fontSize: 14, fontWeight: "600", marginTop: 12 },
  sectionTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "800", marginTop: 4 },

  articleTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "800" },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: "800", textTransform: "capitalize" },

  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.accent.goldSubtle },
  infoLabel: { color: "#94A3B8", fontSize: 12, fontWeight: "600", flex: 1 },
  infoValue: { color: "#F8FAFC", fontSize: 12, fontWeight: "700", flex: 1, textAlign: "right" },

  contentText: { color: "#CBD5E1", fontSize: 12, fontWeight: "500", lineHeight: 20 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: colors.accent.goldLight, borderWidth: 1, borderColor: colors.border.goldLight },
  tagText: { color: colors.accent.gold, fontSize: 12, fontWeight: "700" },

  actionsWrap: { gap: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border.goldLight },
  actionBtnText: { fontSize: 14, fontWeight: "800" },
});

