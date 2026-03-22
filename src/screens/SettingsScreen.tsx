import React, { useState, useEffect } from "react";
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
    isSetupComplete, completeSetup,
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

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);

  // Edit states for each section
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [editingVars, setEditingVars] = useState(false);

  // Temporary local states for editing/wizard
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

  // SYNC local state with store (CRITICAL for Factory Reset)
  useEffect(() => {
    setTmpName(businessName);
    setTmpContact(contactInfo);
    setTmpDesc(businessDescription);
    setTmpCurrency(currencySymbol);
    setTmpUnit(weightUnit);
    setTmpFont(pdfFont);
    setTmpRate(electricityRate.toString());
    setTmpWattage(printerWattage.toString());
    setTmpMargin(profitMargin.toString());
    setTmpFee(wearAndTearFee.toString());
    setTmpTax(taxRate.toString());
    
    // Reset wizard step if setup was revoked
    if (!isSetupComplete) {
      setCurrentStep(1);
    }
  }, [isSetupComplete, businessName, currencySymbol, weightUnit, electricityRate]);

  const currencyMap: { [key: string]: string } = { "USD": "$", "EUR": "€", "GBP": "£" };
  const revCurrencyMap: { [key: string]: string } = { "$": "USD", "€": "EUR", "£": "GBP" };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!tmpName.trim()) {
        Alert.alert("Required Field", "Please enter your Business Name.");
        return false;
      }
    } else if (step === 2) {
      if (!tmpCurrency || !tmpUnit || !tmpFont) {
        Alert.alert("Required Fields", "Please ensure all preferences are selected.");
        return false;
      }
    } else if (step === 3) {
      if (!tmpRate || !tmpWattage || !tmpMargin || !tmpFee) {
        Alert.alert("Required Fields", "Please fill in all required print variables.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        setBusinessName(tmpName);
        setContactInfo(tmpContact);
        setBusinessDescription(tmpDesc);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        setCurrencySymbol(tmpCurrency);
        setWeightUnit(tmpUnit);
        setPdfFont(tmpFont);
        setCurrentStep(3);
      }
    }
  };

  const handleFinishSetup = () => {
    if (validateStep(3)) {
      setElectricityRate(parseFloat(tmpRate) || 0);
      setPrinterWattage(parseFloat(tmpWattage) || 0);
      setProfitMargin(parseFloat(tmpMargin) || 0);
      setWearAndTearFee(parseFloat(tmpFee) || 0);
      setTaxRate(parseFloat(tmpTax) || 0);
      completeSetup();
    }
  };

  const handleSaveProfile = () => {
    if (!tmpName.trim()) {
      Alert.alert("Required Field", "Business Name is required.");
      return;
    }
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
    if (!tmpRate || !tmpWattage || !tmpMargin || !tmpFee) {
      Alert.alert("Required Fields", "Please fill in all required variables.");
      return;
    }
    setElectricityRate(parseFloat(tmpRate) || 0);
    setPrinterWattage(parseFloat(tmpWattage) || 0);
    setProfitMargin(parseFloat(tmpMargin) || 0);
    setWearAndTearFee(parseFloat(tmpFee) || 0);
    setTaxRate(parseFloat(tmpTax) || 0);
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

  if (!isSetupComplete) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>App Setup Wizard</Text>
          <Text style={styles.stepIndicator}>Step {currentStep} of 3</Text>

          {currentStep === 1 && (
            <View style={styles.section}>
              <Text style={styles.stepTitle}>1. Business Profile</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Name *</Text>
                <TextInput style={styles.input} value={tmpName} onChangeText={setTmpName} placeholder="e.g. My 3D Hub" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Info (Optional)</Text>
                <TextInput style={styles.input} value={tmpContact} onChangeText={setTmpContact} placeholder="Email/Phone" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Description (Optional)</Text>
                <TextInput style={[styles.input, { height: 60 }]} value={tmpDesc} onChangeText={setTmpDesc} multiline />
              </View>
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.btnText}>Next: Preferences</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.section}>
              <Text style={styles.stepTitle}>2. App Preferences</Text>
              
              <Text style={styles.label}>Currency Symbol *</Text>
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

              <Text style={styles.label}>Global Weight Unit *</Text>
              <View style={styles.toggleRow}>
                {["g", "oz"].map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setTmpUnit(u)}
                    style={[styles.toggleBtn, tmpUnit === u && styles.toggleBtnActive]}
                  >
                    <Text style={[styles.toggleBtnText, tmpUnit === u && styles.toggleBtnTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>PDF Font *</Text>
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
                <TouchableOpacity style={[styles.cancelBtn, { flex: 1, marginRight: 4 }]} onPress={() => setCurrentStep(1)}>
                  <Text style={styles.cancelBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.nextBtn, { flex: 2, marginLeft: 4 }]} onPress={handleNext}>
                  <Text style={styles.btnText}>Next: Print Variables</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.section}>
              <Text style={styles.stepTitle}>3. Print Variables</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Electricity Rate ({tmpCurrency}/kWh) *</Text>
                <TextInput style={styles.input} value={tmpRate} onChangeText={setTmpRate} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Printer Wattage (W) *</Text>
                <TextInput style={styles.input} value={tmpWattage} onChangeText={setTmpWattage} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Profit Margin (%) *</Text>
                <TextInput style={styles.input} value={tmpMargin} onChangeText={setTmpMargin} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Wear & Tear Fee ({tmpCurrency}/hr) *</Text>
                <TextInput style={styles.input} value={tmpFee} onChangeText={setTmpFee} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tax Rate (%) (Optional)</Text>
                <TextInput style={styles.input} value={tmpTax} onChangeText={setTmpTax} keyboardType="numeric" />
              </View>

              <View style={styles.row}>
                <TouchableOpacity style={[styles.cancelBtn, { flex: 1, marginRight: 4 }]} onPress={() => setCurrentStep(2)}>
                  <Text style={styles.cancelBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { flex: 2, marginLeft: 4 }]} onPress={handleFinishSetup}>
                  <Text style={styles.btnText}>Finish Setup</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>App Settings</Text>

        {/* Post-Setup Section 1: User Profile */}
        {renderSectionHeader("User Profile")}
        <View style={styles.section}>
          {!editingProfile ? (
            <>
              <DisplayBox label="Business Name *" value={businessName} />
              <DisplayBox label="Contact Info (Optional)" value={contactInfo} />
              <DisplayBox label="Description (Optional)" value={businessDescription} />
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditingProfile(true)}>
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Name *</Text>
                <TextInput style={styles.input} value={tmpName} onChangeText={setTmpName} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Info (Optional)</Text>
                <TextInput style={styles.input} value={tmpContact} onChangeText={setTmpContact} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Description (Optional)</Text>
                <TextInput style={[styles.input, { height: 60 }]} value={tmpDesc} onChangeText={setTmpDesc} multiline />
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.saveBtn, { flex: 1, marginRight: 4 }]} onPress={handleSaveProfile}>
                  <Text style={styles.btnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cancelBtn, { flex: 1, marginLeft: 4 }]} onPress={() => setEditingProfile(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Post-Setup Section 2: App Preferences */}
        {renderSectionHeader("App Preferences")}
        <View style={styles.section}>
          {!editingPrefs ? (
            <>
              <DisplayBox label="Currency *" value={`${revCurrencyMap[currencySymbol] || "USD"} (${currencySymbol})`} />
              <DisplayBox label="Weight Unit *" value={weightUnit} />
              <DisplayBox label="PDF Font *" value={pdfFont} />
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditingPrefs(true)}>
                <Text style={styles.editBtnText}>Edit Preferences</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Currency *</Text>
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
              <Text style={styles.label}>Global Weight Unit *</Text>
              <View style={styles.toggleRow}>
                {["g", "oz"].map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setTmpUnit(u)}
                    style={[styles.toggleBtn, tmpUnit === u && styles.toggleBtnActive]}
                  >
                    <Text style={[styles.toggleBtnText, tmpUnit === u && styles.toggleBtnTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>PDF Font *</Text>
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
                <TouchableOpacity style={[styles.cancelBtn, { flex: 1, marginLeft: 4 }]} onPress={() => setEditingPrefs(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Post-Setup Section 3: Print Variables */}
        {renderSectionHeader("Print Variables")}
        <View style={styles.section}>
          {!editingVars ? (
            <>
              <DisplayBox label={`Electricity Rate (${currencySymbol}/kWh) *`} value={`${currencySymbol}${electricityRate}`} />
              <DisplayBox label="Printer Wattage (W) *" value={`${printerWattage}W`} />
              <DisplayBox label="Profit Margin (%) *" value={`${profitMargin}%`} />
              <DisplayBox label={`Wear & Tear Fee (${currencySymbol}/hr) *`} value={`${currencySymbol}${wearAndTearFee}`} />
              <DisplayBox label="Tax Rate (%) (Optional)" value={`${taxRate}%`} />
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditingVars(true)}>
                <Text style={styles.editBtnText}>Edit Variables</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {[
                { label: `Electricity Rate (${currencySymbol}/kWh) *`, val: tmpRate, set: setTmpRate },
                { label: "Printer Wattage (W) *", val: tmpWattage, set: setTmpWattage },
                { label: "Profit Margin (%) *", val: tmpMargin, set: setTmpMargin },
                { label: `Wear & Tear Fee (${currencySymbol}/hr) *`, val: tmpFee, set: setTmpFee },
                { label: "Tax Rate (%) (Optional)", val: tmpTax, set: setTmpTax },
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
                <TouchableOpacity style={[styles.cancelBtn, { flex: 1, marginLeft: 4 }]} onPress={() => setEditingVars(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.dangerBtn} 
            onPress={() => Alert.alert("Clear History", "Delete all recent quotes?", [{text: "Cancel"}, {text: "Clear", style: "destructive", onPress: clearAllQuotes}])}
          >
            <Text style={styles.dangerBtnText}>Clear Export History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dangerBtn, { marginTop: 12 }]} onPress={() => Alert.alert("Factory Reset", "Reset EVERYTHING to defaults?", [{text: "Cancel"}, {text: "Reset", style: "destructive", onPress: () => factoryReset()}])}>
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
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#333" },
  stepIndicator: { fontSize: 14, color: "#666", marginBottom: 20, fontWeight: "600" },
  stepTitle: { fontSize: 20, fontWeight: "bold", color: "#007AFF", marginBottom: 15 },
  sectionHeader: { marginBottom: 12, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#666" },
  section: { backgroundColor: "#fff", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: "#e0e0e0", marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: "#444", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 12, fontSize: 16, backgroundColor: "#fff" },
  displayBox: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  displayLabel: { fontSize: 12, color: "#999", marginBottom: 2 },
  displayText: { fontSize: 16, color: "#333", fontWeight: "500" },
  nextBtn: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8, alignItems: "center" },
  saveBtn: { backgroundColor: "#28a745", padding: 12, borderRadius: 6, alignItems: "center" },
  cancelBtn: { backgroundColor: "#E5E5EA", padding: 12, borderRadius: 6, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelBtnText: { color: "#333", fontWeight: "bold", fontSize: 16 },
  editBtn: { marginTop: 10, padding: 10, alignItems: "center" },
  editBtnText: { color: "#007AFF", fontWeight: "bold" },
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
