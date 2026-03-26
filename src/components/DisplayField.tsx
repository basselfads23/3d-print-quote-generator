import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme";

interface DisplayFieldProps {
  label: string;
  value: string | number;
  /** Removes bottom border — use on the last field in a group. */
  last?: boolean;
}

/** Read-only field used in Settings and Export to display saved values. */
const DisplayField = ({ label, value, last }: DisplayFieldProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor: theme.border },
        last && styles.last,
      ]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: theme.text }]}>
        {value || "—"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 12, borderBottomWidth: 1 },
  last: { borderBottomWidth: 0 },
  label: {
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: { fontSize: 16, fontWeight: "600" },
});

export default DisplayField;
