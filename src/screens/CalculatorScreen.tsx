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
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/useStore";
import { useTheme } from "../theme";
import { useKeyboardScroll } from "../hooks/useKeyboardScroll";
import LabeledInput from "../components/LabeledInput";
import SectionLabel from "../components/SectionLabel";

type Theme = ReturnType<typeof useTheme>;

interface QuoteBreakdown {
  materialName: string;
  materialCost: number;
  electricityCost: number;
  wearAndTearCost: number;
  baseCost: number;
  taxAmount: number;
  finalQuote: number;
}

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

  const { scrollViewRef, onScrollViewScroll, onFocusFor } =
    useKeyboardScroll();

  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null,
  );
  const [printHours, setPrintHours] = useState("");
  const [modelWeight, setModelWeight] = useState("");
  const [lastQuote, setLastQuote] = useState<QuoteBreakdown | null>(null);

  // Quick Add State
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // Refs for keyboard scroll
  const printHoursRef = useRef<View>(null);
  const modelWeightRef = useRef<View>(null);
  const quickNameRef = useRef<View>(null);
  const quickPriceRef = useRef<View>(null);

  if (!isSetupComplete) {
    return (
      <SafeAreaView
        style={[styles.lockoutArea, { backgroundColor: theme.background }]}>
        <View style={styles.lockoutContainer}>
          <Text style={[styles.lockoutTitle, { color: theme.text }]}>
            Setup Required
          </Text>
          <Text style={[styles.lockoutMessage, { color: theme.textSecondary }]}>
            Please configure your settings before calculating quotes.
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
      Alert.alert("No Material Selected", "Please select a material first.");
      return;
    }
    if (!printHours || !modelWeight) {
      Alert.alert(
        "Missing Fields",
        "Please enter print time and model weight.",
      );
      return;
    }

    const hours = parseFloat(printHours);
    const weight = parseFloat(modelWeight);

    if (isNaN(hours) || isNaN(weight) || hours <= 0 || weight <= 0) {
      Alert.alert(
        "Invalid Input",
        "Print time and weight must be positive numbers.",
      );
      return;
    }

    // Convert price per kg to price per user's weight unit
    // g: divide by 1000 | oz: divide by 35.274 (oz per kg)
    const pricePerUnit =
      weightUnit === "g"
        ? selectedMaterial.price / 1000
        : selectedMaterial.price / 35.274;

    const materialCost = pricePerUnit * weight;
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

    setLastQuote({
      materialName: selectedMaterial.name,
      materialCost,
      electricityCost,
      wearAndTearCost,
      baseCost,
      taxAmount,
      finalQuote,
    });

    setPrintHours("");
    setModelWeight("");
  };

  const handleQuickAdd = () => {
    if (!newName.trim() || !newPrice) {
      Alert.alert("Missing Fields", "Please enter a name and price.");
      return;
    }
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid positive price.");
      return;
    }
    addMaterial({ name: newName.trim(), price });
    // Zustand set() is synchronous — get the newly appended material
    const { materials: updated } = useStore.getState();
    const newMat = updated[updated.length - 1];
    if (newMat) setSelectedMaterialId(newMat.id);
    setIsAddingMaterial(false);
    setNewName("");
    setNewPrice("");
  };

  const clearQuote = () => setLastQuote(null);

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
        <Text style={[styles.header, { color: theme.text }]}>
          THE CALCULATOR
        </Text>

        {/* ── 1. MATERIAL ── */}
        <SectionLabel title="1. Select Material" style={styles.sectionLabelSpacing} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          keyboardShouldPersistTaps="handled">
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
                {m.price}/kg
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

        {weightUnit === "oz" && (
          <Text style={[styles.unitNote, { color: theme.textSecondary }]}>
            Material prices are per kg — cost is auto-converted for oz.
          </Text>
        )}

        {isAddingMaterial && (
          <View
            style={[
              styles.quickAddForm,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <LabeledInput
              ref={quickNameRef}
              label="Material Name *"
              value={newName}
              onChangeText={setNewName}
              onFocus={onFocusFor(quickNameRef)}
            />
            <LabeledInput
              ref={quickPriceRef}
              label={`Price per kg (${currencySymbol}) *`}
              helper="How much you paid for 1 kg of this filament."
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
              onFocus={onFocusFor(quickPriceRef)}
            />
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
                  styles.buttonSmall,
                  { flex: 1, marginLeft: 4, backgroundColor: theme.border },
                ]}
                onPress={() => setIsAddingMaterial(false)}>
                <Text style={[styles.btnText, { color: theme.text }]}>
                  CANCEL
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── 2. PRINT DETAILS ── */}
        <View style={styles.inputSection}>
          <SectionLabel title="2. Print Details" style={styles.sectionLabelSpacing} />
          <LabeledInput
            ref={printHoursRef}
            label="Print Time (hours) *"
            helper="Total hours the printer will run."
            value={printHours}
            onChangeText={(v) => {
              setPrintHours(v);
              if (lastQuote) clearQuote();
            }}
            keyboardType="numeric"
            onFocus={onFocusFor(printHoursRef)}
          />
          <LabeledInput
            ref={modelWeightRef}
            label={`Model Weight (${weightUnit}) *`}
            helper={
              weightUnit === "g"
                ? "Weight of filament used in grams."
                : "Weight of filament used in ounces."
            }
            value={modelWeight}
            onChangeText={(v) => {
              setModelWeight(v);
              if (lastQuote) clearQuote();
            }}
            keyboardType="numeric"
            onFocus={onFocusFor(modelWeightRef)}
          />
        </View>

        <TouchableOpacity
          style={[styles.calculateButton, { backgroundColor: theme.primary }]}
          onPress={handleCalculate}>
          <Text
            style={[styles.calculateButtonText, { color: theme.background }]}>
            CALCULATE QUOTE
          </Text>
        </TouchableOpacity>

        {/* ── QUOTE CARD (screenshot-friendly) ── */}
        {lastQuote !== null && (
          <View
            style={[
              styles.quoteCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.primary,
              },
            ]}>
            {/* Header row */}
            <View style={styles.quoteCardHeader}>
              <Text style={[styles.quoteCardTitle, { color: theme.text }]}>
                3D PRINT QUOTE
              </Text>
              <TouchableOpacity onPress={clearQuote} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Ionicons
                  name="close"
                  size={18}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[styles.cardDivider, { backgroundColor: theme.border }]}
            />

            {/* Cost breakdown lines */}
            <QuoteLine
              label={`Filament (${lastQuote.materialName})`}
              value={`${currencySymbol}${lastQuote.materialCost.toFixed(2)}`}
              theme={theme}
            />
            <QuoteLine
              label="Electricity"
              value={`${currencySymbol}${lastQuote.electricityCost.toFixed(2)}`}
              theme={theme}
            />
            <QuoteLine
              label="Wear & Tear"
              value={`${currencySymbol}${lastQuote.wearAndTearCost.toFixed(2)}`}
              theme={theme}
            />

            <View
              style={[styles.cardDivider, { backgroundColor: theme.border }]}
            />

            <QuoteLine
              label="Base Cost"
              value={`${currencySymbol}${lastQuote.baseCost.toFixed(2)}`}
              theme={theme}
            />
            {profitMargin > 0 && (
              <QuoteLine
                label={`Profit Margin (${profitMargin}%)`}
                value={`+${currencySymbol}${(lastQuote.baseCost * (profitMargin / 100)).toFixed(2)}`}
                theme={theme}
              />
            )}

            {lastQuote.taxAmount > 0 && (
              <>
                <View
                  style={[
                    styles.cardDivider,
                    { backgroundColor: theme.border },
                  ]}
                />
                <QuoteLine
                  label={`Tax (${taxRate}%)`}
                  value={`+${currencySymbol}${lastQuote.taxAmount.toFixed(2)}`}
                  theme={theme}
                />
              </>
            )}

            {/* Total row */}
            <View
              style={[
                styles.totalRow,
                { borderTopColor: theme.border, marginTop: 8 },
              ]}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>
                TOTAL
              </Text>
              <Text style={[styles.totalValue, { color: theme.primary }]}>
                {currencySymbol}
                {lastQuote.finalQuote.toFixed(2)}
              </Text>
            </View>

            <Text style={[styles.savedNote, { color: theme.success }]}>
              ✓ Saved to Export tab
            </Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/** Small helper component for a single row inside the quote card. */
const QuoteLine = ({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: Theme;
}) => (
  <View style={styles.quoteLine}>
    <Text style={[styles.quoteLineLabel, { color: theme.textSecondary }]}>
      {label}
    </Text>
    <Text style={[styles.quoteLineValue, { color: theme.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  header: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  sectionLabelSpacing: { marginTop: 4 },
  horizontalScroll: { flexDirection: "row", marginBottom: 8 },
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
  unitNote: {
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 12,
    marginTop: 2,
  },
  quickAddForm: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  inputSection: { marginTop: 8 },
  row: { flexDirection: "row" },
  buttonSmall: { padding: 14, borderRadius: 4, alignItems: "center" },
  btnText: { fontWeight: "800", fontSize: 12 },
  calculateButton: {
    padding: 20,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 8,
  },
  calculateButtonText: { fontSize: 16, fontWeight: "800", letterSpacing: 1 },

  // Quote card
  quoteCard: {
    marginTop: 24,
    borderRadius: 4,
    borderWidth: 2,
    padding: 16,
  },
  quoteCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  quoteCardTitle: { fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  cardDivider: { height: 1, marginVertical: 8 },
  quoteLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  quoteLineLabel: { fontSize: 13, flex: 1 },
  quoteLineValue: { fontSize: 13, fontWeight: "700" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 14, fontWeight: "800", letterSpacing: 1 },
  totalValue: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  savedNote: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },

  // Lockout
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
