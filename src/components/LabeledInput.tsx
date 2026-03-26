import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
} from "react-native";
import { useTheme } from "../theme";

interface LabeledInputProps {
  label: string;
  helper?: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  inputHeight?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  onFocus?: () => void;
  placeholder?: string;
  autoCorrect?: boolean;
}

/**
 * Reusable labeled text input with optional helper text.
 * Use forwardRef so the parent can hold a ref to the container View
 * for keyboard-scroll purposes.
 */
const LabeledInput = React.forwardRef<View, LabeledInputProps>(
  (
    {
      label,
      helper,
      value,
      onChangeText,
      keyboardType,
      multiline,
      inputHeight,
      autoCapitalize,
      onFocus,
      placeholder,
      autoCorrect = false,
    },
    ref,
  ) => {
    const theme = useTheme();

    return (
      <View ref={ref} style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.border,
              backgroundColor: theme.background,
            },
            multiline && {
              height: inputHeight ?? 80,
              textAlignVertical: "top",
              paddingTop: 12,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? "default"}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          onFocus={onFocus}
          autoCorrect={autoCorrect}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
        />
        {helper ? (
          <Text style={[styles.helper, { color: theme.textSecondary }]}>
            {helper}
          </Text>
        ) : null}
      </View>
    );
  },
);

LabeledInput.displayName = "LabeledInput";

const styles = StyleSheet.create({
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 4, padding: 14, fontSize: 16 },
  helper: { fontSize: 11, fontStyle: "italic", marginTop: 4 },
});

export default LabeledInput;
