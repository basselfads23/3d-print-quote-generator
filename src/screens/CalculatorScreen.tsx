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
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/useStore";

const CalculatorScreen = () => {
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

  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [printHours, setPrintHours] = useState("");
  const [modelWeight, setModelWeight] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastFinalQuote, setLastFinalQuote] = useState<number | null>(null);

  // "Add Quick Material" State
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  if (!isSetupComplete) {
    return (
      <SafeAreaView style={styles.lockoutArea}>
        <View style={styles.lockoutContainer}>
          <Text style={styles.lockoutTitle}>Setup Required</Text>
          <Text style={styles.lockoutMessage}>
            Please configure your global settings before calculating quotes.
          </Text>
          <TouchableOpacity 
            style={styles.setupNavigateBtn} 
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.btnText}>Go to Settings</Text>
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

    // Material Cost
    const materialCost = selectedMaterial.price * weight;

    // Electricity Cost = (kW) * ($/kWh) * (h)
    const electricityCost = (printerWattage / 1000) * electricityRate * hours;

    // Wear & Tear = ($/hr) * (hr)
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
    setTimeout(() => setShowSuccess(false), 5000); // Keep result longer
  };

  const handleQuickAdd = () => {
    if (newName && newPrice) {
      const id = Date.now().toString();
      addMaterial({
        name: newName,
        price: parseFloat(newPrice),
      });
      setSelectedMaterialId(id); // Select it immediately
      setIsAddingMaterial(false);
      setNewName("");
      setNewPrice("");
    }
  };

  const handleCancelQuickAdd = () => {
    setNewName("");
    setNewPrice("");
    setIsAddingMaterial(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>The Daily Calculator</Text>

        {/* Section 1: Material Selection */}
        <Text style={styles.sectionTitle}>1. Select Material</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {materials.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.materialCard, selectedMaterialId === m.id && styles.materialCardActive]}
              onPress={() => setSelectedMaterialId(m.id)}
            >
              <Text style={[styles.materialCardText, selectedMaterialId === m.id && styles.materialCardTextActive]}>
                {m.name}
              </Text>
              <Text style={[styles.materialCardSub, selectedMaterialId === m.id && styles.materialCardTextActive]}>
                {currencySymbol}{m.price}/{weightUnit}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.materialCard, styles.addMaterialCard]}
            onPress={() => setIsAddingMaterial(!isAddingMaterial)}
          >
            <Text style={styles.addMaterialCardText}>{isAddingMaterial ? "Cancel" : "+ Add New"}</Text>
          </TouchableOpacity>
        </ScrollView>

        {isAddingMaterial && (
          <View style={styles.quickAddForm}>
            <TextInput style={styles.input} value={newName} onChangeText={setNewName} />
            <View style={[styles.row, { marginTop: 8, alignItems: 'center' }]}>
              <TextInput 
                style={[styles.input, { flex: 1, marginRight: 8 }]} 
                value={newPrice} 
                onChangeText={setNewPrice} 
                keyboardType="numeric" 
              />
              <Text style={styles.unitLabel}>per {weightUnit}</Text>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.buttonSmall, { flex: 1, marginRight: 4 }]} onPress={handleQuickAdd}>
                <Text style={styles.btnText}>Quick Add & Select</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelSmallBtn, { flex: 1, marginLeft: 4 }]} onPress={handleCancelQuickAdd}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Section 2: Inputs */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>2. Print Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Print Time (Hours)</Text>
            <TextInput
              style={styles.input}
              value={printHours}
              onChangeText={setPrintHours}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Model Weight ({weightUnit})</Text>
            <TextInput
              style={styles.input}
              value={modelWeight}
              onChangeText={setModelWeight}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Section 3: Calculate Button */}
        <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
          <Text style={styles.calculateButtonText}>Calculate Final Quote</Text>
        </TouchableOpacity>

        {/* Section 4: Success Message & Result */}
        {showSuccess && lastFinalQuote !== null && (
          <View style={styles.successMessage}>
            <Text style={styles.resultValue}>{currencySymbol}{lastFinalQuote.toFixed(2)}</Text>
            <Text style={styles.successText}>Quote Saved to Export Tab!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#666", marginBottom: 12 },
  horizontalScroll: { flexDirection: "row", marginBottom: 16 },
  materialCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 10,
    minWidth: 100,
    alignItems: "center",
  },
  materialCardActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  materialCardText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  materialCardSub: { fontSize: 12, color: "#666" },
  materialCardTextActive: { color: "#fff" },
  addMaterialCard: { borderStyle: "dashed", justifyContent: "center" },
  addMaterialCardText: { color: "#007AFF", fontWeight: "bold" },
  quickAddForm: { backgroundColor: "#fff", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: "#e0e0e0", marginBottom: 16 },
  inputSection: { marginTop: 10 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: "#444", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 12, fontSize: 16, backgroundColor: "#fff" },
  unitLabel: { fontSize: 16, color: "#666" },
  row: { flexDirection: "row" },
  buttonSmall: { backgroundColor: "#28a745", padding: 12, borderRadius: 6, alignItems: "center" },
  cancelSmallBtn: { backgroundColor: "#E5E5EA", padding: 12, borderRadius: 6, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold" },
  cancelBtnText: { color: "#333", fontWeight: "bold" },
  calculateButton: { backgroundColor: "#007AFF", padding: 18, borderRadius: 8, alignItems: "center", marginTop: 20 },
  calculateButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  successMessage: { marginTop: 24, padding: 20, backgroundColor: "#d4edda", borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#c3e6cb" },
  resultValue: { fontSize: 36, fontWeight: "bold", color: "#155724", marginBottom: 4 },
  successText: { color: "#155724", fontWeight: "bold", fontSize: 16 },
  
  /* Lockout Styles */
  lockoutArea: { flex: 1, backgroundColor: "#fff", justifyContent: 'center', alignItems: 'center' },
  lockoutContainer: { padding: 30, alignItems: 'center' },
  lockoutTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  lockoutMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 25 },
  setupNavigateBtn: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
});

export default CalculatorScreen;
