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
import { useNavigation } from "@react-navigation/native";
import { useStore, MaterialProfile } from "../store/useStore";

const MaterialsScreen = () => {
  const navigation = useNavigation<any>();
  const {
    isSetupComplete,
    materials,
    weightUnit,
    currencySymbol,
    addMaterial,
    updateMaterial,
    removeMaterial,
  } = useStore();

  // New Material Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  // Per-Material Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // Per-Material Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isSetupComplete) {
    return (
      <SafeAreaView style={styles.lockoutArea}>
        <View style={styles.lockoutContainer}>
          <Text style={styles.lockoutTitle}>Setup Required</Text>
          <Text style={styles.lockoutMessage}>
            Please configure your global settings before adding materials.
          </Text>
          <TouchableOpacity
            style={styles.setupNavigateBtn}
            onPress={() => navigation.navigate("Settings")}>
            <Text style={styles.btnText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddMaterial = () => {
    if (name && price) {
      addMaterial({ name, price: parseFloat(price) });
      setName("");
      setPrice("");
    }
  };

  const startEditingMaterial = (item: MaterialProfile) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
  };

  const saveEditedMaterial = () => {
    if (editingId && editName && editPrice) {
      updateMaterial(editingId, {
        name: editName,
        price: parseFloat(editPrice),
      });
      setEditingId(null);
    }
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Material Management</Text>

        {/* Add New Material */}
        {renderSectionHeader("Add New Material")}
        <View style={styles.section}>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <View style={[styles.row, { marginTop: 8, alignItems: "center" }]}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder={`Price (${currencySymbol})`}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <Text style={styles.unitLabel}>per {weightUnit}</Text>
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
                    <TextInput
                      style={styles.input}
                      value={editName}
                      onChangeText={setEditName}
                    />
                    <View
                      style={[
                        styles.row,
                        { marginTop: 8, alignItems: "center" },
                      ]}>
                      <TextInput
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        value={editPrice}
                        onChangeText={setEditPrice}
                        keyboardType="numeric"
                      />
                      <Text style={styles.unitLabel}>per {weightUnit}</Text>
                    </View>
                    <View style={[styles.row, { marginTop: 8 }]}>
                      <TouchableOpacity
                        style={[
                          styles.saveSmallButton,
                          { flex: 1, marginRight: 4 },
                        ]}
                        onPress={saveEditedMaterial}>
                        <Text style={styles.buttonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.cancelSmallButton,
                          { flex: 1, marginLeft: 4 },
                        ]}
                        onPress={() => setEditingId(null)}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : confirmDeleteId === item.id ? (
                  /* DELETE CONFIRM MODE */
                  <View style={styles.confirmDeleteContainer}>
                    <Text style={styles.confirmDeleteText}>
                      Delete "{item.name}"?
                    </Text>
                    <View style={styles.row}>
                      <TouchableOpacity
                        style={styles.confirmDeleteButton}
                        onPress={() => {
                          removeMaterial(item.id);
                          setConfirmDeleteId(null);
                        }}>
                        <Text style={styles.buttonText}>Confirm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelDeleteButton}
                        onPress={() => setConfirmDeleteId(null)}>
                        <Text style={styles.cancelDeleteButtonText}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* VIEW MODE */
                  <>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.materialName}>{item.name}</Text>
                      <Text style={styles.materialDetails}>
                        {currencySymbol}
                        {item.price} per {weightUnit}
                      </Text>
                    </View>
                    <View style={styles.materialActions}>
                      <TouchableOpacity
                        style={styles.editActionButton}
                        onPress={() => startEditingMaterial(item)}>
                        <Text style={styles.editActionButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteActionButton}
                        onPress={() => setConfirmDeleteId(item.id)}>
                        <Text style={styles.deleteActionButtonText}>
                          Delete
                        </Text>
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
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#666" },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  unitLabel: { fontSize: 16, color: "#666" },
  row: { flexDirection: "row" },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  materialItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  materialName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  materialDetails: { fontSize: 14, color: "#666" },
  materialActions: { flexDirection: "row", marginTop: 8 },
  editActionButton: {
    backgroundColor: "#E5E5EA",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  editActionButtonText: { color: "#007AFF", fontSize: 12, fontWeight: "bold" },
  deleteActionButton: {
    backgroundColor: "#FFE5E5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  deleteActionButtonText: {
    color: "#FF3B30",
    fontSize: 12,
    fontWeight: "bold",
  },
  saveSmallButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  cancelSmallButton: {
    backgroundColor: "#E5E5EA",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  cancelButtonText: { color: "#333", fontSize: 16, fontWeight: "bold" },
  confirmDeleteContainer: { alignItems: "center", padding: 8 },
  confirmDeleteText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF3B30",
    marginBottom: 12,
  },
  confirmDeleteButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  cancelDeleteButton: {
    backgroundColor: "#E5E5EA",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  cancelDeleteButtonText: { color: "#333", fontWeight: "bold" },
  emptyText: { textAlign: "center", color: "#999", paddingVertical: 10 },

  /* Lockout Styles */
  lockoutArea: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  lockoutContainer: { padding: 30, alignItems: "center" },
  lockoutTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  lockoutMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  setupNavigateBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default MaterialsScreen;
