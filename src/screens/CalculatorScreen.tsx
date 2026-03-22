import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { useStore } from "../store/useStore";

const CalculatorScreen = () => {
  const {
    materials,
    electricityRate,
    printerWattage,
    profitMargin,
    wearAndTearFee,
    addMaterial,
    addQuoteToHistory,
  } = useStore();

  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [printHours, setPrintHours] = useState("");
  const [modelWeight, setModelWeight] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // "Add Quick Material" State
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newUnit, setNewUnit] = useState("kg");

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
    const finalQuote = baseCost * (1 + profitMargin / 100);

    addQuoteToHistory({
      materialName: selectedMaterial.name,
      printTime: hours,
      modelWeight: weight,
      unit: selectedMaterial.unit,
      materialCost,
      electricityCost,
      wearAndTearCost,
      baseCost,
      finalQuote,
    });

    setShowSuccess(true);
    setPrintHours("");
    setModelWeight("");
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleQuickAdd = () => {
    if (newName && newPrice) {
      const id = Date.now().toString();
      addMaterial({
        name: newName,
        price: parseFloat(newPrice),
        unit: newUnit,
      });
      setSelectedMaterialId(id); // Select it immediately
      setIsAddingMaterial(false);
      setNewName("");
      setNewPrice("");
    }
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
                ${m.price}/{m.unit}
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
            <TextInput style={styles.input} placeholder="Material Name" value={newName} onChangeText={setNewName} />
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 2, marginRight: 8 }]} placeholder="Price ($)" value={newPrice} onChangeText={setNewPrice} keyboardType="numeric" />
              <View style={styles.unitSelector}>
                {["g", "kg", "lb"].map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setNewUnit(u)}
                    style={[styles.unitButton, newUnit === u && styles.unitButtonActive]}
                  >
                    <Text style={[styles.unitButtonText, newUnit === u && styles.unitButtonTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity style={styles.buttonSmall} onPress={handleQuickAdd}>
              <Text style={styles.buttonText}>Quick Add & Select</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section 2: Inputs */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>2. Print Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Print Time (Hours)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10"
              value={printHours}
              onChangeText={setPrintHours}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Model Weight ({selectedMaterial ? selectedMaterial.unit : "Unit"})</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 0.5"
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

        {/* Section 4: Success Message */}
        {showSuccess && (
          <View style={styles.successMessage}>
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
  row: { flexDirection: "row", marginBottom: 8 },
  unitSelector: { flexDirection: "row", flex: 1.5, borderWidth: 1, borderColor: "#ccc", borderRadius: 4, overflow: "hidden" },
  unitButton: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  unitButtonActive: { backgroundColor: "#007AFF" },
  unitButtonText: { fontSize: 14, color: "#666" },
  unitButtonTextActive: { color: "#fff", fontWeight: "bold" },
  buttonSmall: { backgroundColor: "#28a745", padding: 12, borderRadius: 6, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  calculateButton: { backgroundColor: "#007AFF", padding: 18, borderRadius: 8, alignItems: "center", marginTop: 20 },
  calculateButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  successMessage: { marginTop: 20, padding: 15, backgroundColor: "#d4edda", borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#c3e6cb" },
  successText: { color: "#155724", fontWeight: "bold", fontSize: 16 },
});

export default CalculatorScreen;
