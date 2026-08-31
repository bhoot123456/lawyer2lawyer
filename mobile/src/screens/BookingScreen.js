import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";

import Navbar from "@/components/Navbar";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";

export default function BookingScreen({ navigation }) {
  const [lawyerId, setLawyerId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  return (
    <KeyboardAwareView style={styles.container} contentContainerStyle={styles.body}>
      <Navbar title="Booking" />
      <Text style={styles.title}>Book consultation</Text>

      <TextInput
        style={styles.input}
        placeholder="Lawyer ID"
        placeholderTextColor="#999"
        value={lawyerId}
        onChangeText={setLawyerId}
      />

      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        placeholderTextColor="#999"
        value={date}
        onChangeText={setDate}
      />

      <TextInput
        style={styles.input}
        placeholder="Time (e.g. 10:30)"
        placeholderTextColor="#999"
        value={time}
        onChangeText={setTime}
      />

      <TextInput
        style={styles.input}
        placeholder="Notes (optional)"
        placeholderTextColor="#999"
        value={notes}
        onChangeText={setNotes}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={[styles.button, submitting ? { opacity: 0.7 } : null]}
        disabled={submitting}
        onPress={async () => {
          try {
            setSubmitting(true);
            setError(null);

            const { createBooking } = await import("@/services/api");

            const payload = {
              lawyerId,
              date,
              time,
              notes: notes || undefined,
            };

            await createBooking(payload);
            navigation.replace("Dashboard");
          } catch (e) {
            console.log("Booking failed", e);
            setError("Unable to create booking");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Booking..." : "Confirm"}
        </Text>
      </Pressable>
    </KeyboardAwareView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, padding: 16, justifyContent: "center", gap: 12 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: { color: "#ff6666", fontWeight: "600" },
  button: {
    backgroundColor: "#208AEF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});