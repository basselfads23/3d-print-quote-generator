import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/useStore";
import { useTheme } from "../theme";

const CalculatorScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const {
    isSetupComplete,
    materials,
    electricityRate,
    printerWattage,
    profitMargin,
    wearAndTearFee,
    taxRate,
    currencySymbol,
    weightUnit,
    addMaterial,
    addQuoteToHistory,
  } = useStore();

  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null,
  );
  const [printHours, setPrintHours] = useState("");
  const [modelWeight, setModelWeight] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastFinalQuote, setLastFinalQuote] = useState<number | null>(null);

  const purchaseUnit = "kg";

  // Quick Add State
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  if (!isSetupComplete) {
    return (
      <SafeAreaView
        style={[styles.lockoutArea, { backgroundColor: theme.background }]}>
        <View style={styles.lockoutContainer}>
          <Text style={[styles.lockoutTitle, { color: theme.text }]}>
            Setup Required
          </Text>
          <Text style={[styles.lockoutMessage, { color: theme.textSecondary }]}>
            Please configure your global settings before calculating quotes.
          </Text>
          <TouchableOpacity
            style={[
              styles.setupNavigateBtn,
              { backgroundColor: theme.primary },
            ]}
            onPress={() => navigation.navigate("Settings")}>
            <Text style={[styles.btnText, { color: theme.background }]}>
              Go to Settings
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const handleCalculate = () => {
    if (!selectedMaterial) {
      Alert.alert("Error", "Please select a material first.");
      return;
    }
    if (!printHours || !modelWeight) {
      Alert.alert("Error", "Please enter print time and model weight.");
      return;
    }

    const hours = parseFloat(printHours);
    const weight = parseFloat(modelWeight);

    if (isNaN(hours) || isNaN(weight) || hours < 0 || weight < 0) {
      Alert.alert("Error", "Please enter valid numbers for time and weight.");
      return;
    }

    const pricePerBaseUnit =
      weightUnit === "g"
        ? selectedMaterial.price / 1000
        : selectedMaterial.price / 35.274;

    const materialCost = pricePerBaseUnit * weight;
    const electricityCost = (printerWattage / 1000) * electricityRate * hours;
    const wearAndTearCost = wearAndTearFee * hours;

    const baseCost = materialCost + electricityCost + wearAndTearCost;
    const subtotal = baseCost * (1 + profitMargin / 100);
    const taxAmount = subtotal * (taxRate / 100);
    const finalQuote = subtotal + taxAmount;

    addQuoteToHistory({
      materialName: selectedMaterial.name,
      printTime: hours,
      modelWeight: weight,
      unit: weightUnit,
      materialCost,
      electricityCost,
      wearAndTearCost,
      baseCost,
      taxAmount,
      finalQuote,
    });

    setLastFinalQuote(finalQuote);
    setShowSuccess(true);
    setPrintHours("");
    setModelWeight("");
    setTimeout(() => setShowSuccess(false), 8000);
  };

  const handleQuickAdd = () => {
    if (newName && newPrice) {
      const price = parseFloat(newPrice);
      if (isNaN(price) || price < 0) {
        Alert.alert("Error", "Please enter a valid positive price.");
        return;
      }
      const id = Date.now().toString();
      addMaterial({ name: newName, price });
      setSelectedMaterialId(id);
      setIsAddingMaterial(false);
      setNewName("");
      setNewPrice("");
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={[]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          <Text style={[styles.header, { color: theme.text }]}>
            THE CALCULATOR
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            1. SELECT MATERIAL
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}>
            {materials.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.materialCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  selectedMaterialId === m.id && {
                    borderColor: theme.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedMaterialId(m.id)}>
                <Text style={[styles.materialCardText, { color: theme.text }]}>
                  {m.name}
                </Text>
                <Text
                  style={[
                    styles.materialCardSub,
                    { color: theme.textSecondary },
                  ]}>
                  {currencySymbol}
                  {m.price} / kg
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.materialCard,
                styles.addMaterialCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => setIsAddingMaterial(!isAddingMaterial)}>
              <Text
                style={[styles.addMaterialCardText, { color: theme.primary }]}>
                {isAddingMaterial ? "CANCEL" : "+ ADD NEW"}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {isAddingMaterial && (
            <View
              style={[
                styles.quickAddForm,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Material Name *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Price per kg ({currencySymbol}) *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  value={newPrice}
                  onChangeText={setNewPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.buttonSmall,
                    { flex: 1, marginRight: 4, backgroundColor: theme.primary },
                  ]}
                  onPress={handleQuickAdd}>
                  <Text style={[styles.btnText, { color: theme.background }]}>
                    SAVE & SELECT
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cancelSmallBtn,
                    { flex: 1, marginLeft: 4, backgroundColor: theme.border },
                  ]}
                  onPress={() => setIsAddingMaterial(false)}>
                  <Text style={[styles.cancelBtnText, { color: theme.text }]}>
                    CANCEL
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.inputSection}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              2. PRINT DETAILS
            </Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>
                Print Time (Hours) *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
                value={printHours}
                onChangeText={setPrintHours}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>
                Model Weight ({weightUnit}) *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
                value={modelWeight}
                onChangeText={setModelWeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.calculateButton, { backgroundColor: theme.primary }]}
            onPress={handleCalculate}>
            <Text
              style={[styles.calculateButtonText, { color: theme.background }]}>
              CALCULATE QUOTE
            </Text>
          </TouchableOpacity>

          {showSuccess && lastFinalQuote !== null && (
            <View style={styles.successMessage}>
              <Text style={[styles.massiveResult, { color: theme.primary }]}>
                {currencySymbol}
                {lastFinalQuote.toFixed(2)}
              </Text>
              <Text style={[styles.successText, { color: theme.success }]}>
                Quote saved to Export tab
              </Text>
            </View>
          )}
          
          <View style={{ height: 300 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  header: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: 1,
  },
  horizontalScroll: { flexDirection: "row", marginBottom: 20 },
  materialCard: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 120,
    alignItems: "center",
  },
  materialCardText: { fontSize: 14, fontWeight: "700" },
  materialCardSub: { fontSize: 12, marginTop: 4 },
  addMaterialCard: { borderStyle: "dashed", justifyContent: "center" },
  addMaterialCardText: { fontSize: 12, fontWeight: "800" },
  quickAddForm: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 20,
  },
  inputSection: { marginTop: 10 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 4, padding: 14, fontSize: 16 },
  row: { flexDirection: "row" },
  buttonSmall: { padding: 14, borderRadius: 4, alignItems: "center" },
  cancelSmallBtn: { padding: 14, borderRadius: 4, alignItems: "center" },
  btnText: { fontWeight: "800", fontSize: 12 },
  cancelBtnText: { fontWeight: "800", fontSize: 12 },
  calculateButton: {
    padding: 20,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 20,
  },
  calculateButtonText: { fontSize: 16, fontWeight: "800", letterSpacing: 1 },
  successMessage: { marginTop: 32, alignItems: "center" },
  massiveResult: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 8,
  },
  successText: { fontSize: 14, fontWeight: "700", textTransform: "uppercase" },
  lockoutArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  lockoutContainer: { padding: 30, alignItems: "center" },
  lockoutTitle: { fontSize: 24, fontWeight: "800", marginBottom: 10 },
  lockoutMessage: { fontSize: 16, textAlign: "center", marginBottom: 25 },
  setupNavigateBtn: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 4,
  },
});

export default CalculatorScreen;
