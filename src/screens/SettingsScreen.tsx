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

  // Edit states for each section
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [editingVars, setEditingVars] = useState(false);

  // Temporary local states for editing
  const [tmpName, setTmpName] = useState(businessName);
  const [tmpContact, setTmpContact] = useState(contactInfo);
  const [tmpDesc, setTmpDesc] = useState(businessDescription);

  const [tmpCurrency, setTmpCurrency] = useState(currencySymbol);
  const [tmpUnit, setTmpUnit] = useState(weightUnit);
  const [tmpFont, setTmpFont] = useState(pdfFont);

  const [tmpRate, setTmpRate] = useState(electricityRate.toString());
  const [tmpWattage, setTmpWattage] = useState(printerWattage.toString());
  const [tmpMargin, setTmpMargin] = useState(profitMargin.toString());
  const [tmpFee, setTmpFee] = useState(wearAndTearFee.toString());
  const [tmpTax, setTmpTax] = useState(taxRate.toString());

  const currencyMap: { [key: string]: string } = { "USD": "$", "EUR": "€", "GBP": "£" };
  const revCurrencyMap: { [key: string]: string } = { "$": "USD", "€": "EUR", "£": "GBP" };

  const handleSaveProfile = () => {
    setBusinessName(tmpName);
    setContactInfo(tmpContact);
    setBusinessDescription(tmpDesc);
    setEditingProfile(false);
  };

  const handleSavePrefs = () => {
    setCurrencySymbol(tmpCurrency);
    setWeightUnit(tmpUnit);
    setPdfFont(tmpFont);
    setEditingPrefs(false);
  };

  const handleSaveVars = () => {
    setElectricityRate(parseFloat(tmpRate) || 0);
    setPrinterWattage(parseFloat(tmpWattage) || 0);
    setProfitMargin(parseFloat(tmpMargin) || 0);
    setWearAndTearFee(parseFloat(tmpFee) || 0);
    setTaxRate(parseFloat(tmpTax) || 0);
    setEditingVars(false);
  };

  const handleCancelProfile = () => {
    setTmpName(businessName);
    setTmpContact(contactInfo);
    setTmpDesc(businessDescription);
    setEditingProfile(false);
  };

  const handleCancelPrefs = () => {
    setTmpCurrency(currencySymbol);
    setTmpUnit(weightUnit);
    setTmpFont(pdfFont);
    setEditingPrefs(false);
  };

  const handleCancelVars = () => {
    setTmpRate(electricityRate.toString());
    setTmpWattage(printerWattage.toString());
    setTmpMargin(profitMargin.toString());
    setTmpFee(wearAndTearFee.toString());
    setTmpTax(taxRate.toString());
    setEditingVars(false);
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const DisplayBox = ({ label, value }: { label: string, value: string | number }) => (
    <View style={styles.displayBox}>
      <Text style={styles.displayLabel}>{label}</Text>
      <Text style={styles.displayText}>{value || "Not set"}</Text>
    </View>
  );

  const isProfileSetUp = businessName.trim() !== "" || contactInfo.trim() !== "" || businessDescription.trim() !== "";
  const areVarsSetUp = electricityRate !== 0 || printerWattage !== 0 || profitMargin !== 0 || wearAndTearFee !== 0 || taxRate !== 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>App Settings</Text>

        {/* Section 1: User Profile */}
        {renderSectionHeader("User Profile")}
        <View style={styles.section}>
          {!editingProfile ? (
            <>
              {isProfileSetUp ? (
                <>
                  <DisplayBox label="Business Name" value={businessName} />
                  <DisplayBox label="Contact Info" value={contactInfo} />
                  <DisplayBox label="Description" value={businessDescription} />
                  <TouchableOpacity style={styles.editBtn} onPress={() => {
                    setTmpName(businessName);
                    setTmpContact(contactInfo);
                    setTmpDesc(businessDescription);
                    setEditingProfile(true);
                  }}>
                    <Text style={styles.editBtnText}>Edit Profile</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.setupBtn} onPress={() => setEditingProfile(true)}>
                  <Text style={styles.setupBtnText}>Set Up Profile</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Name</Text>
                <TextInput style={styles.input} value={tmpName} onChangeText={setTmpName} placeholder="Acme 3D" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Info</Text>
                <TextInput style={styles.input} value={tmpContact} onChangeText={setTmpContact} placeholder="Email/Phone" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Description</Text>
                <TextInput style={[styles.input, { height: 60 }]} value={tmpDesc} onChangeText={setTmpDesc} multiline />
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.saveBtn, { flex: 1, marginRight: 4 }]} onPress={handleSaveProfile}>
                  <Text style={styles.btnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cancelBtn, { flex: 1, marginLeft: 4 }]} onPress={handleCancelProfile}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Section 2: App Preferences */}
        {renderSectionHeader("App Preferences")}
        <View style={styles.section}>
          {!editingPrefs ? (
            <>
              <DisplayBox label="Currency" value={`${revCurrencyMap[currencySymbol] || "USD"} (${currencySymbol})`} />
              <DisplayBox label="Weight Unit" value={weightUnit} />
              <DisplayBox label="PDF Font" value={pdfFont} />
              <TouchableOpacity style={styles.editBtn} onPress={() => {
                setTmpCurrency(currencySymbol);
                setTmpUnit(weightUnit);
                setTmpFont(pdfFont);
                setEditingPrefs(true);
              }}>
                <Text style={styles.editBtnText}>Edit Preferences</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Currency</Text>
              <View style={styles.toggleRow}>
                {["USD", "EUR", "GBP"].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setTmpCurrency(currencyMap[c])}
                    style={[styles.toggleBtn, tmpCurrency === currencyMap[c] && styles.toggleBtnActive]}
                  >
                    <Text style={[styles.toggleBtnText, tmpCurrency === currencyMap[c] && styles.toggleBtnTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Global Weight Unit</Text>
              <View style={styles.toggleRow}>
                {["g", "kg", "lb"].map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setTmpUnit(u)}
                    style={[styles.toggleBtn, tmpUnit === u && styles.toggleBtnActive]}
                  >
                    <Text style={[styles.toggleBtnText, tmpUnit === u && styles.toggleBtnTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>PDF Font</Text>
              <View style={styles.toggleRow}>
                {["Helvetica", "Times New Roman"].map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setTmpFont(f)}
                    style={[styles.toggleBtn, tmpFont === f && styles.toggleBtnActive]}
                  >
                    <Text style={[styles.toggleBtnText, tmpFont === f && styles.toggleBtnTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.saveBtn, { flex: 1, marginRight: 4 }]} onPress={handleSavePrefs}>
                  <Text style={styles.btnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cancelBtn, { flex: 1, marginLeft: 4 }]} onPress={handleCancelPrefs}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Section 3: Print Variables */}
        {renderSectionHeader("Print Variables")}
        <View style={styles.section}>
          {!editingVars ? (
            <>
              {areVarsSetUp ? (
                <>
                  <DisplayBox label="Electricity Rate" value={`${currencySymbol}${electricityRate}/kWh`} />
                  <DisplayBox label="Printer Wattage" value={`${printerWattage}W`} />
                  <DisplayBox label="Profit Margin" value={`${profitMargin}%`} />
                  <DisplayBox label="Wear & Tear" value={`${currencySymbol}${wearAndTearFee}/hr`} />
                  <DisplayBox label="Tax Rate" value={`${taxRate}%`} />
                  <TouchableOpacity style={styles.editBtn} onPress={() => {
                    setTmpRate(electricityRate.toString());
                    setTmpWattage(printerWattage.toString());
                    setTmpMargin(profitMargin.toString());
                    setTmpFee(wearAndTearFee.toString());
                    setTmpTax(taxRate.toString());
                    setEditingVars(true);
                  }}>
                    <Text style={styles.editBtnText}>Edit Variables</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.setupBtn} onPress={() => setEditingVars(true)}>
                  <Text style={styles.setupBtnText}>Set Up Variables</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              {[
                { label: "Electricity Rate", val: tmpRate, set: setTmpRate },
                { label: "Printer Wattage", val: tmpWattage, set: setTmpWattage },
                { label: "Profit Margin (%)", val: tmpMargin, set: setTmpMargin },
                { label: "Wear & Tear Fee", val: tmpFee, set: setTmpFee },
                { label: "Tax Rate (%)", val: tmpTax, set: setTmpTax },
              ].map((item, idx) => (
                <View key={idx} style={styles.inputGroup}>
                  <Text style={styles.label}>{item.label}</Text>
                  <TextInput style={styles.input} value={item.val} onChangeText={item.set} keyboardType="numeric" />
                </View>
              ))}
              <View style={styles.row}>
                <TouchableOpacity style={[styles.saveBtn, { flex: 1, marginRight: 4 }]} onPress={handleSaveVars}>
                  <Text style={styles.btnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cancelBtn, { flex: 1, marginLeft: 4 }]} onPress={handleCancelVars}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Section 4: Danger Zone */}
        {renderSectionHeader("Danger Zone")}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.dangerBtn} 
            onPress={() => Alert.alert("Clear History", "Delete all recent quotes?", [{text: "Cancel"}, {text: "Clear", style: "destructive", onPress: clearAllQuotes}])}
          >
            <Text style={styles.dangerBtnText}>Clear Export History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dangerBtn, { marginTop: 12 }]} onPress={() => Alert.alert("Factory Reset", "Reset EVERYTHING to defaults?", [{text: "Cancel"}, {text: "Reset", style: "destructive", onPress: factoryReset}])}>
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
  section: { backgroundColor: "#fff", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: "#e0e0e0", marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: "#444", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 12, fontSize: 16, backgroundColor: "#fff" },
  displayBox: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  displayLabel: { fontSize: 12, color: "#999", marginBottom: 2 },
  displayText: { fontSize: 16, color: "#333", fontWeight: "500" },
  setupBtn: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8, alignItems: "center" },
  setupBtnText: { color: "#fff", fontWeight: "bold" },
  editBtn: { marginTop: 10, padding: 10, alignItems: "center" },
  editBtnText: { color: "#007AFF", fontWeight: "bold" },
  saveBtn: { backgroundColor: "#28a745", padding: 12, borderRadius: 6, alignItems: "center" },
  cancelBtn: { backgroundColor: "#E5E5EA", padding: 12, borderRadius: 6, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold" },
  cancelBtnText: { color: "#333", fontWeight: "bold" },
  row: { flexDirection: "row" },
  toggleRow: { flexDirection: "row", marginBottom: 16, borderRadius: 6, overflow: "hidden", borderWidth: 1, borderColor: "#007AFF" },
  toggleBtn: { flex: 1, padding: 10, alignItems: "center", backgroundColor: "#fff" },
  toggleBtnActive: { backgroundColor: "#007AFF" },
  toggleBtnText: { color: "#007AFF", fontWeight: "bold" },
  toggleBtnTextActive: { color: "#fff" },
  dangerBtn: { backgroundColor: "#fff", padding: 15, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#FF3B30" },
  dangerBtnText: { color: "#FF3B30", fontWeight: "bold" },
});

export default SettingsScreen;
