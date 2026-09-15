import React, { useCallback, useMemo, useState } from "react";
import { colors } from "@/theme/designSystem";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { getCases } from "@/services/caseApi";

import GlassCard from "@/components/ui/GlassCard";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function formatISODateOnly(d: Date) {
  // YYYY-MM-DD (local)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getGreeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function buildMonthGrid(base: Date) {
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay(); // 0=Sun

  // Start from Sunday of the first week
  const gridStart = addDays(first, -firstWeekday);
  const days: { date: Date; inMonth: boolean }[] = [];

  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    days.push({ date: d, inMonth: d.getMonth() === month });
  }
  return days;
}

type CourtItem = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  place?: string;
  type: "Hearing" | "Task";
  status?: string;
};

export default function CourtDiary() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [monthCursor, setMonthCursor] = useState<Date>(new Date(today));
  const [rawCases, setRawCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCases({ query: { limit: 100 } });
      setRawCases(Array.isArray(res?.cases) ? res.cases : []);
    } catch {
      setRawCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCases();
    }, [fetchCases])
  );

  // Derive real hearing items from active cases with upcoming hearing dates
  const items: CourtItem[] = useMemo(() => {
    return rawCases
      .filter((c) => !!c.nextHearingDate)
      .map((c) => {
        const d = new Date(c.nextHearingDate);
        const valid = !Number.isNaN(d.getTime());
        const dateStr = valid ? formatISODateOnly(d) : "";
        const timeStr = valid
          ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "";
        return {
          id: String(c._id || c.id),
          date: dateStr,
          time: timeStr,
          title: c.caseTitle || `Case #${c.caseNumber || "Untitled"}`,
          place: c.court || "Court",
          type: "Hearing" as const,
          status: c.status || "Scheduled",
        };
      })
      .filter((it) => !!it.date);
  }, [rawCases]);

  const greeting = useMemo(() => getGreeting(), []);

  const selectedISO = useMemo(() => formatISODateOnly(selectedDate), [
    selectedDate,
  ]);

  const monthLabel = useMemo(() => {
    return monthCursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [monthCursor]);

  const monthGrid = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  const selectedItems = useMemo(() => {
    return items
      .filter((x) => x.date === selectedISO)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [items, selectedISO]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <GlassCard borderColor={colors.border.gold} accent={colors.accent.gold}>
        <View style={styles.headerRow}>
          <View style={styles.badgeIcon}>
            <Ionicons name="time-outline" size={20} color="#D4AF37" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{greeting}</Text>
            <Text style={styles.headerSub}>Court Diary • Calendar</Text>
          </View>
          <Pressable
            onPress={() => router.push("/cases")}
            style={styles.quickBtn}
          >
            <Ionicons name="briefcase-outline" size={16} color={colors.accent.gold} />
            <Text style={styles.quickBtnText}>Cases</Text>
          </Pressable>
        </View>
      </GlassCard>

      {/* Month picker */}
      <View style={styles.monthTopRow}>
        <Pressable
          onPress={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          style={styles.navBtn}
        >
          <Ionicons name="chevron-back" size={18} color={colors.accent.gold} />
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable
          onPress={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          style={styles.navBtn}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.accent.gold} />
        </Pressable>
      </View>

      <GlassCard borderColor={colors.border.gold} accent={colors.accent.gold}>
        <View style={styles.weekdaysRow}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((w) => (
            <Text key={w} style={styles.weekday}>
              {w}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {monthGrid.map(({ date, inMonth }, idx) => {
            const iso = formatISODateOnly(date);
            const active = iso === selectedISO;
            return (
              <Pressable
                key={`${iso}-${idx}`}
                onPress={() => setSelectedDate(date)}
                style={[
                  styles.dayCell,
                  !inMonth ? { opacity: 0.35 } : null,
                  active ? styles.dayCellActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    active ? styles.dayTextActive : null,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </GlassCard>

      {/* Agenda */}
      <Text style={styles.sectionHeader}>Agenda • {selectedISO}</Text>
      <GlassCard borderColor={colors.border.gold} accent={colors.accent.gold}>
        {selectedItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="calendar-outline" size={18} color={colors.accent.gold} />
            <Text style={styles.emptyText}>No hearings/tasks scheduled for this day.</Text>
          </View>
        ) : (
          selectedItems.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <View
                style={[
                  styles.itemIcon,
                  it.type === "Hearing" ? { backgroundColor: colors.border.goldLight } : { backgroundColor: "rgba(148,163,184,0.14)" },
                ]}
              >
                <Ionicons
                  name={it.type === "Hearing" ? "time-outline" : "checkmark-circle-outline"}
                  size={18}
                  color={it.type === "Hearing" ? "#D4AF37" : "#94A3B8"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {it.title}
                </Text>
                <Text style={styles.itemSub}>
                  {it.time ? `${it.time} • ` : ""}
                  {it.place || ""}
                </Text>
              </View>
              {it.status ? (
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText} numberOfLines={1}>
                    {it.status}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </GlassCard>

      {/* Quick Add (UI only for now) */}
      <Text style={styles.sectionHeader}>Quick Add</Text>
      <GlassCard borderColor={colors.border.gold} accent={colors.accent.gold}>
        <View style={styles.addRow}>
          <View style={styles.addCol}>
            <Text style={styles.addLabel}>Type</Text>
            <View style={styles.pickerRow}>
              <Ionicons name="time-outline" size={16} color="#D4AF37" />
              <Text style={styles.pickerText}>Hearing</Text>
            </View>
          </View>
          <View style={styles.addCol}>
            <Text style={styles.addLabel}>Date</Text>
            <Text style={styles.addValue}>{selectedISO}</Text>
          </View>
        </View>

        <View style={styles.formRow}>
          <TextInput
            placeholder="Hearing / task title"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            editable={false}
            value={"(Connect to backend in next iteration)"}
          />
        </View>

        <Pressable style={styles.ctaBtn} onPress={() => router.push("/cases/new")}> 
          <Ionicons name="add-circle-outline" size={18} color={colors.bg.primary} />
          <Text style={styles.ctaText}>Add via Case Diary</Text>
        </Pressable>
      </GlassCard>

      <View style={{ height: 22 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 110,
    backgroundColor: colors.bg.primary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: colors.border.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
  },
  headerSub: {
    color: "#B0B4BA",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.gold,
    backgroundColor: colors.accent.goldLight,
  },
  quickBtnText: {
    color: colors.accent.gold,
    fontWeight: "800",
    fontSize: 12,
  },

  monthTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.gold,
    backgroundColor: colors.accent.goldSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
  },

  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  weekday: {
    color: "rgba(248,250,252,0.75)",
    fontWeight: "800",
    fontSize: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayCell: {
    width: "14.2%",
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: colors.accent.goldLight,
    marginBottom: 10,
  },
  dayCellActive: {
    backgroundColor: colors.accent.goldLight,
    borderColor: colors.border.gold,
  },
  dayText: {
    color: "rgba(248,250,252,0.75)",
    fontWeight: "800",
    fontSize: 12,
  },
  dayTextActive: {
    color: "#D4AF37",
  },

  sectionHeader: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
    marginTop: 4,
  },

  emptyWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
  },
  emptyText: {
    color: "rgba(248,250,252,0.75)",
    fontWeight: "800",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent.goldLight,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.accent.goldLight,
  },
  itemTitle: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "800",
  },
  itemSub: {
    color: "rgba(248,250,252,0.72)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: colors.border.goldLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: 120,
  },
  statusPillText: {
    color: "#D4AF37",
    fontWeight: "800",
    fontSize: 10,
  },

  addRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingBottom: 10,
  },
  addCol: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.accent.goldLight,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    padding: 10,
  },
  addLabel: {
    color: "rgba(248,250,252,0.70)",
    fontWeight: "800",
    fontSize: 12,
  },
  addValue: {
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 12,
    marginTop: 6,
  },
  pickerRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pickerText: {
    color: "#D4AF37",
    fontWeight: "800",
    fontSize: 12,
  },

  formRow: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.accent.goldLight,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#F8FAFC",
    fontWeight: "800",
  },
  ctaBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#D4AF37",
  },
  ctaText: {
    color: colors.bg.primary,
    fontWeight: "1000" as any,
    fontSize: 14,
    letterSpacing: 0.2,
  },
});

