import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore, MaterialProfile } from "../store/useStore";

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
    updateMaterial,
    removeMaterial,
  } = useStore();

  // Edit Mode State for Global Settings
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [tempRate, setTempRate] = useState(electricityRate.toString());
  const [tempWattage, setTempWattage] = useState(printerWattage.toString());
  const [tempMargin, setTempMargin] = useState(profitMargin.toString());
  const [tempFee, setTempFee] = useState(wearAndTearFee.toString());

  // New Material Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");

  // Per-Material Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editUnit, setEditUnit] = useState("");

  // Per-Material Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleEditToggle = () => {
    if (isEditingSettings) {
      setTempRate(electricityRate.toString());
      setTempWattage(printerWattage.toString());
      setTempMargin(profitMargin.toString());
      setTempFee(wearAndTearFee.toString());
    } else {
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
      addMaterial({ name, price: parseFloat(price), unit });
      setName("");
      setPrice("");
    }
  };

  const startEditingMaterial = (item: MaterialProfile) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditUnit(item.unit);
  };

  const saveEditedMaterial = () => {
    if (editingId && editName && editPrice) {
      updateMaterial(editingId, {
        name: editName,
        price: parseFloat(editPrice),
        unit: editUnit,
      });
      setEditingId(null);
    }
  };

  const renderSectionHeader = (title: string, action?: React.ReactNode) => (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );

  const UnitSelector = ({ selected, onSelect }: { selected: string; onSelect: (u: string) => void }) => (
    <View style={styles.unitSelector}>
      {["g", "kg", "lb"].map((u) => (
        <TouchableOpacity
          key={u}
          onPress={() => onSelect(u)}
          style={[styles.unitButton, selected === u && styles.unitButtonActive]}
        >
          <Text style={[styles.unitButtonText, selected === u && styles.unitButtonTextActive]}>
            {u}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Material Profiles & Settings</Text>

        {/* Global Settings */}
        {renderSectionHeader(
          "Global Settings",
          <TouchableOpacity onPress={handleEditToggle} style={styles.editLink}>
            <Text style={styles.editLinkText}>{isEditingSettings ? "Cancel" : "Edit"}</Text>
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
                <TextInput style={styles.input} value={item.val.toString()} onChangeText={item.set} keyboardType="numeric" />
              ) : (
                <View style={styles.readOnlyBox}><Text style={styles.readOnlyText}>{item.val}</Text></View>
              )}
            </View>
          ))}
          {isEditingSettings && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
              <Text style={styles.buttonText}>Save Settings</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Add New Material */}
        {renderSectionHeader("Add New Material")}
        <View style={styles.section}>
          <TextInput style={styles.input} placeholder="Material Name" value={name} onChangeText={setName} />
          <View style={[styles.row, { marginTop: 8 }]}>
            <TextInput style={[styles.input, { flex: 2, marginRight: 8 }]} placeholder="Price ($)" value={price} onChangeText={setPrice} keyboardType="numeric" />
            <UnitSelector selected={unit} onSelect={setUnit} />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleAddMaterial}>
            <Text style={styles.buttonText}>Save Material</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Materials */}
        {renderSectionHeader("Saved Materials")}
        <View style={styles.section}>
          {materials.length === 0 ? (
            <Text style={styles.emptyText}>No materials saved yet.</Text>
          ) : (
            materials.map((item) => (
              <View key={item.id} style={styles.materialItem}>
                {editingId === item.id ? (
                  /* EDIT MODE */
                  <View style={{ flex: 1 }}>
                    <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
                    <View style={[styles.row, { marginTop: 8 }]}>
                      <TextInput style={[styles.input, { flex: 2, marginRight: 8 }]} value={editPrice} onChangeText={setEditPrice} keyboardType="numeric" />
                      <UnitSelector selected={editUnit} onSelect={setEditUnit} />
                    </View>
                    <View style={[styles.row, { marginTop: 8 }]}>
                      <TouchableOpacity style={[styles.saveSmallButton, { flex: 1, marginRight: 4 }]} onPress={saveEditedMaterial}>
                        <Text style={styles.buttonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.cancelSmallButton, { flex: 1, marginLeft: 4 }]} onPress={() => setEditingId(null)}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : confirmDeleteId === item.id ? (
                  /* DELETE CONFIRM MODE */
                  <View style={styles.confirmDeleteContainer}>
                    <Text style={styles.confirmDeleteText}>Delete "{item.name}"?</Text>
                    <View style={styles.row}>
                      <TouchableOpacity style={styles.confirmDeleteButton} onPress={() => { removeMaterial(item.id); setConfirmDeleteId(null); }}>
                        <Text style={styles.buttonText}>Confirm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.cancelDeleteButton} onPress={() => setConfirmDeleteId(null)}>
                        <Text style={styles.cancelDeleteButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* VIEW MODE */
                  <>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.materialName}>{item.name}</Text>
                      <Text style={styles.materialDetails}>${item.price} per {item.unit}</Text>
                    </View>
                    <View style={styles.materialActions}>
                      <TouchableOpacity style={styles.editActionButton} onPress={() => startEditingMaterial(item)}>
                        <Text style={styles.editActionButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteActionButton} onPress={() => setConfirmDeleteId(item.id)}>
                        <Text style={styles.deleteActionButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
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
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#666" },
  editLink: { padding: 4 },
  editLinkText: { color: "#007AFF", fontWeight: "bold" },
  section: { backgroundColor: "#fff", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: "#e0e0e0", marginBottom: 16 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, color: "#444", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 10, fontSize: 16 },
  readOnlyBox: { padding: 10, backgroundColor: "#f9f9f9", borderRadius: 4, borderWidth: 1, borderColor: "#eee" },
  readOnlyText: { fontSize: 16, color: "#333" },
  row: { flexDirection: "row" },
  unitSelector: { flexDirection: "row", flex: 1.5, borderWidth: 1, borderColor: "#ccc", borderRadius: 4, overflow: "hidden" },
  unitButton: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  unitButtonActive: { backgroundColor: "#007AFF" },
  unitButtonText: { fontSize: 14, color: "#666" },
  unitButtonTextActive: { color: "#fff", fontWeight: "bold" },
  saveButton: { backgroundColor: "#28a745", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 8 },
  button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  materialItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  materialName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  materialDetails: { fontSize: 14, color: "#666" },
  materialActions: { flexDirection: "row", marginTop: 8 },
  editActionButton: { backgroundColor: "#E5E5EA", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4, marginRight: 8 },
  editActionButtonText: { color: "#007AFF", fontSize: 12, fontWeight: "bold" },
  deleteActionButton: { backgroundColor: "#FFE5E5", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  deleteActionButtonText: { color: "#FF3B30", fontSize: 12, fontWeight: "bold" },
  saveSmallButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 4, alignItems: "center" },
  cancelSmallButton: { backgroundColor: "#E5E5EA", padding: 10, borderRadius: 4, alignItems: "center" },
  cancelButtonText: { color: "#333", fontSize: 16, fontWeight: "bold" },
  confirmDeleteContainer: { alignItems: "center", padding: 8 },
  confirmDeleteText: { fontSize: 16, fontWeight: "bold", color: "#FF3B30", marginBottom: 12 },
  confirmDeleteButton: { backgroundColor: "#FF3B30", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4, marginRight: 8 },
  cancelDeleteButton: { backgroundColor: "#E5E5EA", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 },
  cancelDeleteButtonText: { color: "#333", fontWeight: "bold" },
  emptyText: { textAlign: "center", color: "#999", paddingVertical: 10 },
});

export default VaultScreen;
