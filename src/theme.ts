import { useColorScheme } from "react-native";

export const lightTheme = {
  background: "#F8F9FA",
  surface: "#FFFFFF",
  primary: "#1C1C1E", // Carbon Black
  text: "#111111",
  textSecondary: "#666666",
  border: "#E0E0E0",
  danger: "#FF3B30",
  success: "#34C759",
};

export const darkTheme = {
  background: "#000000",
  surface: "#1C1C1E", // Carbon Dark Grey
  primary: "#FFFFFF",
  text: "#F2F2F7",
  textSecondary: "#AEAEB2",
  border: "#38383A",
  danger: "#FF453A",
  success: "#30D158",
};

export const useTheme = () => {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
};
