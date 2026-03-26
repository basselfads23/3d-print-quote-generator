import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  LayoutAnimation,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useStore } from "../store/useStore";
import { useTheme } from "../theme";
import { useKeyboardScroll } from "../hooks/useKeyboardScroll";
import LabeledInput from "../components/LabeledInput";
import SegmentedControl from "../components/SegmentedControl";
import DisplayField from "../components/DisplayField";
import SectionLabel from "../components/SectionLabel";

const SettingsScreen = () => {
  const theme = useTheme();
  const { scrollViewRef, onScrollViewScroll, onFocusFor } = useKeyboardScroll();

  const {
    isSetupComplete,
    completeSetup,
    businessName, setBusinessName,
    businessEmail, setBusinessEmail,
    businessPhone, setBusinessPhone,
    businessDescription, setBusinessDescription,
    businessLogo, setBusinessLogo,
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

  const [currentStep, setCurrentStep] = useState(1);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [editingVars, setEditingVars] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  // Temp states (committed to store on save)
  const [tmpName, setTmpName] = useState(businessName);
  const [tmpEmail, setTmpEmail] = useState(businessEmail);
  const [tmpPhone, setTmpPhone] = useState(businessPhone);
  const [tmpDesc, setTmpDesc] = useState(businessDescription);
  const [tmpCurrency, setTmpCurrency] = useState(currencySymbol);
  const [tmpUnit, setTmpUnit] = useState(weightUnit);
  const [tmpFont, setTmpFont] = useState(pdfFont);
  const [tmpRate, setTmpRate] = useState(electricityRate.toString());
  const [tmpWattage, setTmpWattage] = useState(printerWattage.toString());
  const [tmpMargin, setTmpMargin] = useState(profitMargin.toString());
  const [tmpFee, setTmpFee] = useState(wearAndTearFee.toString());
  const [tmpTax, setTmpTax] = useState(taxRate.toString());

  // Refs for keyboard scroll
  const nameRef = useRef<View>(null);
  const emailRef = useRef<View>(null);
  const phoneRef = useRef<View>(null);
  const descRef = useRef<View>(null);
  const rateRef = useRef<View>(null);
  const wattageRef = useRef<View>(null);
  const marginRef = useRef<View>(null);
  const feeRef = useRef<View>(null);
  const taxRef = useRef<View>(null);

  useEffect(() => {
    if (isSetupComplete) {
      setTmpName(businessName);
      setTmpEmail(businessEmail);
      setTmpPhone(businessPhone);
      setTmpDesc(businessDescription);
      setTmpCurrency(currencySymbol);
      setTmpUnit(weightUnit);
      setTmpFont(pdfFont);
      setTmpRate(electricityRate.toString());
      setTmpWattage(printerWattage.toString());
      setTmpMargin(profitMargin.toString());
      setTmpFee(wearAndTearFee.toString());
      setTmpTax(taxRate.toString());
    } else {
      setCurrentStep(1);
    }
  }, [isSetupComplete, businessName, businessEmail, businessPhone,
      businessDescription, currencySymbol, weightUnit, pdfFont,
      electricityRate, profitMargin, wearAndTearFee, taxRate]);

  const currencyMap: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };
  const revCurrencyMap: Record<string, string> = { $: "USD", "€": "EUR", "£": "GBP" };

  const handlePhoneChange = (text: string) => {
    const filtered = text.replace(/(?!^\+)[^0-9]/g, "").slice(0, 16);
    setTmpPhone(filtered);
  };

  const validateEmail = (email: string) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateNumericField = (val: string, fieldName: string): boolean => {
    if (!val.trim()) {
      Alert.alert("Required", `${fieldName} is required.`);
      return false;
    }
    const n = parseFloat(val);
    if (isNaN(n) || n < 0) {
      Alert.alert("Invalid Value", `${fieldName} must be a valid positive number.`);
      return false;
    }
    return true;
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!tmpName.trim()) {
        Alert.alert("Required", "Business Name is required.");
        return false;
      }
      if (!validateEmail(tmpEmail)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return false;
      }
    } else if (step === 3) {
      return (
        validateNumericField(tmpRate, "Electricity Rate") &&
        validateNumericField(tmpWattage, "Printer Wattage") &&
        validateNumericField(tmpMargin, "Profit Margin") &&
        validateNumericField(tmpFee, "Wear & Tear Fee") &&
        (!tmpTax || !isNaN(parseFloat(tmpTax)) && parseFloat(tmpTax) >= 0)
      );
    }
    return true;
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep === 1) {
      setBusinessName(tmpName);
      setBusinessEmail(tmpEmail);
      setBusinessPhone(tmpPhone);
      setBusinessDescription(tmpDesc);
      setCurrentStep(2);
      scrollToTop();
    } else if (currentStep === 2) {
      setCurrencySymbol(tmpCurrency);
      setWeightUnit(tmpUnit);
      setPdfFont(tmpFont);
      setCurrentStep(3);
      scrollToTop();
    }
  };

  const handleFinishSetup = () => {
    if (!validateStep(3)) return;
    setElectricityRate(parseFloat(tmpRate) || 0);
    setPrinterWattage(parseFloat(tmpWattage) || 0);
    setProfitMargin(parseFloat(tmpMargin) || 0);
    setWearAndTearFee(parseFloat(tmpFee) || 0);
    setTaxRate(parseFloat(tmpTax) || 0);
    completeSetup();
  };

  const handleSaveProfile = () => {
    if (!tmpName.trim()) {
      Alert.alert("Required", "Business Name is required.");
      return;
    }
    if (!validateEmail(tmpEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    setBusinessName(tmpName);
    setBusinessEmail(tmpEmail);
    setBusinessPhone(tmpPhone);
    setBusinessDescription(tmpDesc);
    animate(() => setEditingProfile(false));
  };

  const handleSavePrefs = () => {
    setCurrencySymbol(tmpCurrency);
    setWeightUnit(tmpUnit);
    setPdfFont(tmpFont);
    animate(() => setEditingPrefs(false));
  };

  const handleSaveVars = () => {
    if (
      !validateNumericField(tmpRate, "Electricity Rate") ||
      !validateNumericField(tmpWattage, "Printer Wattage") ||
      !validateNumericField(tmpMargin, "Profit Margin") ||
      !validateNumericField(tmpFee, "Wear & Tear Fee")
    ) return;
    if (tmpTax && (isNaN(parseFloat(tmpTax)) || parseFloat(tmpTax) < 0)) {
      Alert.alert("Invalid Value", "Tax Rate must be a valid positive number.");
      return;
    }
    setElectricityRate(parseFloat(tmpRate) || 0);
    setPrinterWattage(parseFloat(tmpWattage) || 0);
    setProfitMargin(parseFloat(tmpMargin) || 0);
    setWearAndTearFee(parseFloat(tmpFee) || 0);
    setTaxRate(parseFloat(tmpTax) || 0);
    animate(() => setEditingVars(false));
  };

  /** Trigger LayoutAnimation then run a state update for smooth section transitions. */
  const animate = (update: () => void) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    update();
  };

  const handlePickLogo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library in your device settings to add a logo.",
        );
        return;
      }
      setIsUploadingLogo(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [3, 1],
        quality: 0.4,
        base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
        setBusinessLogo(
          `data:image/jpeg;base64,${result.assets[0].base64}`,
        );
      }
    } catch {
      Alert.alert("Error", "Could not load the image. Please try again.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    Alert.alert("Remove Logo", "Remove your business logo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setBusinessLogo(""),
      },
    ]);
  };

  // ── SETUP WIZARD ──────────────────────────────────────────────────────────
  if (!isSetupComplete) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          onScroll={onScrollViewScroll}
          scrollEventThrottle={16}>
          <Text style={[styles.header, { color: theme.text }]}>
            SETUP WIZARD
          </Text>
          <Text style={[styles.stepIndicator, { color: theme.textSecondary }]}>
            STEP {currentStep} OF 3
          </Text>

          {currentStep === 1 && (
            <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.stepTitle, { color: theme.primary }]}>
                1. YOUR PROFILE
              </Text>
              <LabeledInput
                ref={nameRef}
                label="Your Name / Business Name *"
                helper="Required. Appears as the main header on invoices."
                value={tmpName}
                onChangeText={setTmpName}
                onFocus={onFocusFor(nameRef)}
              />
              <LabeledInput
                ref={emailRef}
                label="Email (Optional)"
                helper="Appears on PDF invoices if you choose to show it."
                value={tmpEmail}
                onChangeText={setTmpEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={onFocusFor(emailRef)}
              />
              <LabeledInput
                ref={phoneRef}
                label="Phone (Optional)"
                helper="Appears on PDF invoices if you choose to show it."
                value={tmpPhone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                onFocus={onFocusFor(phoneRef)}
              />
              <LabeledInput
                ref={descRef}
                label="Short Description (Optional)"
                helper="A tagline shown below your name on invoices."
                value={tmpDesc}
                onChangeText={setTmpDesc}
                multiline
                inputHeight={70}
                onFocus={onFocusFor(descRef)}
              />
              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: theme.primary }]}
                onPress={handleNext}>
                <Text style={[styles.btnText, { color: theme.background }]}>
                  CONTINUE →
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 2 && (
            <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.stepTitle, { color: theme.primary }]}>
                2. PREFERENCES
              </Text>
              <SegmentedControl
                label="Currency *"
                options={["USD", "EUR", "GBP"]}
                value={revCurrencyMap[tmpCurrency] || "USD"}
                onChange={(v) => setTmpCurrency(currencyMap[v])}
                helper="Used in all calculations and on invoices."
              />
              <SegmentedControl
                label="Weight Unit *"
                options={["g", "oz"]}
                value={tmpUnit}
                onChange={setTmpUnit}
                helper="Unit you use when weighing your prints."
              />
              <SegmentedControl
                label="PDF Font *"
                options={["Helvetica", "Times New Roman"]}
                value={tmpFont}
                onChange={setTmpFont}
                helper="Font used in generated invoice PDFs."
              />
              <View style={[styles.row, { marginTop: 8 }]}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { flex: 1, marginRight: 4, backgroundColor: theme.border }]}
                  onPress={() => { setCurrentStep(1); scrollToTop(); }}>
                  <Text style={[styles.btnText, { color: theme.text }]}>← BACK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextBtn, { flex: 2, marginLeft: 4, backgroundColor: theme.primary }]}
                  onPress={handleNext}>
                  <Text style={[styles.btnText, { color: theme.background }]}>CONTINUE →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {currentStep === 3 && (
            <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.stepTitle, { color: theme.primary }]}>
                3. PRINT VARIABLES
              </Text>
              <LabeledInput
                ref={rateRef}
                label={`Electricity Rate (${tmpCurrency}/kWh) *`}
                helper="Your cost per kilowatt-hour — check your utility bill."
                value={tmpRate}
                onChangeText={setTmpRate}
                keyboardType="numeric"
                onFocus={onFocusFor(rateRef)}
              />
              <LabeledInput
                ref={wattageRef}
                label="Printer Wattage (W) *"
                helper="Average power draw of your printer in watts (usually 100–300 W)."
                value={tmpWattage}
                onChangeText={setTmpWattage}
                keyboardType="numeric"
                onFocus={onFocusFor(wattageRef)}
              />
              <LabeledInput
                ref={marginRef}
                label="Profit Margin (%) *"
                helper="Percentage markup added on top of base costs. E.g. 20 = 20%."
                value={tmpMargin}
                onChangeText={setTmpMargin}
                keyboardType="numeric"
                onFocus={onFocusFor(marginRef)}
              />
              <LabeledInput
                ref={feeRef}
                label={`Wear & Tear Fee (${tmpCurrency}/hr) *`}
                helper="Hourly charge to cover printer maintenance and parts."
                value={tmpFee}
                onChangeText={setTmpFee}
                keyboardType="numeric"
                onFocus={onFocusFor(feeRef)}
              />
              <LabeledInput
                ref={taxRef}
                label="Tax Rate (%) — Optional"
                helper="Applied to the final subtotal. Leave at 0 if not applicable."
                value={tmpTax}
                onChangeText={setTmpTax}
                keyboardType="numeric"
                onFocus={onFocusFor(taxRef)}
              />
              <View style={[styles.row, { marginTop: 8 }]}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { flex: 1, marginRight: 4, backgroundColor: theme.border }]}
                  onPress={() => { setCurrentStep(2); scrollToTop(); }}>
                  <Text style={[styles.btnText, { color: theme.text }]}>← BACK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextBtn, { flex: 2, marginLeft: 4, backgroundColor: theme.primary }]}
                  onPress={handleFinishSetup}>
                  <Text style={[styles.btnText, { color: theme.background }]}>FINISH SETUP ✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── SETTINGS (post-setup) ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        onScroll={onScrollViewScroll}
        scrollEventThrottle={16}>
        <Text style={[styles.header, { color: theme.text }]}>SETTINGS</Text>

        {/* ── USER PROFILE ── */}
        <SectionLabel title="User Profile" />
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {!editingProfile ? (
            <>
              {/* Logo Preview */}
              {businessLogo ? (
                <View style={styles.logoPreviewRow}>
                  <Image
                    source={{ uri: businessLogo }}
                    style={styles.logoPreview}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    onPress={handleRemoveLogo}
                    style={[styles.removeLogoBtn, { borderColor: theme.danger }]}>
                    <Text style={[styles.removeLogoBtnText, { color: theme.danger }]}>
                      REMOVE LOGO
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              <DisplayField label="Name *" value={businessName} />
              <DisplayField label="Email" value={businessEmail} />
              <DisplayField label="Phone" value={businessPhone} />
              <DisplayField label="Description" value={businessDescription} last />
              <TouchableOpacity
                style={styles.editLink}
                onPress={() => animate(() => setEditingProfile(true))}>
                <Text style={[styles.editLinkText, { color: theme.primary }]}>
                  EDIT PROFILE
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Logo management in edit mode */}
              <View style={[styles.logoSection, { borderBottomColor: theme.border }]}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Business Logo (Optional)
                </Text>
                <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                  Shown on PDF invoices. You can toggle it per invoice.
                </Text>
                {businessLogo ? (
                  <View style={styles.logoRow}>
                    <Image
                      source={{ uri: businessLogo }}
                      style={styles.logoPreview}
                      resizeMode="contain"
                    />
                    <View style={styles.logoActions}>
                      <TouchableOpacity
                        style={[styles.logoBtn, { backgroundColor: theme.border }]}
                        onPress={handlePickLogo}>
                        <Text style={[styles.logoBtnText, { color: theme.text }]}>
                          CHANGE
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.logoBtn, { backgroundColor: theme.danger + "20" }]}
                        onPress={handleRemoveLogo}>
                        <Text style={[styles.logoBtnText, { color: theme.danger }]}>
                          REMOVE
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.addLogoBtn, { borderColor: theme.primary }]}
                    onPress={handlePickLogo}
                    disabled={isUploadingLogo}>
                    {isUploadingLogo ? (
                      <ActivityIndicator color={theme.primary} />
                    ) : (
                      <Text style={[styles.addLogoBtnText, { color: theme.primary }]}>
                        + ADD LOGO FROM GALLERY
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <LabeledInput
                ref={nameRef}
                label="Name / Business Name *"
                helper="Required. Main header on invoices."
                value={tmpName}
                onChangeText={setTmpName}
                onFocus={onFocusFor(nameRef)}
              />
              <LabeledInput
                ref={emailRef}
                label="Email (Optional)"
                helper="Appears on PDF invoices."
                value={tmpEmail}
                onChangeText={setTmpEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={onFocusFor(emailRef)}
              />
              <LabeledInput
                ref={phoneRef}
                label="Phone (Optional)"
                helper="Appears on PDF invoices."
                value={tmpPhone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                onFocus={onFocusFor(phoneRef)}
              />
              <LabeledInput
                ref={descRef}
                label="Description (Optional)"
                helper="Short tagline shown below your name on invoices."
                value={tmpDesc}
                onChangeText={setTmpDesc}
                multiline
                inputHeight={70}
                onFocus={onFocusFor(descRef)}
              />
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.saveBtn, { flex: 1, marginRight: 4, backgroundColor: theme.primary }]}
                  onPress={handleSaveProfile}>
                  <Text style={[styles.btnText, { color: theme.background }]}>SAVE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelBtn, { flex: 1, marginLeft: 4, backgroundColor: theme.border }]}
                  onPress={() => animate(() => setEditingProfile(false))}>
                  <Text style={[styles.btnText, { color: theme.text }]}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* ── APP PREFERENCES ── */}
        <SectionLabel title="App Preferences" />
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {!editingPrefs ? (
            <>
              <DisplayField label="Currency" value={`${revCurrencyMap[currencySymbol] || "USD"} (${currencySymbol})`} />
              <DisplayField label="Weight Unit" value={weightUnit} />
              <DisplayField label="PDF Font" value={pdfFont} last />
              <TouchableOpacity
                style={styles.editLink}
                onPress={() => animate(() => setEditingPrefs(true))}>
                <Text style={[styles.editLinkText, { color: theme.primary }]}>
                  EDIT PREFERENCES
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <SegmentedControl
                label="Currency *"
                options={["USD", "EUR", "GBP"]}
                value={revCurrencyMap[tmpCurrency] || "USD"}
                onChange={(v) => setTmpCurrency(currencyMap[v])}
                helper="Used in all calculations and on invoices."
              />
              <SegmentedControl
                label="Weight Unit *"
                options={["g", "oz"]}
                value={tmpUnit}
                onChange={setTmpUnit}
                helper="Unit used when entering model weight in the calculator."
              />
              <SegmentedControl
                label="PDF Font *"
                options={["Helvetica", "Times New Roman"]}
                value={tmpFont}
                onChange={setTmpFont}
                helper="Font used in generated invoice PDFs."
              />
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.saveBtn, { flex: 1, marginRight: 4, backgroundColor: theme.primary }]}
                  onPress={handleSavePrefs}>
                  <Text style={[styles.btnText, { color: theme.background }]}>SAVE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelBtn, { flex: 1, marginLeft: 4, backgroundColor: theme.border }]}
                  onPress={() => animate(() => setEditingPrefs(false))}>
                  <Text style={[styles.btnText, { color: theme.text }]}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* ── PRINT VARIABLES ── */}
        <SectionLabel title="Print Variables" />
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {!editingVars ? (
            <>
              <DisplayField label="Electricity Rate" value={`${currencySymbol}${electricityRate}/kWh`} />
              <DisplayField label="Printer Wattage" value={`${printerWattage} W`} />
              <DisplayField label="Profit Margin" value={`${profitMargin}%`} />
              <DisplayField label="Wear & Tear Fee" value={`${currencySymbol}${wearAndTearFee}/hr`} />
              <DisplayField label="Tax Rate" value={`${taxRate}%`} last />
              <TouchableOpacity
                style={styles.editLink}
                onPress={() => animate(() => setEditingVars(true))}>
                <Text style={[styles.editLinkText, { color: theme.primary }]}>
                  EDIT VARIABLES
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.formulaLink}
                onPress={() => setShowFormula(true)}>
                <Text style={[styles.formulaLinkText, { color: theme.textSecondary }]}>
                  HOW IS THIS CALCULATED?
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <LabeledInput
                ref={rateRef}
                label={`Electricity Rate (${currencySymbol}/kWh) *`}
                helper="Your cost per kilowatt-hour — check your utility bill."
                value={tmpRate}
                onChangeText={setTmpRate}
                keyboardType="numeric"
                onFocus={onFocusFor(rateRef)}
              />
              <LabeledInput
                ref={wattageRef}
                label="Printer Wattage (W) *"
                helper="Average power draw of your printer in watts (usually 100–300 W)."
                value={tmpWattage}
                onChangeText={setTmpWattage}
                keyboardType="numeric"
                onFocus={onFocusFor(wattageRef)}
              />
              <LabeledInput
                ref={marginRef}
                label="Profit Margin (%) *"
                helper="Percentage markup added on top of base costs. E.g. 20 = 20%."
                value={tmpMargin}
                onChangeText={setTmpMargin}
                keyboardType="numeric"
                onFocus={onFocusFor(marginRef)}
              />
              <LabeledInput
                ref={feeRef}
                label={`Wear & Tear Fee (${currencySymbol}/hr) *`}
                helper="Hourly charge to cover printer maintenance and parts replacement."
                value={tmpFee}
                onChangeText={setTmpFee}
                keyboardType="numeric"
                onFocus={onFocusFor(feeRef)}
              />
              <LabeledInput
                ref={taxRef}
                label="Tax Rate (%) — Optional"
                helper="Applied to the final subtotal. Leave at 0 if not applicable."
                value={tmpTax}
                onChangeText={setTmpTax}
                keyboardType="numeric"
                onFocus={onFocusFor(taxRef)}
              />
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.saveBtn, { flex: 1, marginRight: 4, backgroundColor: theme.primary }]}
                  onPress={handleSaveVars}>
                  <Text style={[styles.btnText, { color: theme.background }]}>SAVE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelBtn, { flex: 1, marginLeft: 4, backgroundColor: theme.border }]}
                  onPress={() => animate(() => setEditingVars(false))}>
                  <Text style={[styles.btnText, { color: theme.text }]}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* ── DANGER ZONE ── */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              marginTop: 8,
            },
          ]}>
          <TouchableOpacity
            style={[styles.dangerBtn, { borderColor: theme.danger }]}
            onPress={() =>
              Alert.alert(
                "Clear History",
                "This will delete all saved quotes. This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Clear", style: "destructive", onPress: clearAllQuotes },
                ],
              )
            }>
            <Text style={[styles.dangerBtnText, { color: theme.danger }]}>
              CLEAR EXPORT HISTORY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dangerBtn, { borderColor: theme.danger, marginTop: 12 }]}
            onPress={() =>
              Alert.alert(
                "Factory Reset",
                "This will erase all data including your profile, materials, and quotes. This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Reset", style: "destructive", onPress: factoryReset },
                ],
              )
            }>
            <Text style={[styles.dangerBtnText, { color: theme.danger }]}>
              FACTORY RESET APP
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── FORMULA MODAL ── */}
      <Modal visible={showFormula} animationType="slide">
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              How Quotes Are Calculated
            </Text>
            <TouchableOpacity
              onPress={() => setShowFormula(false)}
              style={[styles.modalCloseBtn, { backgroundColor: theme.danger }]}>
              <Text style={styles.modalCloseBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>

            <Text style={[styles.formulaIntro, { color: theme.textSecondary }]}>
              Every quote is built from five components combined step by step.
              All inputs come from the Calculator screen and your Settings.
            </Text>

            {/* Step 1 */}
            <View style={[styles.formulaCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.formulaStep, { color: theme.primary }]}>STEP 1 — Material Cost</Text>
              <Text style={[styles.formulaBody, { color: theme.text }]}>
                {"If weight is in grams:\n"}
                <Text style={styles.formulaCode}>Material Cost = (Price/kg ÷ 1000) × Weight (g)</Text>
                {"\n\nIf weight is in ounces:\n"}
                <Text style={styles.formulaCode}>Material Cost = (Price/kg ÷ 35.274) × Weight (oz)</Text>
              </Text>
              <Text style={[styles.formulaNote, { color: theme.textSecondary }]}>
                Material price is always stored per kg. The app converts at runtime based on your weight unit setting.
              </Text>
            </View>

            {/* Step 2 */}
            <View style={[styles.formulaCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.formulaStep, { color: theme.primary }]}>STEP 2 — Electricity Cost</Text>
              <Text style={[styles.formulaBody, { color: theme.text }]}>
                <Text style={styles.formulaCode}>Electricity = (Wattage ÷ 1000) × Rate ($/kWh) × Print Time (hrs)</Text>
              </Text>
              <Text style={[styles.formulaNote, { color: theme.textSecondary }]}>
                Wattage and rate come from your Settings. Print time is entered in the Calculator.
              </Text>
            </View>

            {/* Step 3 */}
            <View style={[styles.formulaCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.formulaStep, { color: theme.primary }]}>STEP 3 — Wear & Tear</Text>
              <Text style={[styles.formulaBody, { color: theme.text }]}>
                <Text style={styles.formulaCode}>Wear & Tear = Fee ($/hr) × Print Time (hrs)</Text>
              </Text>
              <Text style={[styles.formulaNote, { color: theme.textSecondary }]}>
                This covers printer maintenance, nozzle wear, and part replacements over time.
              </Text>
            </View>

            {/* Step 4 */}
            <View style={[styles.formulaCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.formulaStep, { color: theme.primary }]}>STEP 4 — Base Cost</Text>
              <Text style={[styles.formulaBody, { color: theme.text }]}>
                <Text style={styles.formulaCode}>Base Cost = Material + Electricity + Wear & Tear</Text>
              </Text>
              <Text style={[styles.formulaNote, { color: theme.textSecondary }]}>
                The true cost of the print before any profit or tax.
              </Text>
            </View>

            {/* Step 5 */}
            <View style={[styles.formulaCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.formulaStep, { color: theme.primary }]}>STEP 5 — Profit Margin</Text>
              <Text style={[styles.formulaBody, { color: theme.text }]}>
                <Text style={styles.formulaCode}>Subtotal = Base Cost × (1 + Margin% ÷ 100)</Text>
              </Text>
              <Text style={[styles.formulaNote, { color: theme.textSecondary }]}>
                Example: a 20% margin on a $5.00 base cost gives a $6.00 subtotal.
              </Text>
            </View>

            {/* Step 6 */}
            <View style={[styles.formulaCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.formulaStep, { color: theme.primary }]}>STEP 6 — Tax</Text>
              <Text style={[styles.formulaBody, { color: theme.text }]}>
                <Text style={styles.formulaCode}>Tax Amount = Subtotal × (Tax% ÷ 100)</Text>
              </Text>
              <Text style={[styles.formulaNote, { color: theme.textSecondary }]}>
                Tax is applied to the subtotal (after margin). Set to 0 if not applicable.
              </Text>
            </View>

            {/* Step 7 */}
            <View style={[styles.formulaCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.formulaStep, { color: theme.primary }]}>STEP 7 — Final Quote</Text>
              <Text style={[styles.formulaBody, { color: theme.text }]}>
                <Text style={styles.formulaCode}>Final Quote = Subtotal + Tax Amount</Text>
              </Text>
              <Text style={[styles.formulaNote, { color: theme.textSecondary }]}>
                This is the number shown on the Calculator and on your invoice.
              </Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  stepIndicator: { fontSize: 12, fontWeight: "700", marginBottom: 20 },
  stepTitle: { fontSize: 18, fontWeight: "800", marginBottom: 20 },
  section: { padding: 16, borderRadius: 4, borderWidth: 1, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 6 },
  helperText: { fontSize: 11, fontStyle: "italic", marginBottom: 10 },
  row: { flexDirection: "row" },
  nextBtn: { padding: 16, borderRadius: 4, alignItems: "center" },
  saveBtn: { padding: 14, borderRadius: 4, alignItems: "center" },
  cancelBtn: { padding: 14, borderRadius: 4, alignItems: "center" },
  btnText: { fontWeight: "800", fontSize: 14, letterSpacing: 0.5 },
  editLink: { marginTop: 12, alignItems: "center", paddingVertical: 8 },
  editLinkText: { fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  dangerBtn: {
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 1,
  },
  dangerBtnText: { fontWeight: "800", fontSize: 12, letterSpacing: 1 },

  // Logo
  logoPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  logoPreview: {
    width: 120,
    height: 40,
    marginRight: 12,
  },
  removeLogoBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  removeLogoBtnText: { fontSize: 11, fontWeight: "800" },
  logoSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  logoActions: { flexDirection: "row", marginLeft: 12, gap: 8 },
  logoBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  logoBtnText: { fontSize: 11, fontWeight: "800" },
  addLogoBtn: {
    marginTop: 10,
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
  },
  addLogoBtnText: { fontSize: 13, fontWeight: "800" },

  // Formula link
  formulaLink: { marginTop: 4, alignItems: "center", paddingVertical: 8 },
  formulaLinkText: { fontWeight: "700", fontSize: 11, letterSpacing: 0.5, textDecorationLine: "underline" },

  // Formula modal
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  modalCloseBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 },
  modalCloseBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  modalContent: { padding: 16 },
  formulaIntro: { fontSize: 13, lineHeight: 20, marginBottom: 16, fontStyle: "italic" },
  formulaCard: {
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 12,
  },
  formulaStep: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5, marginBottom: 10 },
  formulaBody: { fontSize: 14, lineHeight: 22, marginBottom: 8 },
  formulaCode: { fontFamily: "monospace", fontWeight: "700" },
  formulaNote: { fontSize: 11, fontStyle: "italic", lineHeight: 16 },
});

export default SettingsScreen;
