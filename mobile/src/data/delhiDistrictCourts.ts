// ─────────────────────────────────────────────────────────
// Delhi District Courts — Shared Data Structures
// Reused across the hierarchical navigation screens.
// ─────────────────────────────────────────────────────────

import type { Ionicons } from "@expo/vector-icons";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export interface DistrictService {
  readonly id: string;
  readonly title: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly description: string;
}

export interface District {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
}

export interface CourtComplex {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly districts: readonly District[];
}

// ─────────────────────────────────────────────────────────
// Constants — Reusable district services for all districts
// ─────────────────────────────────────────────────────────

export const DISTRICT_SERVICES: readonly DistrictService[] = [
  {
    id: "judges-list",
    title: "JUDGES LIST",
    icon: "people-outline",
    description: "View judge assignments and court contacts",
  },
  {
    id: "judges-on-leave",
    title: "Judges on Leave",
    icon: "umbrella-outline",
    description: "Judges currently on leave",
  },
  {
    id: "bail-roster",
    title: "Bail Roster",
    icon: "scale-outline",
    description: "Bail application roster",
  },
  {
    id: "duty-magistrate-roster",
    title: "Duty Magistrate Roster",
    icon: "shield-outline",
    description: "Duty magistrate schedule",
  },
  {
    id: "case-status-orders",
    title: "Case Status / Orders",
    icon: "folder-open-outline",
    description: "Track case status and view orders",
  },
  {
    id: "cause-list",
    title: "Cause List",
    icon: "list-outline",
    description: "Daily cause lists",
  },
] as const;

// ─────────────────────────────────────────────────────────
// Court Complexes with their districts
// ─────────────────────────────────────────────────────────

export const COURT_COMPLEXES: readonly CourtComplex[] = [
  {
    id: "rohini",
    title: "Rohini Court Complex",
    subtitle: "Rohini, Delhi",
    icon: "business-outline",
    districts: [
      {
        id: "north",
        title: "North District",
        subtitle: "Rohini Court Complex",
      },
      {
        id: "north-west",
        title: "North-West District",
        subtitle: "Rohini Court Complex",
      },
    ],
  },
  {
    id: "tis-hazari",
    title: "Tis Hazari Court Complex",
    subtitle: "Civil Lines, Delhi",
    icon: "business-outline",
    districts: [
      {
        id: "central",
        title: "Central District",
        subtitle: "Tis Hazari Court Complex",
      },
      {
        id: "civil-original",
        title: "Civil (Original) Jurisdiction",
        subtitle: "Tis Hazari Court Complex",
      },
    ],
  },
  {
    id: "saket",
    title: "Saket Court Complex",
    subtitle: "Saket, New Delhi",
    icon: "business-outline",
    districts: [
      {
        id: "south",
        title: "South District",
        subtitle: "Saket Court Complex",
      },
      {
        id: "south-east",
        title: "South-East District",
        subtitle: "Saket Court Complex",
      },
    ],
  },
  {
    id: "karkardooma",
    title: "Karkardooma Court Complex",
    subtitle: "Shahdara, Delhi",
    icon: "business-outline",
    districts: [
      {
        id: "east",
        title: "East District",
        subtitle: "Karkardooma Court Complex",
      },
      {
        id: "shahdara",
        title: "Shahdara District",
        subtitle: "Karkardooma Court Complex",
      },
      {
        id: "north-east",
        title: "North-East District",
        subtitle: "Karkardooma Court Complex",
      },
    ],
  },
  {
    id: "patiala-house",
    title: "Patiala House Court Complex",
    subtitle: "Copernicus Marg, New Delhi",
    icon: "business-outline",
    districts: [
      {
        id: "patiala-house-sessions",
        title: "Patiala House Sessions Division",
        subtitle: "Patiala House Court Complex",
      },
    ],
  },
  {
    id: "dwarka",
    title: "Dwarka Court Complex",
    subtitle: "Sector 10, Dwarka, New Delhi",
    icon: "business-outline",
    districts: [
      {
        id: "south-west",
        title: "South-West District",
        subtitle: "Dwarka Court Complex",
      },
    ],
  },
  {
    id: "rouse-avenue",
    title: "Rouse Avenue Court Complex",
    subtitle: "Rouse Avenue, New Delhi",
    icon: "business-outline",
    districts: [
      {
        id: "rouse-avenue-sessions",
        title: "Rouse Avenue Sessions Division",
        subtitle: "Rouse Avenue Court Complex",
      },
    ],
  },
] as const;

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

export function getComplexById(
  id: string,
): CourtComplex | undefined {
  return COURT_COMPLEXES.find((c) => c.id === id);
}

export function getDistrictById(
  complexId: string,
  districtId: string,
): District | undefined {
  const complex = getComplexById(complexId);
  if (!complex) return undefined;
  return complex.districts.find((d) => d.id === districtId);
}

