import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../theme";

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helper?: string;
}

/** Segmented button row — used for currency, weight unit, PDF font, invoice type. */
const SegmentedControl = ({
  options,
  value,
  onChange,
  label,
  helper,
}: SegmentedControlProps) => {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      ) : null}
      <View style={[styles.row, { borderColor: theme.primary }]}>
        {options.map((opt) => {
          const active = opt === value;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onChange(opt)}
              style={[
                styles.btn,
                active && { backgroundColor: theme.primary },
              ]}>
              <Text
                style={[
                  styles.btnText,
                  { color: theme.primary },
                  active && { color: theme.background },
                ]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {helper ? (
        <Text style={[styles.helper, { color: theme.textSecondary }]}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  row: {
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
  },
  btn: { flex: 1, padding: 12, alignItems: "center" },
  btnText: { fontWeight: "800", fontSize: 13 },
  helper: { fontSize: 11, fontStyle: "italic", marginTop: 4 },
});

export default SegmentedControl;
