import React, { useRef, useState } from "react";
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
import { useStore, MaterialProfile } from "../store/useStore";
import { useTheme } from "../theme";
import { useKeyboardScroll } from "../hooks/useKeyboardScroll";
import LabeledInput from "../components/LabeledInput";
import SectionLabel from "../components/SectionLabel";

const MaterialsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const {
    isSetupComplete,
    materials,
    currencySymbol,
    addMaterial,
    updateMaterial,
    removeMaterial,
  } = useStore();

  const { scrollViewRef, onScrollViewScroll, onFocusFor } =
    useKeyboardScroll();

  // New Material Form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  // Per-Material Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // Per-Material Delete Confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Refs for keyboard scroll
  const addNameRef = useRef<View>(null);
  const addPriceRef = useRef<View>(null);
  const editNameRef = useRef<View>(null);
  const editPriceRef = useRef<View>(null);

  if (!isSetupComplete) {
    return (
      <SafeAreaView
        style={[styles.lockoutArea, { backgroundColor: theme.background }]}>
        <View style={styles.lockoutContainer}>
          <Text style={[styles.lockoutTitle, { color: theme.text }]}>
            Setup Required
          </Text>
          <Text style={[styles.lockoutMessage, { color: theme.textSecondary }]}>
            Please configure your settings before adding materials.
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

  const handleAddMaterial = () => {
    if (!name.trim() || !price) {
      Alert.alert("Missing Fields", "Please enter a name and price.");
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid positive price.");
      return;
    }
    addMaterial({ name: name.trim(), price: parsedPrice });
    setName("");
    setPrice("");
  };

  const startEditingMaterial = (item: MaterialProfile) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setConfirmDeleteId(null);
  };

  const saveEditedMaterial = () => {
    if (!editingId || !editName.trim() || !editPrice) {
      Alert.alert("Missing Fields", "Please fill in both fields.");
      return;
    }
    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid positive price.");
      return;
    }
    updateMaterial(editingId, { name: editName.trim(), price: parsedPrice });
    setEditingId(null);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={[]}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        onScroll={onScrollViewScroll}
        scrollEventThrottle={16}>
        <Text style={[styles.header, { color: theme.text }]}>MATERIALS</Text>

        {/* ── ADD NEW MATERIAL ── */}
        <SectionLabel title="Add New Material" />
        <View
          style={[
            styles.section,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <LabeledInput
            ref={addNameRef}
            label="Material Name *"
            helper="e.g. PLA Black, PETG Clear"
            value={name}
            onChangeText={setName}
            onFocus={onFocusFor(addNameRef)}
          />
          <LabeledInput
            ref={addPriceRef}
            label={`Price per kilogram (${currencySymbol}) *`}
            helper="Enter the cost per 1 kg of this filament."
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            onFocus={onFocusFor(addPriceRef)}
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleAddMaterial}>
            <Text style={[styles.buttonText, { color: theme.background }]}>
              SAVE MATERIAL
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── SAVED MATERIALS ── */}
        <SectionLabel title="Saved Materials" />
        <View
          style={[
            styles.section,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          {materials.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No materials saved yet.
            </Text>
          ) : (
            materials.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.materialItem,
                  { borderBottomColor: theme.border },
                ]}>
                {editingId === item.id ? (
                  <View style={{ flex: 1 }}>
                    <LabeledInput
                      ref={editNameRef}
                      label="Name *"
                      value={editName}
                      onChangeText={setEditName}
                      onFocus={onFocusFor(editNameRef)}
                    />
                    <LabeledInput
                      ref={editPriceRef}
                      label={`Price per kg (${currencySymbol}) *`}
                      value={editPrice}
                      onChangeText={setEditPrice}
                      keyboardType="numeric"
                      onFocus={onFocusFor(editPriceRef)}
                    />
                    <View style={[styles.row, { marginTop: 4 }]}>
                      <TouchableOpacity
                        style={[
                          styles.saveSmallButton,
                          {
                            flex: 1,
                            marginRight: 4,
                            backgroundColor: theme.success,
                          },
                        ]}
                        onPress={saveEditedMaterial}>
                        <Text style={[styles.buttonText, { color: "#fff" }]}>
                          SAVE
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.cancelSmallButton,
                          {
                            flex: 1,
                            marginLeft: 4,
                            backgroundColor: theme.border,
                          },
                        ]}
                        onPress={() => setEditingId(null)}>
                        <Text
                          style={[styles.buttonText, { color: theme.text }]}>
                          CANCEL
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : confirmDeleteId === item.id ? (
                  <View style={styles.confirmDeleteContainer}>
                    <Text
                      style={[
                        styles.confirmDeleteText,
                        { color: theme.danger },
                      ]}>
                      Delete "{item.name}"?
                    </Text>
                    <View style={styles.row}>
                      <TouchableOpacity
                        style={[
                          styles.confirmDeleteButton,
                          { backgroundColor: theme.danger },
                        ]}
                        onPress={() => {
                          removeMaterial(item.id);
                          setConfirmDeleteId(null);
                        }}>
                        <Text style={[styles.buttonText, { color: "#fff" }]}>
                          DELETE
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.cancelDeleteButton,
                          { backgroundColor: theme.border },
                        ]}
                        onPress={() => setConfirmDeleteId(null)}>
                        <Text
                          style={[styles.buttonText, { color: theme.text }]}>
                          CANCEL
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.materialName, { color: theme.text }]}>
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.materialDetails,
                          { color: theme.textSecondary },
                        ]}>
                        {currencySymbol}
                        {item.price} per kg
                      </Text>
                    </View>
                    <View style={styles.materialActions}>
                      <TouchableOpacity
                        style={[
                          styles.editActionButton,
                          { backgroundColor: theme.border },
                        ]}
                        onPress={() => startEditingMaterial(item)}>
                        <Text
                          style={[
                            styles.actionButtonText,
                            { color: theme.text },
                          ]}>
                          EDIT
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.deleteActionButton,
                          { backgroundColor: theme.danger + "20" },
                        ]}
                        onPress={() => setConfirmDeleteId(item.id)}>
                        <Text
                          style={[
                            styles.actionButtonText,
                            { color: theme.danger },
                          ]}>
                          DELETE
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
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
  section: { padding: 16, borderRadius: 4, borderWidth: 1, marginBottom: 24 },
  row: { flexDirection: "row" },
  button: { padding: 16, borderRadius: 4, alignItems: "center", marginTop: 4 },
  buttonText: { fontWeight: "800", fontSize: 14 },
  materialItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  materialName: { fontSize: 16, fontWeight: "700" },
  materialDetails: { fontSize: 13, marginTop: 4 },
  materialActions: { flexDirection: "row" },
  editActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
    marginRight: 8,
  },
  deleteActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
  },
  actionButtonText: { fontSize: 11, fontWeight: "800" },
  saveSmallButton: { padding: 12, borderRadius: 4, alignItems: "center" },
  cancelSmallButton: { padding: 12, borderRadius: 4, alignItems: "center" },
  confirmDeleteContainer: { flex: 1, alignItems: "center", padding: 8 },
  confirmDeleteText: { fontSize: 15, fontWeight: "800", marginBottom: 12 },
  confirmDeleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  cancelDeleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  emptyText: { textAlign: "center", paddingVertical: 20, fontWeight: "600" },
  lockoutArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  lockoutContainer: { padding: 30, alignItems: "center" },
  lockoutTitle: { fontSize: 24, fontWeight: "800", marginBottom: 10 },
  lockoutMessage: { fontSize: 16, textAlign: "center", marginBottom: 25 },
  setupNavigateBtn: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 4,
  },
  btnText: { fontWeight: "800", fontSize: 14 },
});

export default MaterialsScreen;
