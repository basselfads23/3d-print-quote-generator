import React from "react";
import { TouchableOpacity } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import TabNavigator from "./TabNavigator";
import SettingsScreen from "../screens/SettingsScreen";
import { useTheme } from "../theme";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: "800",
        },
        headerShadowVisible: false, // Flat design
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={{ marginRight: 5 }}
          >
            <Ionicons name="settings-outline" size={22} color={theme.primary} />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ title: "3D QUOTE PRO" }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: "App Settings", headerRight: () => null }} 
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
