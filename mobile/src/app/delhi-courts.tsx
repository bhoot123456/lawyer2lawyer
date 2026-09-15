import React from "react";
import { colors } from "@/theme/designSystem";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { blurActiveElement } from "@/utils/blurActiveElement";
import { openCaseHistory, openCurrentRoster, openJudgments, openOrders } from "@/utils/openOfficialCourtLink";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";

const PHYSICAL_DISPLAY_BOARD_URL =
  "https://delhihighcourt.nic.in/app/physical-display-board";

const DISPLAY_BOARD_UNAVAILABLE = {
  title: "Unable to Open Display Board",
  message:
    "The Official Delhi High Court Physical Display Board is currently unavailable. Please try again later.",
} as const;

type QuickService = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  url: string | null;
};

type CourtInfo = {
  name: string;
  address: string;
  googleMapUrl: string;
  filingCounter: string;
  workingHours: string;
  practiceNotes: string;
  courtFees: string;
  causeListUrl: string;
  quickServices: QuickService[];
};

function LinkRow({
  label,
  url,
}: {
  label: string;
  url: string;
}) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      style={({ pressed }) => [
        styles.linkRow,
        pressed ? { opacity: 0.92 } : null,
      ]}
    >
      <Ionicons name="link-outline" size={16} color={colors.accent.gold} />
      <Text style={styles.linkLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.linkHost} numberOfLines={1}>
        {url.replace(/^https?:\/\//, "")}
      </Text>
    </Pressable>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

type DisplayBoardOpener = () => void;

function ServiceCard({
  title,
  icon,
  url,
  courtId,
  courtName,
  onDisplayBoard,
  onNotice,
}: QuickService & { courtId?: string; courtName?: string; onDisplayBoard: DisplayBoardOpener; onNotice: (opts: { title: string; message: string }) => void }) {
  return (
    <Pressable
      onPress={() => {
        if (title === "REGULAR COURT" && courtId) {
          blurActiveElement();
          router.push({
            pathname: "/regular-court",
            params: { courtId, courtName },
          });
        } else if (title === "REGISTRAR  COURT" && courtId) {
          blurActiveElement();
          router.push({
            pathname: "/registrar-court",
            params: { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar" },
          });
        } else if (title === "PHYSICAL DISPLAY BOARD") {
          blurActiveElement();
          onDisplayBoard();
        } else if (title === "CURRENT ROSTER") {
          openCurrentRoster();
        } else if (title === "CASE HISTORY") {
          openCaseHistory();
        } else if (title === "ORDERS") {
          openOrders();
        } else if (title === "JUDGEMENTS") {
          openJudgments();
        } else if (url) {
          Linking.openURL(url);
        } else {
          onNotice({ title: "Coming Soon", message: "This feature will be available soon." });
        }
      }}
      style={({ pressed }) => [
        styles.serviceCard,
        pressed ? { opacity: 0.85, transform: [{ scale: 0.98 }] } : undefined,
      ]}
    >
      <View style={styles.serviceContent}>
        <View style={styles.serviceIcon}>
          <Ionicons name={icon} size={30} color={colors.accent.gold} />
        </View>
        <Text style={styles.serviceTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={30} color={colors.accent.gold} />
    </Pressable>
  );
}

function createQuickServices(causeListUrl: string): QuickService[] {
  return [
    { title: "REGULAR COURT", icon: "business-outline", url: null },
    { title: "REGISTRAR  COURT", icon: "journal-outline", url: null },
    { title: "PHYSICAL DISPLAY BOARD", icon: "tv-outline", url: null },
    { title: "CURRENT ROSTER", icon: "people-outline", url: null },
    { title: "DAILY CAUSE LIST", icon: "list-outline", url: "https://delhihighcourt.nic.in/web/cause-lists/cause-list" },
    { title: "CASE HISTORY", icon: "folder-open-outline", url: null },
    { title: "ORDERS", icon: "document-text-outline", url: null },
    { title: "JUDGEMENTS", icon: "scale-outline", url: null },
    { title: "E-Gate PASS", icon: "key-outline", url: null },
    { title: "E-FILING PORTAL", icon: "cloud-upload-outline", url: null },
  ];
}

const DELHI_COURTS: (CourtInfo & { id: string })[] = [
  // NOTE: This list must keep ids unique; duplicates will trigger React key warnings.

  {
    id: "delhi-high-court",
    name: "Delhi High Court",
    address:
      "Sher Shah Suri Marg, Bhagwan Das Lane, New Delhi, Delhi 110503",
    googleMapUrl:
      "https://www.google.com/maps/search/?api=1&query=Delhi+High+Court",
    filingCounter:
      "Filing counters are located at the High Court filing/billing section (Registry). Verify at the relevant Filing/Registry desk for your case type.",
    workingHours:
      "Generally 10:00 AM to 5:00 PM on working days (subject to court notifications).",
    practiceNotes:
      "Carry an original/copies set as required, follow cause-list timing norms, and check the court notice boards / e-notifications for updates.",
    courtFees:
      "Court fees generally as per Delhi High Court e-filing / stamp duty rules and applicable Court Fees Act notifications (varies by document/case type).",
    causeListUrl:
      "https://delhihighcourt.nic.in/web/cause-lists",
    quickServices: createQuickServices("https://delhihighcourt.nic.in/"),
  },
  // {
  //   id: "tis-hazari-courts",
  //   name: "Tis Hazari Courts",
  //   address:
  //     "Tis Hazari, Civil Lines, Delhi 110054",
  //   googleMapUrl:
  //     "https://www.google.com/maps/search/?api=1&query=Tis+Hazari+Courts",
  //   filingCounter:
  //     "District Courts Registry/filing counters at Tis Hazari (ensure you file in the correct establishment and counter for the category of case).",
  //   workingHours:
  //     "Generally 10:00 AM to 5:00 PM on working days (subject to duty roster).",
  //   practiceNotes:
  //     "Confirm filing counter and case category at entry/registry desk; keep receipt of filing and check causelist for the specific court number/branch.",
  //   courtFees:
  //     "Court fees as per district courts rules/notifications; confirm current fee schedule at the filing counter for your document type.",
  //   causeListUrl:
  //     "https://districts.ecourts.gov.in/delhi",
  //   quickServices: createQuickServices("https://districts.ecourts.gov.in/delhi"),
  // },
  // {
  //   id: "saket-courts",
  //   name: "Saket Courts",
  //   address:
  //     "District Courts Complex, Saket, New Delhi, Delhi 110017",
  //   googleMapUrl:
  //     "https://www.google.com/maps/search/?api=1&query=Saket+Courts+District+Courts+Complex+Delhi",
  //   filingCounter:
  //     "District Courts filing/registry counters within the Saket Court complex (verify correct counter/branch for your case).",
  //   workingHours:
  //     "Generally 10:00 AM to 5:00 PM on working days (subject to court roster).",
  //   practiceNotes:
  //     "Use the correct court/branch for filings; check the cause-list for the relevant court/section and verify hearing time on the day.",
  //   courtFees:
  //     "Court fees as per district courts notifications and document-specific requirements; verify current fees at counter/receipt.",
  //   causeListUrl:
  //     "https://districts.ecourts.gov.in/delhi",
  //   quickServices: createQuickServices("https://districts.ecourts.gov.in/delhi"),
  // },
  // {
  //   id: "rohini-courts",
  //   name: "Rohini Courts",
  //   address:
  //     "Rohini Courts Complex, Sector 7, Rohini, Delhi 110085",
  //   googleMapUrl:
  //     "https://www.google.com/maps/search/?api=1&query=Rohini+Courts+Complex+Delhi",
  //   filingCounter:
  //     "District Courts registry/filing counters inside the Rohini Courts complex. Ensure correct filing window for your case category.",
  //   workingHours:
  //     "Generally 10:00 AM to 5:00 PM on working days (subject to scheduling).",
  //   practiceNotes:
  //     "Carry filing checklist items (copies, process fees if applicable). Verify cause-list and court number/branch before reaching.",
  //   courtFees:
  //     "Court fees vary by case/document; confirm the latest schedule at the filing counter/receipt desk.",
  //   causeListUrl:
  //     "https://districts.ecourts.gov.in/delhi",
  //   quickServices: createQuickServices("https://districts.ecourts.gov.in/delhi"),
  // },
  // {
  //   id: "patiala-house-courts",
  //   name: "Patiala House Courts",
  //   address:
  //     "Patiala House Courts, Copernicus Marg, New Delhi, Delhi 110001",
  //   googleMapUrl:
  //     "https://www.google.com/maps/search/?api=1&query=Patiala+House+Courts",
  //   filingCounter:
  //     "District Courts/Registry filing counters at Patiala House (file through the correct counter for your case type).",
  //   workingHours:
  //     "Generally 10:00 AM to 5:00 PM on working days (subject to court roster).",
  //   practiceNotes:
  //     "Check entry instructions for the court complex; keep your order/previous diary entries for quicker verification.",
  //   courtFees:
  //     "Court fees as per prevailing district court rules and stamp/court fee requirements; confirm current fee at counter.",
  //   causeListUrl:
  //     "https://districts.ecourts.gov.in/delhi",
  //   quickServices: createQuickServices("https://districts.ecourts.gov.in/delhi"),
  // },
  // {
  //   id: "karkardooma-courts",
  //   name: "Karkardooma Courts",
  //   address:
  //     "Karkardooma Courts Complex, Shahdara, Delhi 110032",
  //   googleMapUrl:
  //     "https://www.google.com/maps/search/?api=1&query=Karkardooma+Courts",
  //   filingCounter:
  //     "District Courts registry/filing counters within Karkardooma (ensure correct establishment and counter).",
  //   workingHours:
  //     "Generally 10:00 AM to 5:00 PM on working days (subject to duty roster).",
  //   practiceNotes:
  //     "Keep sufficient copies for submissions; verify branch/court number from the causelist before filing/appearance.",
  //   courtFees:
  //     "Court fees as per notifications; verify by counter/receipt desk for your document/case type.",
  //   causeListUrl:
  //     "https://districts.ecourts.gov.in/delhi",
  //   quickServices: createQuickServices("https://districts.ecourts.gov.in/delhi"),
  // },
  // {
  //   id: "dwarka-courts-1",
  //   name: "Dwarka Courts",
  //   address:
  //     "District Courts Complex, Sector 10, Dwarka, New Delhi, Delhi 110075",
  //   googleMapUrl:
  //     "https://www.google.com/maps/search/?api=1&query=Dwarka+Courts+District+Courts+Complex+Delhi",
  //   filingCounter:
  //     "District Courts filing/registry counters in the Dwarka Court complex. Use the correct counter for your matter.",
  //   workingHours:
  //     "Generally 10:00 AM to 5:00 PM on working days (subject to scheduling).",
  //   practiceNotes:
  //     "Confirm case number/branch details at registry; check causelist for your assigned court and reporting time.",
  //   courtFees:
  //     "Court fees as per district courts schedule; confirm current amount at filing counter.",
  //   causeListUrl:
  //     "https://districts.ecourts.gov.in/delhi",
  //   quickServices: createQuickServices("https://districts.ecourts.gov.in/delhi"),
  // },
  // // {
  //   id: "patiala-house-courts-2",
  //   name: "Patiala House Courts",
  //   address:
  //     "Patiala House Courts, Copernicus Marg, New Delhi, Delhi 110001",
  //   googleMapUrl:
  //     "https://www.google.com/maps/search/?api=1&query=Patiala+House+Courts",
  //   filingCounter:
  //     "District Courts/Registry filing counters at Patiala House (file through the correct counter for your case type).",
  //   workingHours:
  //     "Generally 10:00 AM to 5:00 PM on working days (subject to court roster).",
  //   practiceNotes:
  //     "Check entry instructions for the court complex; keep your order/previous diary entries for quicker verification.",
  //   courtFees:
  //     "Court fees as per prevailing district court rules and stamp/court fee requirements; confirm current fee at counter.",
  //   causeListUrl:
  //     "https://districts.ecourts.gov.in/delhi",
  // },
  // {
  //   id: "karkardooma-courts-2",
  //   name: "Karkardooma Courts",
  //   address:
  //     "Karkardooma Courts Complex, Shahdara, Delhi 110032",
  //   googleMapUrl:
  //     "https://www.google.com/maps/search/?api=1&query=Karkardooma+Courts",
  //   filingCounter:
  //     "District Courts registry/filing counters within Karkardooma (ensure correct establishment and counter).",
  //   workingHours:
  //     "Generally 10:00 AM to 5:00 PM on working days (subject to duty roster).",
  //   practiceNotes:
  //     "Keep sufficient copies for submissions; verify branch/court number from the causelist before filing/appearance.",
  //   courtFees:
  //     "Court fees as per notifications; verify by counter/receipt desk for your document/case type.",
  //   causeListUrl:
  //     "https://districts.ecourts.gov.in/delhi",
  // },
  // {
  //   id: "dwarka-courts-2",
  //   name: "Dwarka Courts",
  //   address:
  //     "District Courts Complex, Sector 10, Dwarka, New Delhi, Delhi 110075",
  //   googleMapUrl:
  //     "https://www.google.com/maps/search/?api=1&query=Dwarka+Courts+District+Courts+Complex+Delhi",
  //   filingCounter:
  //     "District Courts filing/registry counters in the Dwarka Court complex. Use the correct counter for your matter.",
  //   workingHours:
  //     "Generally 10:00 AM to 5:00 PM on working days (subject to scheduling).",
  //   practiceNotes:
  //     "Confirm case number/branch details at registry; check causelist for your assigned court and reporting time.",
  //   courtFees:
  //     "Court fees as per district courts schedule; confirm current amount at filing counter.",
  //   causeListUrl:
  //     "https://districts.ecourts.gov.in/delhi",
  // },
  // {
  //   name: "Rouse Avenue Courts",
  //   address:
  //     "Rouse Avenue Courts Complex, New Delhi, Delhi 110002",
  //   googleMapUrl:
  //     "https://www.google.com/maps/search/?api=1&query=Rouse+Avenue+Courts+Complex+Delhi",
  //   filingCounter:
  //     "Filing counters inside Rouse Avenue Courts complex (verify correct registry/counter for case category).",
  //   workingHours:
  //     "Generally 10:00 AM to 5:00 PM on working days (subject to roster).",
  //   practiceNotes:
  //     "Keep receipts and reference numbers; check causelist for exact court/bench before appearance.",
  //   courtFees:
  //     "Court fees as per prevailing rules; confirm current fee at filing desk/receipt counter.",
  //   causeListUrl:
  //     "https://districts.ecourts.gov.in/delhi",
  // },
];

export default function DelhiCourtsScreen() {
  // Cross-platform notice dialogs (Alert.alert is a no-op on web).
  const { notice: noticeDialog, element: dialogElement } = useConfirmDialog();

  const openPhysicalDisplayBoard = async (): Promise<void> => {
    try {
      const canOpen = await Linking.canOpenURL(PHYSICAL_DISPLAY_BOARD_URL);
      if (!canOpen) {
        noticeDialog({ ...DISPLAY_BOARD_UNAVAILABLE });
        return;
      }
      try {
        await WebBrowser.openBrowserAsync(PHYSICAL_DISPLAY_BOARD_URL);
      } catch {
        await Linking.openURL(PHYSICAL_DISPLAY_BOARD_URL);
      }
    } catch {
      noticeDialog({ ...DISPLAY_BOARD_UNAVAILABLE });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>DELHI-HIGH-COURT</Text>
          <Text style={styles.subtitle}>
            Address, Google Maps, filing counter, working hours, practice notes, court fees,
            and cause-list links for key Delhi courts.
          </Text>
        </View>

        {DELHI_COURTS.map((c) => (
          <View key={c.id} style={styles.card}>
            <Text style={styles.courtName}>{c.name}</Text>

            <Field label="Address" value={c.address} />
            <View style={{ height: 6 }} />

            <View style={styles.linksBlock}>
              <LinkRow label="Google Map" url={c.googleMapUrl} />
              <LinkRow label="Cause List" url={c.causeListUrl} />
            </View>

            <View style={styles.serviceSection}>
              <Text style={styles.serviceSectionTitle}>Quick Services</Text>
              {c.quickServices.map((service) => (
                <ServiceCard
                  key={service.title}
                  {...service}
                  courtId={c.id}
                  courtName={c.name}
                  onDisplayBoard={() => void openPhysicalDisplayBoard()}
                  onNotice={(opts) => void noticeDialog(opts)}
                />
              ))}
            </View>

            <Field label="Filing Counter" value={c.filingCounter} />
            <Field label="Working Hours" value={c.workingHours} />
            <Field label="Practice Notes" value={c.practiceNotes} />
            <Field label="Court Fees" value={c.courtFees} />
          </View>
        ))}

        <View style={styles.footerHint}>
          <Ionicons name="information-circle-outline" size={16} color={colors.accent.gold} />
          <Text style={styles.footerHintText}>
            Information is indicative—always verify latest fee/counter/working-hour instructions from the court registry.
          </Text>
        </View>
      </ScrollView>
      {dialogElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6" },
  body: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },

  headerBlock: { marginTop: 10, marginBottom: 4 },
  title: {
    color: "#1E293B",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EAE5DB",
    gap: 10,
  },
  courtName: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "800",
  },

  serviceSection: {
    gap: 8,
    marginTop: 2,
  },
  serviceSectionTitle: {
    color: colors.accent.gold,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#EAE5DB",
  },
  serviceContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  serviceIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.accent.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTitle: {
    color: "#1E293B",
    fontSize: 12,
    fontWeight: "800",
    flex: 1,
  },

  field: {
    gap: 4,
  },
  fieldLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
  },
  fieldValue: {
    color: "#1E293B",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },

  linksBlock: {
    gap: 10,
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#EAE5DB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.accent.goldSubtle,
  },
  linkLabel: {
    color: colors.accent.gold,
    fontSize: 12,
    fontWeight: "800",
    minWidth: 90,
  },
  linkHost: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
    flex: 1,
  },

  footerHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: "#EAE5DB",
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.55)",
    marginTop: 6,
  },
  footerHintText: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
    flex: 1,
  },
});

