import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

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

  // Placeholder items for UI scaffolding.
  // In next iteration, wire to backend + cases (nextHearingDate) + diary events.
  const items: CourtItem[] = useMemo(() => {
    const t0 = formatISODateOnly(today);
    const t1 = formatISODateOnly(addDays(today, 1));
    const t2 = formatISODateOnly(addDays(today, 2));
    const t3 = formatISODateOnly(addDays(today, 5));

    return [
      {
        id: "h1",
        date: t0,
        time: "10:30 AM",
        title: "Criminal Case (High Court)",
        place: "High Court",
        type: "Hearing",
        status: "Scheduled",
      },
      {
        id: "h2",
        date: t0,
        time: "02:00 PM",
        title: "Writ Petition (District Court)",
        place: "District Court",
        type: "Hearing",
        status: "Pending",
      },
      {
        id: "t1",
        date: t0,
        time: "",
        title: "Draft appearance memo",
        place: "Supreme Court Registry",
        type: "Task",
        status: "To-do",
      },
      {
        id: "t2",
        date: t1,
        time: "",
        title: "Collect client documents",
        place: "Case #1042",
        type: "Task",
        status: "To-do",
      },
      {
        id: "h3",
        date: t2,
        time: "11:15 AM",
        title: "Civil Appeal (High Court)",
        place: "High Court",
        type: "Hearing",
        status: "Reserved",
      },
      {
        id: "t3",
        date: t3,
        time: "",
        title: "Prepare written submissions",
        place: "District Court",
        type: "Task",
        status: "To-do",
      },
    ];
  }, [today]);

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
      <GlassCard borderColor="rgba(181, 141, 61, 0.35)" accent="#B58D3D">
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
            <Ionicons name="briefcase-outline" size={16} color="#B58D3D" />
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
          <Ionicons name="chevron-back" size={18} color="#B58D3D" />
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable
          onPress={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          style={styles.navBtn}
        >
          <Ionicons name="chevron-forward" size={18} color="#B58D3D" />
        </Pressable>
      </View>

      <GlassCard borderColor="rgba(181, 141, 61, 0.25)" accent="#B58D3D">
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
      <GlassCard borderColor="rgba(181, 141, 61, 0.25)" accent="#B58D3D">
        {selectedItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="calendar-outline" size={18} color="#B58D3D" />
            <Text style={styles.emptyText}>No hearings/tasks scheduled for this day.</Text>
          </View>
        ) : (
          selectedItems.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <View
                style={[
                  styles.itemIcon,
                  it.type === "Hearing" ? { backgroundColor: "rgba(181,141,61,0.12)" } : { backgroundColor: "rgba(148,163,184,0.14)" },
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
      <GlassCard borderColor="rgba(181, 141, 61, 0.25)" accent="#B58D3D">
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
          <Ionicons name="add-circle-outline" size={18} color="#0B0B0B" />
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
    backgroundColor: "#0B0B0B",
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
    backgroundColor: "rgba(181,141,61,0.12)",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
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
    borderColor: "rgba(181,141,61,0.25)",
    backgroundColor: "rgba(181,141,61,0.10)",
  },
  quickBtnText: {
    color: "#B58D3D",
    fontWeight: "900",
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
    borderColor: "rgba(181,141,61,0.25)",
    backgroundColor: "rgba(181,141,61,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "900",
  },

  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  weekday: {
    color: "rgba(248,250,252,0.75)",
    fontWeight: "900",
    fontSize: 11,
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
    borderColor: "rgba(181,141,61,0.14)",
    marginBottom: 10,
  },
  dayCellActive: {
    backgroundColor: "rgba(181,141,61,0.18)",
    borderColor: "rgba(181,141,61,0.55)",
  },
  dayText: {
    color: "rgba(248,250,252,0.75)",
    fontWeight: "900",
    fontSize: 12,
  },
  dayTextActive: {
    color: "#D4AF37",
  },

  sectionHeader: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "900",
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
    borderBottomColor: "rgba(181,141,61,0.10)",
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.18)",
  },
  itemTitle: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "900",
  },
  itemSub: {
    color: "rgba(248,250,252,0.72)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: "rgba(181,141,61,0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.50)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: 120,
  },
  statusPillText: {
    color: "#D4AF37",
    fontWeight: "900",
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
    borderColor: "rgba(181,141,61,0.16)",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    padding: 10,
  },
  addLabel: {
    color: "rgba(248,250,252,0.70)",
    fontWeight: "900",
    fontSize: 11,
  },
  addValue: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 13,
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
    fontWeight: "900",
    fontSize: 13,
  },

  formRow: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.16)",
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
    color: "#0B0B0B",
    fontWeight: "1000" as any,
    fontSize: 14,
    letterSpacing: 0.2,
  },
});

