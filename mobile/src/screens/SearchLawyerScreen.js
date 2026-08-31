import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

import LawyerCard from "@/components/LawyerCard";
import { coverageStates, featuredCities } from "@/constants/coverage";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";

export default function SearchLawyerScreen({ navigation }) {
  const [specialization, setSpecialization] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const selectedState = coverageStates.find((item) => item.name === stateFilter);

  const runSearch = async (next = {}) => {
    const finalSpecialization = next.specialization ?? specialization;
    const finalState = next.state ?? stateFilter;
    const finalCity = next.city ?? cityFilter;

    try {
      setLoading(true);
      setError(null);

      const { searchLawyers } = await import("@/services/api");
      const data = await searchLawyers({
        specialization: finalSpecialization || undefined,
        state: finalState || undefined,
        city: finalCity || undefined,
      });

      setResults(data.lawyers ?? data);
    } catch (e) {
      console.log("Search failed", e);
      setError("Unable to fetch lawyers");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareView style={styles.container} contentContainerStyle={styles.body}>
      <Text style={styles.title}>Find lawyers</Text>
      <Text style={styles.helper}>
        Coverage includes Noida, Gujarat, Indore and other major legal hubs.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Specialization (e.g. family, corporate)"
        placeholderTextColor="#94A3B8"
        value={specialization}
        onChangeText={setSpecialization}
      />

      <TextInput
        style={styles.input}
        placeholder="State (optional, e.g. Gujarat)"
        placeholderTextColor="#94A3B8"
        value={stateFilter}
        onChangeText={(value) => {
          setStateFilter(value);
          setCityFilter("");
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="City (optional, e.g. Noida or Indore)"
        placeholderTextColor="#94A3B8"
        value={cityFilter}
        onChangeText={setCityFilter}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {coverageStates.map((item) => (
          <Pressable
            key={item.name}
            style={[
              styles.chip,
              stateFilter === item.name ? styles.chipSelected : null,
            ]}
            onPress={() => {
              setStateFilter(item.name);
              setCityFilter("");
            }}
          >
            <Text
              style={[
                styles.chipText,
                stateFilter === item.name ? styles.chipTextSelected : null,
              ]}
            >
              {item.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {(selectedState?.cities ?? featuredCities).map((city) => (
          <Pressable
            key={city}
            style={[
              styles.chip,
              cityFilter === city ? styles.chipSelected : null,
            ]}
            onPress={() => {
              setCityFilter(city);
              if (!selectedState) {
                const match = coverageStates.find((item) =>
                  item.cities.includes(city),
                );
                if (match) {
                  setStateFilter(match.name);
                }
              }
            }}
          >
            <Text
              style={[
                styles.chipText,
                cityFilter === city ? styles.chipTextSelected : null,
              ]}
            >
              {city}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        style={[styles.button, loading ? { opacity: 0.7 } : null]}
        disabled={loading}
        onPress={() => runSearch()}
      >
        <Text style={styles.buttonText}>
          {loading ? "Searching..." : "Search"}
        </Text>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={(item) => String(item._id ?? item.id)}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          loading ? null : (
            <Text style={styles.emptyText}>
              Select a city or search specialization to see lawyers.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <LawyerCard
              lawyer={item}
              onPress={() => {
                if (navigation?.navigate) {
                  navigation.navigate("Booking", { lawyerId: item._id });
                  return;
                }

                router.push({
                  pathname: "/booking",
                  params: { lawyerId: item._id, lawyerName: item.name },
                });
              }}
            />
          </View>
        )}
      />
    </KeyboardAwareView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6" },
  body: { padding: 16, justifyContent: "flex-start", gap: 14 },
  title: { fontSize: 22, fontWeight: "900", marginTop: 6, color: "#1E293B" },
  helper: { color: "#64748B", lineHeight: 20, fontSize: 13 },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE5DB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#1E293B",
    fontSize: 16,
  },
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: {
    borderWidth: 1,
    borderColor: "#EAE5DB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  chipSelected: {
    backgroundColor: "#B58D3D",
    borderColor: "#9A752C",
  },
  chipText: { color: "#64748B", fontWeight: "700" },
  chipTextSelected: { color: "#FFFFFF" },
  button: {
    backgroundColor: "#1E293B",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0F172A",
    marginTop: 6,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  errorText: { color: "#ff6666", fontWeight: "600" },
  emptyText: { color: "#64748B", marginTop: 16, textAlign: "center", fontSize: 14 },
  cardWrap: { marginTop: 8 },
});