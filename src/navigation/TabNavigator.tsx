import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalculatorScreen from "../screens/CalculatorScreen";
import MaterialsScreen from "../screens/MaterialsScreen";
import ExportScreen from "../screens/ExportScreen";
import { useTheme } from "../theme";

const Tab = createMaterialTopTabNavigator();

const TabNavigator = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }} edges={['top']}>
      <Tab.Navigator 
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let iconName: any;

            if (route.name === "Calculator") {
              iconName = focused ? "calculator" : "calculator-outline";
            } else if (route.name === "Materials") {
              iconName = focused ? "cube" : "cube-outline";
            } else if (route.name === "Export") {
              iconName = focused ? "document-text" : "document-text-outline";
            }

            return <Ionicons name={iconName} size={20} color={color} />;
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarIndicatorStyle: { backgroundColor: theme.primary, top: 0, height: 3 },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
          tabBarStyle: { 
            backgroundColor: theme.surface, 
            borderTopWidth: 1, 
            borderTopColor: theme.border,
            elevation: 0,
            shadowOpacity: 0
          },
          tabBarShowIcon: true,
        })}
      >
        <Tab.Screen 
          name="Calculator" 
          component={CalculatorScreen} 
          options={{ title: "Calculator" }}
        />
        <Tab.Screen 
          name="Materials" 
          component={MaterialsScreen} 
          options={{ title: "Materials" }}
        />
        <Tab.Screen 
          name="Export" 
          component={ExportScreen} 
          options={{ title: "Export" }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default TabNavigator;
