import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CalculatorScreen from "../screens/CalculatorScreen";
import MaterialsScreen from "../screens/MaterialsScreen";
import ExportScreen from "../screens/ExportScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Calculator" component={CalculatorScreen} />
      <Tab.Screen name="Materials" component={MaterialsScreen} />
      <Tab.Screen name="Export" component={ExportScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
