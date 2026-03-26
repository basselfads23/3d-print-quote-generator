import React from "react";
import { Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../theme";

interface SectionLabelProps {
  title: string;
  style?: ViewStyle;
}

/** Uppercase section header label used throughout all screens. */
const SectionLabel = ({ title, style }: SectionLabelProps) => {
  const theme = useTheme();
  return (
    <Text style={[styles.label, { color: theme.textSecondary }, style]}>
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
});

export default SectionLabel;
