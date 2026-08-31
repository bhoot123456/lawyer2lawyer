import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "@/components/Navbar";
import { api } from "@/services/api";
import {
  StatisticsHeader,
  TribunalsSearchBar,
  TribunalCard,
  SectionHeader,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from "@/components/tribunals";
import { colors, radii, shadows, spacing } from "@/theme/designSystem";

type Tribunal = {
  _id?: string;
  principalBench?: boolean;
  name?: string;
  abbreviation?: string;
  category?: string;
  jurisdiction?: string;
  description?: string;
  location?: string;
  website?: string;
  subCategory?: string;
  tribunalType?: string;
  jurisdictionLevel?: string;
  state?: string;
  district?: string;
  benchType?: string;
  benchName?: string;
  benchCode?: string;
  address?: string;
  city?: string;
  pincode?: string;
  email?: string;
  phone?: string;
  fax?: string;
  googleMapsLink?: string;
  workingDays?: string;
  workingHours?: string;
  filingMode?: string;
  eFilingAvailable?: boolean;
  videoConferenceAvailable?: boolean;
  causeListLink?: string;
  ordersLink?: string;
  judgmentsLink?: string;
  notificationsLink?: string;
  circularsLink?: string;
  formsLink?: string;
  rulesLink?: string;
  governingActLink?: string;
  governingAct?: string;
  isFeatured?: boolean;
  lastVerifiedAt?: string;
};

const CATEGORY_META: Record<
  string,
  { title: string; description: string; icon: string }
> = {
  National: {
    title: "National Tribunals",
    description: "Principal tribunals with jurisdiction across India.",
    icon: "globe-outline",
  },
  Delhi: {
    title: "Delhi State Tribunals",
    description: "State-level tribunals seated in Delhi.",
    icon: "location-outline",
  },
  District: {
    title: "District Tribunals",
    description: "District-level judicial tribunals and authorities.",
    icon: "map-outline",
  },
  Consumer: {
    title: "Consumer Commissions",
    description: "National, state and district consumer redressal commissions.",
    icon: "people-outline",
  },
  Quasi: {
    title: "Quasi Judicial Authorities",
    description: "Specialised quasi-judicial bodies and tribunals.",
    icon: "shield-checkmark-outline",
  },
};

const SORT_OPTIONS = [
  { label: "Alphabetical", value: "alpha" },
  { label: "Recently Verified", value: "recent" },
  { label: "Featured", value: "featured" },
  { label: "Jurisdiction Level", value: "jurisdiction" },
] as const;

const BOOLEAN_FILTERS = [
  { label: "e-Filing", value: "eFiling", icon: "document-text-outline" },
  { label: "Video Conference", value: "video", icon: "videocam-outline" },
];

const JURISDICTION_LEVELS = ["National", "State", "District"] as const;

type ChipVariant = "sort" | "filter" | "advanced";

type ChipProps = {
  label: string;
  icon?: string;
  active?: boolean;
  variant?: ChipVariant;
  onPress: () => void;
  accessibilityHint?: string;
};

const Chip = React.memo(function Chip({
  label,
  icon,
  active = false,
  variant = "filter",
  onPress,
  accessibilityHint,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.chip,
        variant === "sort" && styles.chipVariantSort,
        variant === "filter" && styles.chipVariantFilter,
        variant === "advanced" && styles.chipVariantAdvanced,
        active && styles.chipActive,
        pressed && styles.chipPressed,
      ]}
    >
      {icon ? <Ionicons name={icon as any} size={14} color={active ? colors.accent.gold : colors.text.muted} /> : null}
      <Text
        style={[
          styles.chipText,
          variant === "sort" && styles.chipTextSort,
          variant === "filter" && styles.chipTextFilter,
          variant === "advanced" && styles.chipTextAdvanced,
          active && styles.chipTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
});

type ActiveFilterChipProps = {
  label: string;
  onClear: () => void;
};

const ActiveFilterChip = React.memo(function ActiveFilterChip({
  label,
  onClear,
}: ActiveFilterChipProps) {
  return (
    <Pressable
      onPress={onClear}
      accessibilityRole="button"
      accessibilityLabel={`Clear ${label} filter`}
      style={styles.activeFilterChip}
    >
      <Text style={styles.activeFilterText}>{label}</Text>
      <Ionicons name="close" size={14} color={colors.accent.gold} />
    </Pressable>
  );
});

type ActiveFiltersProps = {
  jurisdictionFilter: string | null;
  stateFilter: string | null;
  districtFilter: string | null;
  eFilingFilter: boolean | null;
  videoFilter: boolean | null;
  featuredFilter: boolean | null;
  onJurisdictionChange: (value: string | null) => void;
  onStateChange: (value: string | null) => void;
  onDistrictChange: (value: string | null) => void;
  onEFilingChange: (value: boolean | null) => void;
  onVideoChange: (value: boolean | null) => void;
  onFeaturedChange: (value: boolean | null) => void;
  onResetFilters: () => void;
};

const ActiveFilters = React.memo(function ActiveFilters({
  jurisdictionFilter,
  stateFilter,
  districtFilter,
  eFilingFilter,
  videoFilter,
  featuredFilter,
  onJurisdictionChange,
  onStateChange,
  onDistrictChange,
  onEFilingChange,
  onVideoChange,
  onFeaturedChange,
  onResetFilters,
}: ActiveFiltersProps) {
  return (
    <View style={styles.activeFiltersRow}>
      <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.activeFiltersContainer}>
          {jurisdictionFilter ? (
            <ActiveFilterChip
              label={jurisdictionFilter}
              onClear={() => onJurisdictionChange(null)}
            />
          ) : null}
          {stateFilter ? (
            <ActiveFilterChip label={stateFilter} onClear={() => onStateChange(null)} />
          ) : null}
          {districtFilter ? (
            <ActiveFilterChip label={districtFilter} onClear={() => onDistrictChange(null)} />
          ) : null}
          {eFilingFilter === true ? (
            <ActiveFilterChip label="e-Filing" onClear={() => onEFilingChange(null)} />
          ) : null}
          {videoFilter === true ? (
            <ActiveFilterChip label="Video Conference" onClear={() => onVideoChange(null)} />
          ) : null}
          {featuredFilter === true ? (
            <ActiveFilterChip label="Featured" onClear={() => onFeaturedChange(null)} />
          ) : null}
          <Pressable
            onPress={onResetFilters}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
            style={styles.clearAllFiltersButton}
          >
            <Text style={styles.clearAllFiltersText}>Clear All</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
});

type AdvancedFiltersProps = {
  jurisdictionFilter: string | null;
  onJurisdictionChange: (value: string | null) => void;
  stateFilter: string | null;
  onStateChange: (value: string | null) => void;
  uniqueStates: string[];
};

const AdvancedFilters = React.memo(function AdvancedFilters({
  jurisdictionFilter,
  onJurisdictionChange,
  stateFilter,
  onStateChange,
  uniqueStates,
}: AdvancedFiltersProps) {
  return (
    <View style={styles.advancedFiltersToggle}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.advancedFiltersContainer}>
          <Text style={styles.advancedFiltersLabel}>Jurisdiction:</Text>
          {JURISDICTION_LEVELS.map((level) => (
            <Chip
              key={`level-${level}`}
              label={level}
              variant="advanced"
              active={jurisdictionFilter === level}
              onPress={() =>
                onJurisdictionChange(jurisdictionFilter === level ? null : level)
              }
            />
          ))}
          {uniqueStates.slice(0, 5).map((state) => (
            <Chip
              key={`state-${state}`}
              label={state}
              variant="advanced"
              active={stateFilter === state}
              onPress={() => onStateChange(stateFilter === state ? null : state)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
});

type FilterBarProps = {
  items: Tribunal[];
  query: string;
  onQueryChange: (text: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  jurisdictionFilter: string | null;
  onJurisdictionChange: (value: string | null) => void;
  stateFilter: string | null;
  onStateChange: (value: string | null) => void;
  districtFilter: string | null;
  onDistrictChange: (value: string | null) => void;
  eFilingFilter: boolean | null;
  onEFilingChange: (value: boolean | null) => void;
  videoFilter: boolean | null;
  onVideoChange: (value: boolean | null) => void;
  featuredFilter: boolean | null;
  onFeaturedChange: (value: boolean | null) => void;
  filtersActive: boolean;
  onResetFilters: () => void;
  uniqueStates: string[];
};

const FilterBar = React.memo(function FilterBar({
  items,
  query,
  onQueryChange,
  sortBy,
  onSortChange,
  jurisdictionFilter,
  onJurisdictionChange,
  stateFilter,
  onStateChange,
  districtFilter,
  onDistrictChange,
  eFilingFilter,
  onEFilingChange,
  videoFilter,
  onVideoChange,
  featuredFilter,
  onFeaturedChange,
  filtersActive,
  onResetFilters,
  uniqueStates,
}: FilterBarProps) {
  return (
    <View>
      <StatisticsHeader tribunals={items} />
      <TribunalsSearchBar value={query} onChange={onQueryChange} />

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScroll}
        >
          {SORT_OPTIONS.map((sort) => (
            <Chip
              key={sort.value}
              label={sort.label}
              variant="sort"
              active={sortBy === sort.value}
              onPress={() => onSortChange(sort.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Boolean Filters */}
      <View style={styles.booleanFiltersRow}>
        {BOOLEAN_FILTERS.map((filter) => {
          const isActive =
            (filter.value === "eFiling" && eFilingFilter === true) ||
            (filter.value === "video" && videoFilter === true);
          return (
            <Chip
              key={filter.value}
              label={filter.label}
              icon={filter.icon}
              variant="filter"
              active={isActive}
              onPress={() => {
                if (filter.value === "eFiling") {
                  onEFilingChange(eFilingFilter === true ? null : true);
                } else {
                  onVideoChange(videoFilter === true ? null : true);
                }
              }}
            />
          );
        })}
        <Chip
          label="Featured"
          icon="star"
          variant="filter"
          active={featuredFilter === true}
          onPress={() => onFeaturedChange(featuredFilter === true ? null : true)}
        />
      </View>

      {/* Active Filters / Advanced Filters */}
      {filtersActive ? (
        <ActiveFilters
          jurisdictionFilter={jurisdictionFilter}
          stateFilter={stateFilter}
          districtFilter={districtFilter}
          eFilingFilter={eFilingFilter}
          videoFilter={videoFilter}
          featuredFilter={featuredFilter}
          onJurisdictionChange={onJurisdictionChange}
          onStateChange={onStateChange}
          onDistrictChange={onDistrictChange}
          onEFilingChange={onEFilingChange}
          onVideoChange={onVideoChange}
          onFeaturedChange={onFeaturedChange}
          onResetFilters={onResetFilters}
        />
      ) : (
        <AdvancedFilters
          jurisdictionFilter={jurisdictionFilter}
          onJurisdictionChange={onJurisdictionChange}
          stateFilter={stateFilter}
          onStateChange={onStateChange}
          uniqueStates={uniqueStates}
        />
      )}
    </View>
  );
});

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  primary?: boolean;
};

const ActionButton = React.memo(function ActionButton({
  label,
  onPress,
  primary = false,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={primary ? styles.primaryBtn : styles.secondaryBtn}
    >
      <Text style={primary ? styles.primaryBtnText : styles.secondaryBtnText}>
        {label}
      </Text>
    </Pressable>
  );
});

type FacilityBadgeProps = {
  label: string;
  alt?: boolean;
};

const FacilityBadge = React.memo(function FacilityBadge({
  label,
  alt = false,
}: FacilityBadgeProps) {
  return (
    <View style={[styles.flag, alt && styles.flagAlt]}>
      <Text style={styles.flagText}>{label}</Text>
    </View>
  );
});

type ContactRowProps = {
  label: string;
  value: string;
};

const ContactRow = React.memo(function ContactRow({ label, value }: ContactRowProps) {
  return (
    <Text style={styles.modalBody}>
      {label}: {value}
    </Text>
  );
});

type LinkCardProps = {
  label: string;
  onPress: () => void;
};

const LinkCard = React.memo(function LinkCard({ label, onPress }: LinkCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.resourceRow}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      <Text style={styles.resourceLabel}>{label}</Text>
      <Text style={styles.resourceUrl}>Open ↗</Text>
    </Pressable>
  );
});

type TribunalDetailModalProps = {
  tribunal: Tribunal;
  onClose: () => void;
};

const TribunalDetailModal = React.memo(function TribunalDetailModal({
  tribunal,
  onClose,
}: TribunalDetailModalProps) {
  const openLink = useCallback((url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  }, []);

  const copyToClipboard = useCallback((text?: string) => {
    if (!text) return;
    Alert.alert("Copied", text);
  }, []);

  const shareTribunal = useCallback(() => {
    const name = tribunal?.name || "Tribunal";
    const msg = `${name}${tribunal?.abbreviation ? ` (${tribunal.abbreviation})` : ""}\n${tribunal?.address || tribunal?.location || ""}\n${tribunal?.phone ? `Phone: ${tribunal.phone}` : ""}`;
    Share.share({ title: name, message: msg }).catch(() => {});
  }, [tribunal]);

  const addressLine = useMemo(() => {
    const parts = [
      tribunal?.address,
      tribunal?.city,
      tribunal?.pincode,
      tribunal?.state,
    ].filter(Boolean);
    return parts.join(", ") || tribunal?.location || "—";
  }, [tribunal]);

  const resourceLinks = useMemo(() => {
    const links: { label: string; url?: string }[] = [
      { label: "Cause List", url: tribunal?.causeListLink },
      { label: "Orders", url: tribunal?.ordersLink },
      { label: "Judgments", url: tribunal?.judgmentsLink },
      { label: "Notifications", url: tribunal?.notificationsLink },
      { label: "Circulars", url: tribunal?.circularsLink },
      { label: "Forms", url: tribunal?.formsLink },
      { label: "Rules", url: tribunal?.rulesLink },
      { label: "Governing Act", url: tribunal?.governingActLink },
    ];
    return links.filter((l) => !!l.url);
  }, [tribunal]);

  return (
    <View style={styles.modalOverlay}>
      <Pressable
        onPress={onClose}
        style={StyleSheet.absoluteFill}
        accessibilityRole="button"
        accessibilityLabel="Close tribunal details"
      />
      <Pressable
        onPress={() => {}}
        style={styles.modalSheet}
        accessible={false}
      >
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderText}>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {tribunal?.name || "Tribunal"}
            </Text>
            {tribunal?.abbreviation ? (
              <Text style={styles.modalSub}>{tribunal.abbreviation}</Text>
            ) : null}
          </View>
          <Pressable
            onPress={onClose}
            style={styles.modalClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={8}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.modalMetaRow}>
          {tribunal?.category ? (
            <Text style={styles.modalMeta}>{tribunal.category}</Text>
          ) : null}
          {tribunal?.jurisdictionLevel ? (
            <Text style={styles.modalMeta}>{tribunal.jurisdictionLevel}</Text>
          ) : null}
          {tribunal?.jurisdiction ? (
            <Text style={styles.modalMeta}>{tribunal.jurisdiction}</Text>
          ) : null}
        </View>

        {addressLine !== "—" ? (
          <ContactRow label="Address" value={addressLine} />
        ) : null}

        {tribunal?.workingDays ? (
          <ContactRow label="Working Days" value={tribunal.workingDays} />
        ) : null}
        {tribunal?.workingHours ? (
          <ContactRow label="Working Hours" value={tribunal.workingHours} />
        ) : null}

        {(tribunal?.eFilingAvailable || tribunal?.videoConferenceAvailable) ? (
          <View style={styles.cardFlags}>
            {tribunal.eFilingAvailable ? (
              <FacilityBadge label="e-Filing" />
            ) : null}
            {tribunal.videoConferenceAvailable ? (
              <FacilityBadge label="Video Conference" alt />
            ) : null}
          </View>
        ) : null}

        <View style={styles.rowActions}>
          <ActionButton
            label="Open Website"
            primary
            onPress={() => openLink(tribunal?.website)}
          />
          <ActionButton
            label="Call"
            onPress={() =>
              openLink(tribunal?.phone ? `tel:${tribunal.phone}` : undefined)
            }
          />
          <ActionButton
            label="Email"
            onPress={() =>
              openLink(tribunal?.email ? `mailto:${tribunal.email}` : undefined)
            }
          />
          <ActionButton
            label="Maps"
            onPress={() => openLink(tribunal?.googleMapsLink || addressLine)}
          />
          <ActionButton
            label="Copy"
            onPress={() => copyToClipboard(addressLine)}
          />
          <ActionButton label="Share" onPress={shareTribunal} />
        </View>

        {resourceLinks.length > 0 ? (
          <View style={styles.resources}>
            <Text style={styles.resourcesTitle}>Official Links</Text>
            {resourceLinks.map((r) => (
              <LinkCard
                key={r.label}
                label={r.label}
                onPress={() => openLink(r.url)}
              />
            ))}
          </View>
        ) : null}
      </Pressable>
    </View>
  );
});

export default function TribunalsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Tribunal[]>([]);
  const [query, setQuery] = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [districtFilter, setDistrictFilter] = useState<string | null>(null);
  const [eFilingFilter, setEFilingFilter] = useState<boolean | null>(null);
  const [videoFilter, setVideoFilter] = useState<boolean | null>(null);
  const [featuredFilter, setFeaturedFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<string>("alpha");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedTribunal, setSelectedTribunal] = useState<Tribunal | null>(null);

  const mountedRef = useRef(true);

  const loadTribunals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/tribunals");
      const tribunals = res?.data?.tribunals || [];

      if (mountedRef.current) {
        setItems(Array.isArray(tribunals) ? tribunals : []);
      }
    } catch (e: any) {
      if (!mountedRef.current) return;
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load tribunals",
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const fetchTribunals = async () => {
      await loadTribunals();
    };

    void fetchTribunals();

    return () => {
      mountedRef.current = false;
    };
  }, [loadTribunals]);

  const filtersActive = useMemo(
    () =>
      !!jurisdictionFilter ||
      !!stateFilter ||
      !!districtFilter ||
      eFilingFilter !== null ||
      videoFilter !== null ||
      featuredFilter !== null,
    [
      jurisdictionFilter,
      stateFilter,
      districtFilter,
      eFilingFilter,
      videoFilter,
      featuredFilter,
    ],
  );

  const resetFilters = useCallback(() => {
    setJurisdictionFilter(null);
    setStateFilter(null);
    setDistrictFilter(null);
    setEFilingFilter(null);
    setVideoFilter(null);
    setFeaturedFilter(null);
    setQuery("");
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let result = items;

    if (q) {
      result = result.filter((t) => {
        const values = [
          t?.name,
          t?.abbreviation,
          t?.governingAct,
          t?.jurisdiction,
          t?.category,
          t?.benchName,
          t?.benchCode,
          t?.district,
          t?.state,
          t?.subCategory,
          t?.tribunalType,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return values.includes(q);
      });
    }

    if (jurisdictionFilter) {
      result = result.filter((t) => t?.jurisdictionLevel === jurisdictionFilter);
    }

    if (stateFilter) {
      result = result.filter(
        (t) => (t?.state || "").toLowerCase() === stateFilter.toLowerCase(),
      );
    }

    if (districtFilter) {
      result = result.filter(
        (t) => (t?.district || "").toLowerCase() === districtFilter.toLowerCase(),
      );
    }

    if (eFilingFilter !== null) {
      result = result.filter((t) => t?.eFilingAvailable === eFilingFilter);
    }

    if (videoFilter !== null) {
      result = result.filter((t) => t?.videoConferenceAvailable === videoFilter);
    }

    if (featuredFilter !== null) {
      result = result.filter((t) => t?.isFeatured === featuredFilter);
    }

    result = [...result];

    switch (sortBy) {
      case "alpha":
        result.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
        break;
      case "recent":
        result.sort((a, b) => {
          const da = a?.lastVerifiedAt ? new Date(a.lastVerifiedAt).getTime() : 0;
          const db = b?.lastVerifiedAt ? new Date(b.lastVerifiedAt).getTime() : 0;
          return db - da;
        });
        break;
      case "featured":
        result.sort((a, b) => (b?.isFeatured ? 1 : 0) - (a?.isFeatured ? 1 : 0));
        break;
      case "jurisdiction": {
        const order: Record<string, number> = {
          National: 0,
          State: 1,
          District: 2,
        };
        result.sort(
          (a, b) =>
            (order[a?.jurisdictionLevel || ""] ?? 9) -
            (order[b?.jurisdictionLevel || ""] ?? 9),
        );
        break;
      }
    }

    return result;
  }, [
    items,
    query,
    jurisdictionFilter,
    stateFilter,
    districtFilter,
    eFilingFilter,
    videoFilter,
    featuredFilter,
    sortBy,
  ]);

  const grouped = useMemo(() => {
    const map: Record<string, Tribunal[]> = {};
    for (const t of filtered) {
      const key = (t?.category as string) || "Other";
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    return map;
  }, [filtered]);

  const categoryKeys = useMemo(() => Object.keys(grouped), [grouped]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const uniqueStates = useMemo(() => {
    const set = new Set<string>();
    for (const t of items) {
      if (t?.state) set.add(t.state);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const handleRetry = useCallback(() => {
    loadTribunals();
  }, [loadTribunals]);

  const handleClearSearch = useCallback(() => {
    setQuery("");
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  const handleJurisdictionChange = useCallback((value: string | null) => {
    setJurisdictionFilter(value);
  }, []);

  const handleStateChange = useCallback((value: string | null) => {
    setStateFilter(value);
  }, []);

  const handleDistrictChange = useCallback((value: string | null) => {
    setDistrictFilter(value);
  }, []);

  const handleEFilingChange = useCallback((value: boolean | null) => {
    setEFilingFilter(value);
  }, []);

  const handleVideoChange = useCallback((value: boolean | null) => {
    setVideoFilter(value);
  }, []);

  const handleFeaturedChange = useCallback((value: boolean | null) => {
    setFeaturedFilter(value);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: string }) => {
      const tribunals = grouped[item] || [];
      const meta = CATEGORY_META[item] || {
        title: item,
        description: `${tribunals.length} tribunal${tribunals.length === 1 ? "" : "s"}`,
        icon: "business-outline",
      };

      return (
        <View style={styles.categorySection}>
          <SectionHeader
            title={meta.title}
            description={meta.description}
            count={tribunals.length}
            expanded={!!expandedCategories[item]}
            onToggle={() => toggleCategory(item)}
          />
          {expandedCategories[item] ? (
            <View style={styles.categoryBody}>
              {tribunals.map((tribunal) => (
                <TribunalCard
                  key={tribunal?._id || tribunal?.name}
                  tribunal={tribunal}
                  onPress={setSelectedTribunal}
                />
              ))}
            </View>
          ) : null}
        </View>
      );
    },
    [grouped, expandedCategories, toggleCategory],
  );

  const keyExtractor = useCallback((item: string) => item, []);

  const listEmptyComponent = useMemo(
    () => <EmptyState query={query} onClear={handleClearSearch} />,
    [query, handleClearSearch],
  );

  const listFooterComponent = useMemo(
    () => (
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Showing {filtered.length} of {items.length} tribunals
        </Text>
      </View>
    ),
    [filtered.length, items.length],
  );

  const listHeaderComponent = useMemo(
    () => (
      <FilterBar
        items={items}
        query={query}
        onQueryChange={setQuery}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        jurisdictionFilter={jurisdictionFilter}
        onJurisdictionChange={handleJurisdictionChange}
        stateFilter={stateFilter}
        onStateChange={handleStateChange}
        districtFilter={districtFilter}
        onDistrictChange={handleDistrictChange}
        eFilingFilter={eFilingFilter}
        onEFilingChange={handleEFilingChange}
        videoFilter={videoFilter}
        onVideoChange={handleVideoChange}
        featuredFilter={featuredFilter}
        onFeaturedChange={handleFeaturedChange}
        filtersActive={filtersActive}
        onResetFilters={resetFilters}
        uniqueStates={uniqueStates}
      />
    ),
    [
      items,
      query,
      sortBy,
      jurisdictionFilter,
      stateFilter,
      districtFilter,
      eFilingFilter,
      videoFilter,
      featuredFilter,
      filtersActive,
      uniqueStates,
      resetFilters,
      handleSortChange,
      handleJurisdictionChange,
      handleStateChange,
      handleDistrictChange,
      handleEFilingChange,
      handleVideoChange,
      handleFeaturedChange,
    ],
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Navbar title="Tribunals" />
        <LoadingSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Navbar title="Tribunals" />
        <ErrorState message={error} onRetry={handleRetry} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar title="Tribunals" />

      <FlatList
        data={categoryKeys}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={listFooterComponent}
        maxToRenderPerBatch={12}
        initialNumToRender={8}
        showsVerticalScrollIndicator={false}
      />

      {selectedTribunal ? (
        <TribunalDetailModal
          tribunal={selectedTribunal}
          onClose={() => setSelectedTribunal(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  categorySection: { gap: spacing.sm, marginBottom: spacing.md },
  categoryBody: { gap: spacing.sm, marginTop: spacing.xs },

  sortContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sortScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },
  chipVariantSort: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  chipVariantFilter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipVariantAdvanced: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.goldSubtle,
  },
  chipPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  chipText: {
    color: colors.text.secondary,
    fontWeight: "600",
  },
  chipTextSort: {
    fontSize: 12,
  },
  chipTextFilter: {
    fontSize: 12,
  },
  chipTextAdvanced: {
    fontSize: 11,
  },
  chipTextActive: {
    color: colors.accent.gold,
    fontWeight: "700",
  },

  booleanFiltersRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: "wrap",
  },

  activeFiltersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: "wrap",
  },
  activeFiltersLabel: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: "600",
    marginRight: 4,
  },
  activeFiltersContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
  },
  activeFilterText: {
    color: colors.accent.gold,
    fontSize: 11,
    fontWeight: "700",
  },
  clearAllFiltersButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: colors.semantic.dangerSubtle,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  clearAllFiltersText: {
    color: colors.semantic.danger,
    fontSize: 11,
    fontWeight: "700",
  },

  advancedFiltersToggle: {
    marginBottom: spacing.sm,
  },
  advancedFiltersContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    flexWrap: "wrap",
  },
  advancedFiltersLabel: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: "600",
    marginRight: 4,
  },

  footer: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  footerText: { color: colors.text.muted, fontSize: 12 },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalBackdrop: { flex: 1 },
  modalSheet: {
    backgroundColor: colors.bg.elevated,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.md,
    maxHeight: "92%",
    gap: spacing.sm,
    ...shadows.level4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: { color: colors.text.primary, fontSize: 20, fontWeight: "900" },
  modalSub: { color: colors.text.secondary, fontSize: 13, marginTop: 2 },
  modalClose: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },
  modalCloseText: { color: colors.text.primary, fontWeight: "900" },
  modalMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  modalMeta: { color: colors.text.secondary, fontSize: 13, fontWeight: "600" },
  modalBody: { color: colors.text.secondary, fontSize: 13, lineHeight: 18 },

  cardFlags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  flag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
  },
  flagAlt: {
    backgroundColor: "rgba(56,180,140,0.10)",
    borderColor: "rgba(56,180,140,0.35)",
  },
  flagText: { color: colors.accent.gold, fontSize: 11, fontWeight: "700" },

  rowActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
  },
  primaryBtnText: { color: colors.accent.gold, fontWeight: "800", fontSize: 13 },
  secondaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  secondaryBtnText: { color: colors.text.secondary, fontWeight: "800", fontSize: 13 },

  resources: { gap: 8 },
  resourcesTitle: { color: colors.accent.gold, fontSize: 13, fontWeight: "800" },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  resourceLabel: { color: colors.text.secondary, fontSize: 13 },
  resourceUrl: { color: colors.accent.gold, fontSize: 13, fontWeight: "800" },
});