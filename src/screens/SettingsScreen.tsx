import React, { useState, useEffect, useRef } from "react";
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
import { useStore } from "../store/useStore";
import { useTheme } from "../theme";

const SettingsScreen = () => {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    isSetupComplete,
    completeSetup,
    businessName,
    setBusinessName,
    businessEmail,
    setBusinessEmail,
    businessPhone,
    setBusinessPhone,
    businessDescription,
    setBusinessDescription,
    currencySymbol,
    setCurrencySymbol,
    weightUnit,
    setWeightUnit,
    pdfFont,
    setPdfFont,
    electricityRate,
    setElectricityRate,
    printerWattage,
    setPrinterWattage,
    profitMargin,
    setProfitMargin,
    wearAndTearFee,
    setWearAndTearFee,
    taxRate,
    setTaxRate,
    clearAllQuotes,
    factoryReset,
  } = useStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [editingVars, setEditingVars] = useState(false);

  // Local Temp States
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
  }, [
    isSetupComplete,
    businessName,
    businessEmail,
    businessPhone,
    businessDescription,
    currencySymbol,
    weightUnit,
    pdfFont,
    electricityRate,
    profitMargin,
    wearAndTearFee,
    taxRate,
  ]);

  const currencyMap: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  const revCurrencyMap: { [key: string]: string } = {
    $: "USD",
    "€": "EUR",
    "£": "GBP",
  };

  const handlePhoneChange = (text: string) => {
    const filtered = text.replace(/(?!^\+)[^0-9]/g, "").slice(0, 16);
    setTmpPhone(filtered);
  };

  const validateEmail = (email: string) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!tmpName.trim()) {
        Alert.alert("Required", "Business Name is required.");
        return false;
      }
      if (tmpEmail && !validateEmail(tmpEmail)) {
        Alert.alert("Error", "Invalid email format.");
        return false;
      }
    } else if (step === 2) {
      if (!tmpCurrency || !tmpUnit || !tmpFont) return false;
    } else if (step === 3) {
      if (!tmpRate || !tmpWattage || !tmpMargin || !tmpFee) {
        Alert.alert("Required", "Missing fields.");
        return false;
      }
      if (
        isNaN(parseFloat(tmpRate)) || parseFloat(tmpRate) < 0 ||
        isNaN(parseFloat(tmpWattage)) || parseFloat(tmpWattage) < 0 ||
        isNaN(parseFloat(tmpMargin)) || parseFloat(tmpMargin) < 0 ||
        isNaN(parseFloat(tmpFee)) || parseFloat(tmpFee) < 0 ||
        (tmpTax && (isNaN(parseFloat(tmpTax)) || parseFloat(tmpTax) < 0))
      ) {
        Alert.alert("Error", "All variables must be valid positive numbers.");
        return false;
      }
    }
    return true;
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
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
    }
  };

  const handleFinishSetup = () => {
    if (validateStep(3)) {
      setElectricityRate(parseFloat(tmpRate) || 0);
      setPrinterWattage(parseFloat(tmpWattage) || 0);
      setProfitMargin(parseFloat(tmpMargin) || 0);
      setWearAndTearFee(parseFloat(tmpFee) || 0);
      setTaxRate(parseFloat(tmpTax) || 0);
      completeSetup();
    }
  };

  const handleSaveProfile = () => {
    if (!tmpName.trim()) {
      Alert.alert("Required", "Business Name is required.");
      return;
    }
    if (tmpEmail && !validateEmail(tmpEmail)) {
      Alert.alert("Error", "Invalid email format.");
      return;
    }
    setBusinessName(tmpName);
    setBusinessEmail(tmpEmail);
    setBusinessPhone(tmpPhone);
    setBusinessDescription(tmpDesc);
    setEditingProfile(false);
  };

  const handleSavePrefs = () => {
    setCurrencySymbol(tmpCurrency);
    setWeightUnit(tmpUnit);
    setPdfFont(tmpFont);
    setEditingPrefs(false);
  };

  const handleSaveVars = () => {
    if (!tmpRate || !tmpWattage || !tmpMargin || !tmpFee) {
      Alert.alert("Required", "Missing fields.");
      return;
    }
    if (
      isNaN(parseFloat(tmpRate)) || parseFloat(tmpRate) < 0 ||
      isNaN(parseFloat(tmpWattage)) || parseFloat(tmpWattage) < 0 ||
      isNaN(parseFloat(tmpMargin)) || parseFloat(tmpMargin) < 0 ||
      isNaN(parseFloat(tmpFee)) || parseFloat(tmpFee) < 0 ||
      (tmpTax && (isNaN(parseFloat(tmpTax)) || parseFloat(tmpTax) < 0))
    ) {
      Alert.alert("Error", "All variables must be valid positive numbers.");
      return;
    }
    setElectricityRate(parseFloat(tmpRate) || 0);
    setPrinterWattage(parseFloat(tmpWattage) || 0);
    setProfitMargin(parseFloat(tmpMargin) || 0);
    setWearAndTearFee(parseFloat(tmpFee) || 0);
    setTaxRate(parseFloat(tmpTax) || 0);
    setEditingVars(false);
  };

  const DisplayBox = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <View style={[styles.displayBox, { borderBottomColor: theme.border }]}>
      <Text style={[styles.displayLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.displayText, { color: theme.text }]}>
        {value || "—"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          {!isSetupComplete ? (
            <>
              <Text style={[styles.header, { color: theme.text }]}>
                SETUP WIZARD
              </Text>
              <Text
                style={[styles.stepIndicator, { color: theme.textSecondary }]}>
                STEP {currentStep} OF 3
              </Text>

              {currentStep === 1 && (
                <View
                  style={[
                    styles.section,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.stepTitle, { color: theme.primary }]}>
                    1. BUSINESS PROFILE
                  </Text>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Business Name *
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
                      value={tmpName}
                      onChangeText={setTmpName}
                    />
                    <Text
                      style={[
                        styles.helperText,
                        { color: theme.textSecondary },
                      ]}>
                      Required. Main header on invoice.
                    </Text>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Email (Optional)
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
                      value={tmpEmail}
                      onChangeText={setTmpEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <Text
                      style={[
                        styles.helperText,
                        { color: theme.textSecondary },
                      ]}>
                      Appears on PDF invoice.
                    </Text>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Phone (Optional)
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
                      value={tmpPhone}
                      onChangeText={handlePhoneChange}
                      keyboardType="phone-pad"
                    />
                    <Text
                      style={[
                        styles.helperText,
                        { color: theme.textSecondary },
                      ]}>
                      Appears on PDF invoice.
                    </Text>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Description (Optional)
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: theme.text,
                          borderColor: theme.border,
                          backgroundColor: theme.background,
                          height: 60,
                        },
                      ]}
                      value={tmpDesc}
                      onChangeText={setTmpDesc}
                      multiline
                    />
                    <Text
                      style={[
                        styles.helperText,
                        { color: theme.textSecondary },
                      ]}>
                      Short tagline below name.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.nextBtn, { backgroundColor: theme.primary }]}
                    onPress={handleNext}>
                    <Text style={[styles.btnText, { color: theme.background }]}>
                      CONTINUE
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {currentStep === 2 && (
                <View
                  style={[
                    styles.section,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.stepTitle, { color: theme.primary }]}>
                    2. PREFERENCES
                  </Text>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Currency *
                  </Text>
                  <View
                    style={[styles.toggleRow, { borderColor: theme.primary }]}>
                    {["USD", "EUR", "GBP"].map((c) => (
                      <TouchableOpacity
                        key={c}
                        onPress={() => setTmpCurrency(currencyMap[c])}
                        style={[
                          styles.toggleBtn,
                          tmpCurrency === currencyMap[c] && {
                            backgroundColor: theme.primary,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.toggleBtnText,
                            { color: theme.primary },
                            tmpCurrency === currencyMap[c] && {
                              color: theme.background,
                            },
                          ]}>
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text
                    style={[styles.label, { color: theme.text, marginTop: 16 }]}>
                    Weight Unit *
                  </Text>
                  <View
                    style={[styles.toggleRow, { borderColor: theme.primary }]}>
                    {["g", "oz"].map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => setTmpUnit(u)}
                        style={[
                          styles.toggleBtn,
                          tmpUnit === u && { backgroundColor: theme.primary },
                        ]}>
                        <Text
                          style={[
                            styles.toggleBtnText,
                            { color: theme.primary },
                            tmpUnit === u && { color: theme.background },
                          ]}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text
                    style={[styles.label, { color: theme.text, marginTop: 16 }]}>
                    PDF Font *
                  </Text>
                  <View
                    style={[styles.toggleRow, { borderColor: theme.primary }]}>
                    {["Helvetica", "Times New Roman"].map((f) => (
                      <TouchableOpacity
                        key={f}
                        onPress={() => setTmpFont(f)}
                        style={[
                          styles.toggleBtn,
                          tmpFont === f && { backgroundColor: theme.primary },
                        ]}>
                        <Text
                          style={[
                            styles.toggleBtnText,
                            { color: theme.primary },
                            tmpFont === f && { color: theme.background },
                          ]}>
                          {f}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={[styles.row, { marginTop: 24 }]}>
                    <TouchableOpacity
                      style={[
                        styles.cancelBtn,
                        {
                          flex: 1,
                          marginRight: 4,
                          backgroundColor: theme.border,
                        },
                      ]}
                      onPress={() => {
                        setCurrentStep(1);
                        scrollToTop();
                      }}>
                      <Text
                        style={[styles.cancelBtnText, { color: theme.text }]}>
                        BACK
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.nextBtn,
                        {
                          flex: 2,
                          marginLeft: 4,
                          backgroundColor: theme.primary,
                        },
                      ]}
                      onPress={handleNext}>
                      <Text
                        style={[styles.btnText, { color: theme.background }]}>
                        CONTINUE
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {currentStep === 3 && (
                <View
                  style={[
                    styles.section,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.stepTitle, { color: theme.primary }]}>
                    3. PRINT VARIABLES
                  </Text>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Electricity Rate ({tmpCurrency}/kWh) *
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
                      value={tmpRate}
                      onChangeText={setTmpRate}
                      keyboardType="numeric"
                    />
                    <Text
                      style={[
                        styles.helperText,
                        { color: theme.textSecondary },
                      ]}>
                      Found on local utility bill.
                    </Text>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Printer Wattage (W) *
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
                      value={tmpWattage}
                      onChangeText={setTmpWattage}
                      keyboardType="numeric"
                    />
                    <Text
                      style={[
                        styles.helperText,
                        { color: theme.textSecondary },
                      ]}>
                      Average power draw of printer.
                    </Text>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Profit Margin (%) *
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
                      value={tmpMargin}
                      onChangeText={setTmpMargin}
                      keyboardType="numeric"
                    />
                    <Text
                      style={[
                        styles.helperText,
                        { color: theme.textSecondary },
                      ]}>
                      Markup applied to base costs.
                    </Text>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Wear & Tear Fee ({tmpCurrency}/hr) *
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
                      value={tmpFee}
                      onChangeText={setTmpFee}
                      keyboardType="numeric"
                    />
                    <Text
                      style={[
                        styles.helperText,
                        { color: theme.textSecondary },
                      ]}>
                      Buffer for replacement parts.
                    </Text>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Tax Rate (%) (Optional)
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
                      value={tmpTax}
                      onChangeText={setTmpTax}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.row, { marginTop: 24 }]}>
                    <TouchableOpacity
                      style={[
                        styles.cancelBtn,
                        {
                          flex: 1,
                          marginRight: 4,
                          backgroundColor: theme.border,
                        },
                      ]}
                      onPress={() => {
                        setCurrentStep(2);
                        scrollToTop();
                      }}>
                      <Text
                        style={[styles.cancelBtnText, { color: theme.text }]}>
                        BACK
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.nextBtn,
                        {
                          flex: 2,
                          marginLeft: 4,
                          backgroundColor: theme.primary,
                        },
                      ]}
                      onPress={handleFinishSetup}>
                      <Text
                        style={[styles.btnText, { color: theme.background }]}>
                        FINISH SETUP
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={[styles.header, { color: theme.text }]}>
                SETTINGS
              </Text>

              <Text
                style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                USER PROFILE
              </Text>
              <View
                style={[
                  styles.section,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}>
                {!editingProfile ? (
                  <>
                    <DisplayBox label="Business Name *" value={businessName} />
                    <DisplayBox label="Email" value={businessEmail} />
                    <DisplayBox label="Phone" value={businessPhone} />
                    <DisplayBox
                      label="Description"
                      value={businessDescription}
                    />
                    <TouchableOpacity
                      style={styles.editLink}
                      onPress={() => setEditingProfile(true)}>
                      <Text
                        style={[styles.editLinkText, { color: theme.primary }]}>
                        EDIT PROFILE
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.text }]}>
                        Business Name *
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
                        value={tmpName}
                        onChangeText={setTmpName}
                      />
                      <Text
                        style={[
                          styles.helperText,
                          { color: theme.textSecondary },
                        ]}>
                        Required. Main header on invoice.
                      </Text>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.text }]}>
                        Email (Optional)
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
                        value={tmpEmail}
                        onChangeText={setTmpEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      <Text
                        style={[
                          styles.helperText,
                          { color: theme.textSecondary },
                        ]}>
                        Appears on PDF invoice.
                      </Text>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.text }]}>
                        Phone (Optional)
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
                        value={tmpPhone}
                        onChangeText={handlePhoneChange}
                        keyboardType="phone-pad"
                      />
                      <Text
                        style={[
                          styles.helperText,
                          { color: theme.textSecondary },
                        ]}>
                        Appears on PDF invoice.
                      </Text>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.text }]}>
                        Description (Optional)
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            color: theme.text,
                            borderColor: theme.border,
                            backgroundColor: theme.background,
                            height: 60,
                          },
                        ]}
                        value={tmpDesc}
                        onChangeText={setTmpDesc}
                        multiline
                      />
                      <Text
                        style={[
                          styles.helperText,
                          { color: theme.textSecondary },
                        ]}>
                        Short tagline below name.
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <TouchableOpacity
                        style={[
                          styles.saveBtn,
                          {
                            flex: 1,
                            marginRight: 4,
                            backgroundColor: theme.primary,
                          },
                        ]}
                        onPress={handleSaveProfile}>
                        <Text
                          style={[styles.btnText, { color: theme.background }]}>
                          SAVE
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.cancelBtn,
                          {
                            flex: 1,
                            marginLeft: 4,
                            backgroundColor: theme.border,
                          },
                        ]}
                        onPress={() => setEditingProfile(false)}>
                        <Text
                          style={[styles.cancelBtnText, { color: theme.text }]}>
                          CANCEL
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              <Text
                style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                APP PREFERENCES
              </Text>
              <View
                style={[
                  styles.section,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}>
                {!editingPrefs ? (
                  <>
                    <DisplayBox
                      label="Currency *"
                      value={`${revCurrencyMap[currencySymbol] || "USD"} (${currencySymbol})`}
                    />
                    <DisplayBox label="Weight Unit *" value={weightUnit} />
                    <DisplayBox label="PDF Font *" value={pdfFont} />
                    <TouchableOpacity
                      style={styles.editLink}
                      onPress={() => setEditingPrefs(true)}>
                      <Text
                        style={[styles.editLinkText, { color: theme.primary }]}>
                        EDIT PREFERENCES
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Currency *
                    </Text>
                    <View
                      style={[styles.toggleRow, { borderColor: theme.primary }]}>
                      {["USD", "EUR", "GBP"].map((c) => (
                        <TouchableOpacity
                          key={c}
                          onPress={() => setTmpCurrency(currencyMap[c])}
                          style={[
                            styles.toggleBtn,
                            tmpCurrency === currencyMap[c] && {
                              backgroundColor: theme.primary,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.toggleBtnText,
                              { color: theme.primary },
                              tmpCurrency === currencyMap[c] && {
                                color: theme.background,
                              },
                            ]}>
                            {c}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text
                      style={[
                        styles.label,
                        { color: theme.text, marginTop: 16 },
                      ]}>
                      Weight Unit *
                    </Text>
                    <View
                      style={[styles.toggleRow, { borderColor: theme.primary }]}>
                      {["g", "oz"].map((u) => (
                        <TouchableOpacity
                          key={u}
                          onPress={() => setTmpUnit(u)}
                          style={[
                            styles.toggleBtn,
                            tmpUnit === u && { backgroundColor: theme.primary },
                          ]}>
                          <Text
                            style={[
                              styles.toggleBtnText,
                              { color: theme.primary },
                              tmpUnit === u && { color: theme.background },
                            ]}>
                            {u}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text
                      style={[
                        styles.label,
                        { color: theme.text, marginTop: 16 },
                      ]}>
                      PDF Font *
                    </Text>
                    <View
                      style={[styles.toggleRow, { borderColor: theme.primary }]}>
                      {["Helvetica", "Times New Roman"].map((f) => (
                        <TouchableOpacity
                          key={f}
                          onPress={() => setTmpFont(f)}
                          style={[
                            styles.toggleBtn,
                            tmpFont === f && { backgroundColor: theme.primary },
                          ]}>
                          <Text
                            style={[
                              styles.toggleBtnText,
                              { color: theme.primary },
                              tmpFont === f && { color: theme.background },
                            ]}>
                            {f}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={(styles.row, { marginTop: 24 })}>
                      <TouchableOpacity
                        style={[
                          styles.saveBtn,
                          {
                            flex: 1,
                            marginRight: 4,
                            backgroundColor: theme.primary,
                          },
                        ]}
                        onPress={handleSavePrefs}>
                        <Text
                          style={[styles.btnText, { color: theme.background }]}>
                          SAVE
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.cancelBtn,
                          {
                            flex: 1,
                            marginLeft: 4,
                            backgroundColor: theme.border,
                          },
                        ]}
                        onPress={() => setEditingPrefs(false)}>
                        <Text
                          style={[styles.cancelBtnText, { color: theme.text }]}>
                          CANCEL
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              <Text
                style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                PRINT VARIABLES
              </Text>
              <View
                style={[
                  styles.section,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}>
                {!editingVars ? (
                  <>
                    <DisplayBox
                      label="Electricity Rate *"
                      value={`${currencySymbol}${electricityRate}/kWh`}
                    />
                    <DisplayBox
                      label="Printer Wattage (W) *"
                      value={`${printerWattage}W`}
                    />
                    <DisplayBox
                      label="Profit Margin (%) *"
                      value={`${profitMargin}%`}
                    />
                    <DisplayBox
                      label="Wear & Tear Fee *"
                      value={`${currencySymbol}${wearAndTearFee}/hr`}
                    />
                    <DisplayBox label="Tax Rate (%)" value={`${taxRate}%`} />
                    <TouchableOpacity
                      style={styles.editLink}
                      onPress={() => setEditingVars(true)}>
                      <Text
                        style={[styles.editLinkText, { color: theme.primary }]}>
                        EDIT VARIABLES
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {[
                      {
                        label: `Electricity Rate (${currencySymbol}/kWh) *`,
                        val: tmpRate,
                        set: setTmpRate,
                        helper: "Found on local utility bill.",
                      },
                      {
                        label: "Printer Wattage (W) *",
                        val: tmpWattage,
                        set: setTmpWattage,
                        helper: "Average power draw of printer.",
                      },
                      {
                        label: "Profit Margin (%) *",
                        val: tmpMargin,
                        set: setTmpMargin,
                        helper: "Markup applied to base costs.",
                      },
                      {
                        label: `Wear & Tear Fee (${currencySymbol}/hr) *`,
                        val: tmpFee,
                        set: setTmpFee,
                        helper: "Buffer for replacement parts.",
                      },
                      {
                        label: "Tax Rate (%)",
                        val: tmpTax,
                        set: setTmpTax,
                        helper: "",
                      },
                    ].map((item, idx) => (
                      <View key={idx} style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>
                          {item.label}
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
                          value={item.val}
                          onChangeText={item.set}
                          keyboardType="numeric"
                        />
                        {item.helper ? (
                          <Text
                            style={[
                              styles.helperText,
                              { color: theme.textSecondary },
                            ]}>
                            {item.helper}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                    <View style={styles.row}>
                      <TouchableOpacity
                        style={[
                          styles.saveBtn,
                          {
                            flex: 1,
                            marginRight: 4,
                            backgroundColor: theme.primary,
                          },
                        ]}
                        onPress={handleSaveVars}>
                        <Text
                          style={[styles.btnText, { color: theme.background }]}>
                          SAVE
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.cancelBtn,
                          {
                            flex: 1,
                            marginLeft: 4,
                            backgroundColor: theme.border,
                          },
                        ]}
                        onPress={() => setEditingVars(false)}>
                        <Text
                          style={[styles.cancelBtnText, { color: theme.text }]}>
                          CANCEL
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              <View
                style={[
                  styles.section,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    marginTop: 20,
                  },
                ]}>
                <TouchableOpacity
                  style={[styles.dangerBtn, { borderColor: theme.danger }]}
                  onPress={() =>
                    Alert.alert("Clear", "Delete history?", [
                      { text: "Cancel" },
                      {
                        text: "Clear",
                        style: "destructive",
                        onPress: clearAllQuotes,
                      },
                    ])
                  }>
                  <Text style={[styles.dangerBtnText, { color: theme.danger }]}>
                    CLEAR EXPORT HISTORY
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dangerBtn,
                    { borderColor: theme.danger, marginTop: 12 },
                  ]}
                  onPress={() =>
                    Alert.alert("Reset", "Factory reset app?", [
                      { text: "Cancel" },
                      {
                        text: "Reset",
                        style: "destructive",
                        onPress: factoryReset,
                      },
                    ])
                  }>
                  <Text style={[styles.dangerBtnText, { color: theme.danger }]}>
                    FACTORY RESET APP
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          {/* Spacer to allow scrolling past the keyboard */}
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
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 1,
  },
  section: { padding: 16, borderRadius: 4, borderWidth: 1, marginBottom: 16 },
  stepIndicator: { fontSize: 12, fontWeight: "700", marginBottom: 20 },
  stepTitle: { fontSize: 18, fontWeight: "800", marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 4, padding: 14, fontSize: 16 },
  helperText: { fontSize: 11, fontStyle: "italic", marginTop: 4 },
  displayBox: { paddingVertical: 12, borderBottomWidth: 1 },
  displayLabel: {
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  displayText: { fontSize: 16, fontWeight: "600" },
  nextBtn: { padding: 16, borderRadius: 4, alignItems: "center" },
  saveBtn: { padding: 14, borderRadius: 4, alignItems: "center" },
  cancelBtn: { padding: 14, borderRadius: 4, alignItems: "center" },
  btnText: { fontWeight: "800", fontSize: 14, letterSpacing: 1 },
  cancelBtnText: { fontWeight: "800", fontSize: 14 },
  editLink: { marginTop: 12, alignItems: "center" },
  editLinkText: { fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  row: { flexDirection: "row" },
  toggleRow: {
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
  },
  toggleBtn: { flex: 1, padding: 12, alignItems: "center" },
  toggleBtnText: { fontWeight: "800", fontSize: 13 },
  dangerBtn: {
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 1,
  },
  dangerBtnText: { fontWeight: "800", fontSize: 12, letterSpacing: 1 },
});

export default SettingsScreen;
