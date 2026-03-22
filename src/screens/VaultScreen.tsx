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

  // New Material Local State
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");

  const handleAddMaterial = () => {
    if (name && weight && price) {
      addMaterial({
        name,
        weightInGrams: parseFloat(weight),
        price: parseFloat(price),
      });
      setName("");
      setWeight("");
      setPrice("");
    }
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Material Profiles & Settings</Text>

        {/* Section 1: Global Settings */}
        {renderSectionHeader("Global Settings")}
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Electricity Rate ($/kWh)</Text>
            <TextInput
              style={styles.input}
              value={electricityRate.toString()}
              onChangeText={(val) => setElectricityRate(parseFloat(val) || 0)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Printer Wattage (W)</Text>
            <TextInput
              style={styles.input}
              value={printerWattage.toString()}
              onChangeText={(val) => setPrinterWattage(parseFloat(val) || 0)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profit Margin (%)</Text>
            <TextInput
              style={styles.input}
              value={profitMargin.toString()}
              onChangeText={(val) => setProfitMargin(parseFloat(val) || 0)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Wear & Tear Fee ($/hr)</Text>
            <TextInput
              style={styles.input}
              value={wearAndTearFee.toString()}
              onChangeText={(val) => setWearAndTearFee(parseFloat(val) || 0)}
              keyboardType="numeric"
            />
          </View>
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
          <TextInput
            style={styles.input}
            placeholder="Spool Weight (g)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Price ($)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
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
                    {item.weightInGrams}g - ${item.price}
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
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, color: "#444", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
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
