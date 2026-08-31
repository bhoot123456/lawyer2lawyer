import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { featuredCities } from "@/constants/coverage";
import { blurActiveElement } from "@/utils/blurActiveElement";

const MARQUEE_TEXT =
  "⚖️ Connect with Trusted Lawyers Across India  | Lawyer2Lawyer Legal Networking Made Easy";

export default function Home() {
  // Animated.Value is designed to be accessed during render for animation purposes
  // This is a standard pattern for React Native's Animated API
  // eslint-disable-next-line react-hooks/refs
  const translateX = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);
  const speedMs = 14000; // total duration for one full loop

  // Continuous marquee loop using measured text width.
  useEffect(() => {
    if (!contentWidth) return;
    const distance = contentWidth / 2;

    const loop = () => {
      translateX.setValue(0);
      Animated.timing(translateX, {
        toValue: -distance,
        duration: speedMs,
        useNativeDriver: false,
      }).start(() => loop());
    };

    loop();
    // Animated.Value intentionally omitted from deps - stable reference
  }, [contentWidth, speedMs]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.marqueeContainer}>
        <Animated.Text
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            setContentWidth((prev) => (prev === w ? prev : w));
          }}
          style={[styles.marqueeText, { transform: [{ translateX }] }]}
          numberOfLines={1}
        >
          {MARQUEE_TEXT}
          {"   "}
          {MARQUEE_TEXT}
        </Animated.Text>
      </View>

      <Image
        source={require("@/assets/images/5dd2a8fa099d379bff92373e466db10b.jpg")}
        style={styles.highCourtImage}
        resizeMode="cover"
      />

      <View style={styles.heroTextContainer}>
        <Text style={styles.title}>THIS IS FOR YOU MY DEAR LAWYER</Text>
        <Text style={styles.coverage}>
          Serving {featuredCities.slice(0, 5).join(", ")} and more.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() => {
          blurActiveElement();
          router.push("/" as any);
        }}
      >
        <Text style={styles.buttonText}>Explore Public Portal</Text>
      </TouchableOpacity>

      {/* Grid Menu Section */}
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            blurActiveElement();
            router.push("/supreme-court" as any);
          }}
        >
          <Ionicons
            name="scale-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>Supreme Court</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            blurActiveElement();
            router.push("/delhi-courts" as any);
          }}
        >
          <Ionicons
            name="hammer-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>Delhi Courts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            blurActiveElement();
            router.push("/delhi-district-courts" as any);
          }}
        >
          <Ionicons
            name="business-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>Delhi District Courts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            blurActiveElement();
            router.push("/draft-library" as any);
          }}
        >
          <Ionicons
            name="document-text-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>Draft Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            blurActiveElement();
            router.push("/bare-acts" as any);
          }}
        >
          <Ionicons
            name="book-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>Bare Acts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            blurActiveElement();
            router.push("/criminal-law" as any);
          }}
        >
          <Ionicons
            name="people-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>Criminal Law</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            blurActiveElement();
            router.push("/misc-forms" as any);
          }}
        >
          <Ionicons
            name="document-text-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>Misc. Forms</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            blurActiveElement();
            router.push("/tribunals" as any);
          }}
        >
          <Ionicons
            name="business-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>Tribunals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            blurActiveElement();
            router.push("/knowledge-hub" as any);
          }}
        >
          <Ionicons
            name="library-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>Knowledge Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            blurActiveElement();
            router.push("/ai-assistant" as any);
          }}
        >
          <Ionicons
            name="sparkles-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>AI Assistant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            // UI placeholder
          }}
        >
          <Ionicons
            name="shield-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>Police Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            // UI placeholder
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>Court Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.7}
          onPress={() => {
            // UI placeholder
          }}
        >
          <Ionicons
            name="ribbon-outline"
            size={24}
            color="#B58D3D"
            style={styles.cardIcon}
          />
          <Text style={styles.sectionCardText}>Events</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    alignItems: "center",
  },
  marqueeContainer: {
    width: "100%",
    borderColor: "#EAE5DB",
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  marqueeText: {
    color: "#B58D3D",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "left",
    letterSpacing: 0.2,
  },
  highCourtImage: {
    width: "100%",
    height: 180,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE5DB",
  },
  heroTextContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "#1E293B",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  coverage: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#1E293B",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#0F172A",
    marginBottom: 24,
    width: "80%",
    alignItems: "center",
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    width: "100%",
    justifyContent: "space-between",
  },
  sectionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE5DB",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  cardIcon: {
    marginBottom: 8,
  },
  sectionCardText: {
    color: "#1E293B",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

