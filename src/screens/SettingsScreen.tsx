import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../store/useStore";

const SettingsScreen = () => {
  const {
    businessName, setBusinessName,
    contactInfo, setContactInfo,
    businessDescription, setBusinessDescription,
    currencySymbol, setCurrencySymbol,
    weightUnit, setWeightUnit,
    pdfFont, setPdfFont,
    electricityRate, setElectricityRate,
    printerWattage, setPrinterWattage,
    profitMargin, setProfitMargin,
    wearAndTearFee, setWearAndTearFee,
    taxRate, setTaxRate,
    clearAllQuotes,
    factoryReset,
  } = useStore();

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const handleFactoryReset = () => {
    Alert.alert(
      "Factory Reset",
      "This will clear ALL settings, materials, and history. Are you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset Everything", style: "destructive", onPress: () => factoryReset() }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>App Settings</Text>

        {/* Section 1: User Profile */}
        {renderSectionHeader("User Profile")}
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} placeholder="e.g. Acme 3D" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Info (Phone/Email/Address)</Text>
            <TextInput style={styles.input} value={contactInfo} onChangeText={setContactInfo} placeholder="e.g. +1 234 567, contact@acme.com" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Description</Text>
            <TextInput 
              style={[styles.input, { height: 60 }]} 
              value={businessDescription} 
              onChangeText={setBusinessDescription} 
              placeholder="e.g. High-quality FDM printing"
              multiline
            />
          </View>
        </View>

        {/* Section 2: App Preferences */}
        {renderSectionHeader("App Preferences")}
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Currency Symbol</Text>
            <TextInput style={styles.input} value={currencySymbol} onChangeText={setCurrencySymbol} placeholder="e.g. $, €, £" />
          </View>
          
          <Text style={styles.label}>Global Weight Unit</Text>
          <View style={styles.toggleRow}>
            {["g", "kg", "lb"].map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => setWeightUnit(u)}
                style={[styles.toggleBtn, weightUnit === u && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleBtnText, weightUnit === u && styles.toggleBtnTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>PDF Font</Text>
          <View style={styles.toggleRow}>
            {["Helvetica", "Times New Roman"].map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setPdfFont(f)}
                style={[styles.toggleBtn, pdfFont === f && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleBtnText, pdfFont === f && styles.toggleBtnTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 3: Print Variables */}
        {renderSectionHeader("Print Variables")}
        <View style={styles.section}>
          {[
            { label: `Electricity Rate (${currencySymbol}/kWh)`, val: electricityRate, set: setElectricityRate },
            { label: "Printer Wattage (W)", val: printerWattage, set: setPrinterWattage },
            { label: "Profit Margin (%)", val: profitMargin, set: setProfitMargin },
            { label: `Wear & Tear Fee (${currencySymbol}/hr)`, val: wearAndTearFee, set: setWearAndTearFee },
            { label: "Tax Rate (%)", val: taxRate, set: setTaxRate },
          ].map((item, idx) => (
            <View key={idx} style={styles.inputGroup}>
              <Text style={styles.label}>{item.label}</Text>
              <TextInput
                style={styles.input}
                value={item.val.toString()}
                onChangeText={(v) => item.set(parseFloat(v) || 0)}
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>

        {/* Section 4: Danger Zone */}
        {renderSectionHeader("Danger Zone")}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerBtn} onPress={() => clearAllQuotes()}>
            <Text style={styles.dangerBtnText}>Clear Export History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dangerBtn, { marginTop: 12 }]} onPress={handleFactoryReset}>
            <Text style={styles.dangerBtnText}>Factory Reset App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { padding: 16, paddingBottom: 40 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
  sectionHeader: { marginBottom: 12, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#666" },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 16,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: "#444", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  toggleRow: { flexDirection: "row", marginBottom: 16, borderRadius: 6, overflow: "hidden", borderWidth: 1, borderColor: "#007AFF" },
  toggleBtn: { flex: 1, padding: 10, alignItems: "center", backgroundColor: "#fff" },
  toggleBtnActive: { backgroundColor: "#007AFF" },
  toggleBtnText: { color: "#007AFF", fontWeight: "bold" },
  toggleBtnTextActive: { color: "#fff" },
  dangerBtn: { backgroundColor: "#fff", padding: 15, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#FF3B30" },
  dangerBtnText: { color: "#FF3B30", fontWeight: "bold" },
});

export default SettingsScreen;
