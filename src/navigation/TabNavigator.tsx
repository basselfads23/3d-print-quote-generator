import React from "react";
import { TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import CalculatorScreen from "../screens/CalculatorScreen";
import MaterialsScreen from "../screens/MaterialsScreen";
import ExportScreen from "../screens/ExportScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const navigation = useNavigation<any>();

  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === "Calculator") {
            iconName = focused ? "calculator" : "calculator-outline";
          } else if (route.name === "Materials") {
            iconName = focused ? "cube" : "cube-outline";
          } else if (route.name === "Export") {
            iconName = focused ? "document-text" : "document-text-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Calculator" component={CalculatorScreen} />
      <Tab.Screen name="Materials" component={MaterialsScreen} />
      <Tab.Screen name="Export" component={ExportScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
