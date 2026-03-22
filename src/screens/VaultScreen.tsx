import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useStore } from "../store/useStore";

const VaultScreen = () => {
  const {
    electricityRate,
    printerWattage,
    profitMargin,
    wearAndTearFee,
    materials,
    setElectricityRate,
    setPrinterWattage,
    setProfitMargin,
    setWearAndTearFee,
    addMaterial,
    removeMaterial,
  } = useStore();

  // Edit Mode State for Global Settings
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [tempRate, setTempRate] = useState(electricityRate.toString());
  const [tempWattage, setTempWattage] = useState(printerWattage.toString());
  const [tempMargin, setTempMargin] = useState(profitMargin.toString());
  const [tempFee, setTempFee] = useState(wearAndTearFee.toString());

  // New Material Local State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg"); // Default unit

  const handleEditToggle = () => {
    if (isEditingSettings) {
      // Revert if cancel
      setTempRate(electricityRate.toString());
      setTempWattage(printerWattage.toString());
      setTempMargin(profitMargin.toString());
      setTempFee(wearAndTearFee.toString());
    } else {
      // Initialize temp state with current store values
      setTempRate(electricityRate.toString());
      setTempWattage(printerWattage.toString());
      setTempMargin(profitMargin.toString());
      setTempFee(wearAndTearFee.toString());
    }
    setIsEditingSettings(!isEditingSettings);
  };

  const handleSaveSettings = () => {
    setElectricityRate(parseFloat(tempRate) || 0);
    setPrinterWattage(parseFloat(tempWattage) || 0);
    setProfitMargin(parseFloat(tempMargin) || 0);
    setWearAndTearFee(parseFloat(tempFee) || 0);
    setIsEditingSettings(false);
  };

  const handleAddMaterial = () => {
    if (name && price) {
      addMaterial({
        name,
        price: parseFloat(price),
        unit,
      });
      setName("");
      setPrice("");
    }
  };

  const renderSectionHeader = (title: string, action?: React.ReactNode) => (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Material Profiles & Settings</Text>

        {/* Section 1: Global Settings */}
        {renderSectionHeader(
          "Global Settings",
          <TouchableOpacity onPress={handleEditToggle} style={styles.editButton}>
            <Text style={styles.editButtonText}>
              {isEditingSettings ? "Cancel" : "Edit"}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.section}>
          {[
            { label: "Electricity Rate ($/kWh)", val: isEditingSettings ? tempRate : electricityRate, set: setTempRate },
            { label: "Printer Wattage (W)", val: isEditingSettings ? tempWattage : printerWattage, set: setTempWattage },
            { label: "Profit Margin (%)", val: isEditingSettings ? tempMargin : profitMargin, set: setTempMargin },
            { label: "Wear & Tear Fee ($/hr)", val: isEditingSettings ? tempFee : wearAndTearFee, set: setTempFee },
          ].map((item, idx) => (
            <View key={idx} style={styles.inputGroup}>
              <Text style={styles.label}>{item.label}</Text>
              {isEditingSettings ? (
                <TextInput
                  style={styles.input}
                  value={item.val.toString()}
                  onChangeText={item.set}
                  keyboardType="numeric"
                />
              ) : (
                <View style={styles.readOnlyBox}>
                  <Text style={styles.readOnlyText}>{item.val}</Text>
                </View>
              )}
            </View>
          ))}

          {isEditingSettings && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
              <Text style={styles.buttonText}>Save Settings</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Section 2: Add Material */}
        {renderSectionHeader("Add New Material")}
        <View style={styles.section}>
          <TextInput
            style={styles.input}
            placeholder="Material Name (e.g. PLA White)"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 2, marginRight: 8 }]}
              placeholder="Price ($)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <View style={styles.unitSelector}>
              {["g", "kg", "lb"].map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUnit(u)}
                  style={[styles.unitButton, unit === u && styles.unitButtonActive]}
                >
                  <Text style={[styles.unitButtonText, unit === u && styles.unitButtonTextActive]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleAddMaterial}>
            <Text style={styles.buttonText}>Save Material</Text>
          </TouchableOpacity>
        </View>

        {/* Section 3: Saved Materials */}
        {renderSectionHeader("Saved Materials")}
        <View style={styles.section}>
          {materials.length === 0 ? (
            <Text style={styles.emptyText}>No materials saved yet.</Text>
          ) : (
            materials.map((item) => (
              <View key={item.id} style={styles.materialItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.materialName}>{item.name}</Text>
                  <Text style={styles.materialDetails}>
                    ${item.price} per {item.unit}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeMaterial(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#333" },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#666" },
  editButton: { padding: 4 },
  editButtonText: { color: "#007AFF", fontWeight: "bold" },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 16,
  },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, color: "#444", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  readOnlyBox: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },
  readOnlyText: { fontSize: 16, color: "#333" },
  row: { flexDirection: "row", marginBottom: 8 },
  unitSelector: {
    flexDirection: "row",
    flex: 1.5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden",
  },
  unitButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  unitButtonActive: { backgroundColor: "#007AFF" },
  unitButtonText: { fontSize: 14, color: "#666" },
  unitButtonTextActive: { color: "#fff", fontWeight: "bold" },
  saveButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  materialItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  materialName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  materialDetails: { fontSize: 14, color: "#666" },
  deleteButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  deleteButtonText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  emptyText: { textAlign: "center", color: "#999", paddingVertical: 10 },
});

export default VaultScreen;
