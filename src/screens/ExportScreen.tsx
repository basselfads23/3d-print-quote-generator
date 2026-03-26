import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Directory, File } from "expo-file-system";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useStore, QuoteRecord } from "../store/useStore";
import { useTheme } from "../theme";
import { useKeyboardScroll } from "../hooks/useKeyboardScroll";
import LabeledInput from "../components/LabeledInput";
import SectionLabel from "../components/SectionLabel";
import DisplayField from "../components/DisplayField";
import SegmentedControl from "../components/SegmentedControl";

const ExportScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const {
    recentQuotes,
    businessName,
    businessEmail,
    businessPhone,
    businessDescription,
    businessLogo,
    currencySymbol,
    pdfFont,
    taxRate,
    profitMargin,
    savedClients,
    addSavedClient,
    removeSavedClient,
    clearOldQuotes,
  } = useStore();

  const { scrollViewRef, onScrollViewScroll, onFocusFor } =
    useKeyboardScroll();

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  // Business detail toggles
  const [showBusinessName, setShowBusinessName] = useState(true);
  const [showBusinessEmail, setShowBusinessEmail] = useState(true);
  const [showBusinessPhone, setShowBusinessPhone] = useState(true);
  const [showBusinessDesc, setShowBusinessDesc] = useState(true);
  const [showBusinessLogo, setShowBusinessLogo] = useState(!!businessLogo);

  // Client picker state
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  // Client details
  const [isEditingClient, setIsEditingClient] = useState(true);
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());

  // Temp edit states
  const [tmpClientName, setTmpClientName] = useState("");
  const [tmpDescription, setTmpDescription] = useState("");
  const [tmpDate, setTmpDate] = useState(new Date());

  // Invoice options
  const [isDetailed, setIsDetailed] = useState(true);
  const [includeShipping, setIncludeShipping] = useState(false);
  const [shippingAmount, setShippingAmount] = useState("");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // Date picker
  const [showPicker, setShowPicker] = useState(false);

  // PDF preview
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Refs for keyboard scroll
  const clientDescRef = useRef<View>(null);
  const newClientRef = useRef<View>(null);
  const shippingRef = useRef<View>(null);

  const activeQuote =
    recentQuotes.find((q) => q.id === selectedQuoteId) || null;

  // STRICT FOCUS MODE: hide gear icon when building an invoice
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (selectedQuoteId) {
      parent?.setOptions({ headerRight: () => null });
    } else {
      parent?.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={{ marginRight: 15 }}>
            <Ionicons name="settings-outline" size={22} color={theme.primary} />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, selectedQuoteId, theme]);

  useEffect(() => {
    if (isFocused) clearOldQuotes();
  }, [isFocused]);

  useEffect(() => {
    if (selectedQuoteId && !activeQuote) handleBackToList();
  }, [recentQuotes, selectedQuoteId, activeQuote]);

  // Sync logo toggle when businessLogo changes
  useEffect(() => {
    setShowBusinessLogo(!!businessLogo);
  }, [businessLogo]);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) setTmpDate(selectedDate);
  };

  const handleSaveClientDetails = () => {
    setClientName(tmpClientName);
    setDescription(tmpDescription);
    setDate(tmpDate);
    setIsEditingClient(false);
  };

  const handleEditClientDetails = () => {
    setTmpClientName(clientName);
    setTmpDescription(description);
    setTmpDate(date);
    setIsEditingClient(true);
    setIsGenerated(false);
  };

  const handleGenerateInvoice = () => {
    setIsGenerating(true);
    // Minimum 1.5s to give the impression of processing
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1500);
  };

  const handleBackToList = () => {
    setSelectedQuoteId(null);
    setIsGenerated(false);
    setIsGenerating(false);
    setIsEditingClient(true);
    setIsAddingNewClient(false);
    setNewClientName("");
    setClientName("");
    setDescription("");
    setDate(new Date());
    setTmpClientName("");
    setTmpDescription("");
    setTmpDate(new Date());
    setIncludeShipping(false);
    setShippingAmount("");
  };

  const handleSaveNewClient = () => {
    const trimmed = newClientName.trim();
    if (!trimmed) {
      Alert.alert("Required", "Please enter a client name.");
      return;
    }
    addSavedClient(trimmed);
    setTmpClientName(trimmed);
    setNewClientName("");
    setIsAddingNewClient(false);
  };

  const shippingCost = parseFloat(shippingAmount) || 0;

  const generateHTML = () => {
    if (!activeQuote) return "";

    const marginAmount = activeQuote.baseCost * (profitMargin / 100);
    const dateStr = date.toLocaleDateString();
    const fontStack =
      pdfFont === "Times New Roman"
        ? "'Times New Roman', Times, serif"
        : "'Helvetica Neue', Helvetica, Arial, sans-serif";

    const invoiceTotal = activeQuote.finalQuote + shippingCost;
    const subtotal = activeQuote.finalQuote - activeQuote.taxAmount;

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: ${fontStack}; padding: 40px; color: #000; line-height: 1.2; background-color: #fff; }
            .invoice-title { font-size: 48px; font-weight: 900; letter-spacing: -2px; margin-bottom: 30px; color: #000; }
            .meta-section { display: flex; justify-content: space-between; margin-bottom: 30px; align-items: flex-start; }
            .biz-details { flex: 1; }
            .biz-logo { max-height: 60px; max-width: 200px; object-fit: contain; margin-bottom: 12px; display: block; }
            .biz-name { font-size: 16px; font-weight: 800; margin-bottom: 4px; text-transform: uppercase; color: #000; }
            .biz-text { font-size: 12px; color: #444; margin-bottom: 2px; }
            .date-block { text-align: right; }
            .label-sm { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #000; margin-bottom: 4px; letter-spacing: 0.5px; }
            .value-md { font-size: 14px; font-weight: 600; margin-bottom: 20px; color: #000; }
            .client-section { margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-start; }
            .client-details { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; border-bottom: 2px solid #000; padding: 12px 5px; font-size: 12px; font-weight: 900; text-transform: uppercase; color: #000; }
            td { padding: 15px 5px; border-bottom: 1px solid #EEE; font-size: 14px; color: #000; }
            .col-qty { text-align: center; width: 80px; }
            .col-price { text-align: right; width: 100px; font-weight: 600; }
            .summary-section { margin-top: 30px; margin-left: auto; width: 45%; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 5px; font-size: 14px; color: #000; }
            .summary-row.total {
              margin-top: 15px; padding: 15px 5px;
              border-top: 2px solid #000; border-bottom: 4px double #000;
              font-size: 20px; font-weight: 900; text-transform: uppercase; color: #000;
            }
            .footer { margin-top: 80px; text-align: center; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; }
            .notes { margin-top: 40px; font-size: 12px; color: #333; border-top: 1px solid #EEE; padding-top: 20px; }
            .notes-label { font-weight: 800; margin-bottom: 6px; text-transform: uppercase; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <div class="invoice-title">INVOICE</div>

          <div class="meta-section">
            <div class="biz-details">
              ${showBusinessLogo && businessLogo ? `<img src="${businessLogo}" class="biz-logo" />` : ""}
              ${showBusinessName && businessName ? `<div class="biz-name">${businessName}</div>` : ""}
              ${showBusinessDesc && businessDescription ? `<div class="biz-text">${businessDescription}</div>` : ""}
              ${showBusinessEmail && businessEmail ? `<div class="biz-text">${businessEmail}</div>` : ""}
              ${showBusinessPhone && businessPhone ? `<div class="biz-text">${businessPhone}</div>` : ""}
            </div>
            <div class="date-block">
              <div class="label-sm">Date</div>
              <div class="value-md">${dateStr}</div>
            </div>
          </div>

          <div class="client-section">
            <div class="client-details">
              <div class="label-sm">Prepared For</div>
              <div class="value-md">${clientName || "Valued Customer"}</div>
            </div>
            <div class="date-block">
              <div class="label-sm">Due Date</div>
              <div class="value-md">${dateStr}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th class="col-qty">Qty</th>
                <th class="col-price">Price</th>
              </tr>
            </thead>
            <tbody>
              ${isDetailed
                ? `
                <tr>
                  <td>Filament (${activeQuote.materialName})</td>
                  <td class="col-qty">${activeQuote.modelWeight}${activeQuote.unit}</td>
                  <td class="col-price">${activeQuote.currencySymbol}${activeQuote.materialCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Printer Operating Time</td>
                  <td class="col-qty">${activeQuote.printTime}h</td>
                  <td class="col-price">${activeQuote.currencySymbol}${activeQuote.electricityCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Equipment Wear &amp; Tear</td>
                  <td class="col-qty">1</td>
                  <td class="col-price">${activeQuote.currencySymbol}${activeQuote.wearAndTearCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Service Profit Margin (${profitMargin}%)</td>
                  <td class="col-qty">1</td>
                  <td class="col-price">${activeQuote.currencySymbol}${marginAmount.toFixed(2)}</td>
                </tr>
                ${includeShipping && shippingCost > 0
                  ? `<tr>
                    <td>Shipping</td>
                    <td class="col-qty">1</td>
                    <td class="col-price">${activeQuote.currencySymbol}${shippingCost.toFixed(2)}</td>
                  </tr>`
                  : ""}
              `
                : `
                <tr>
                  <td>Custom 3D Print Job (${activeQuote.materialName})</td>
                  <td class="col-qty">1</td>
                  <td class="col-price">${activeQuote.currencySymbol}${subtotal.toFixed(2)}</td>
                </tr>
              `}
            </tbody>
          </table>

          <div class="summary-section">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${activeQuote.currencySymbol}${subtotal.toFixed(2)}</span>
            </div>
            ${includeShipping && shippingCost > 0 && isDetailed ? `
            <div class="summary-row">
              <span>Shipping</span>
              <span>${activeQuote.currencySymbol}${shippingCost.toFixed(2)}</span>
            </div>` : ""}
            ${activeQuote.taxAmount > 0 ? `
            <div class="summary-row">
              <span>Tax (${taxRate}%)</span>
              <span>${activeQuote.currencySymbol}${activeQuote.taxAmount.toFixed(2)}</span>
            </div>` : ""}
            <div class="summary-row total">
              <span>Total</span>
              <span>${activeQuote.currencySymbol}${invoiceTotal.toFixed(2)}</span>
            </div>
          </div>

          ${description ? `<div class="notes"><div class="notes-label">Additional Details</div>${description}</div>` : ""}

          <div class="footer">Generated by 3D QUOTE PRO</div>
        </body>
      </html>
    `;
  };

  const handleShare = async () => {
    try {
      const html = generateHTML();
      const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });
      await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch {
      Alert.alert("Share Failed", "Could not share the invoice. Please try again.");
    }
  };

  const handleDownload = async () => {
    try {
      const html = generateHTML();
      const { uri: tempUri } = await Print.printToFileAsync({ html });

      if (Platform.OS === "android") {
        const directory = await Directory.pickDirectoryAsync();
        if (directory) {
          const tempFile = new File(tempUri);
          const base64Content = await tempFile.base64();
          const newFile = directory.createFile(
            `Invoice_${Date.now()}.pdf`,
            "application/pdf",
          );
          await newFile.write(base64Content, { encoding: "base64" });
          Alert.alert("Saved", "Invoice saved to the selected folder.");
        }
      } else {
        await Sharing.shareAsync(tempUri);
      }
    } catch {
      Alert.alert("Download Failed", "Could not save the file. Please try again.");
    }
  };

  /** Small toggle chip used in the business details row */
  const ToggleItem = ({
    label,
    value,
    onToggle,
  }: {
    label: string;
    value: boolean;
    onToggle: (v: boolean) => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.toggleItem,
        { borderColor: theme.border },
        value && { backgroundColor: theme.primary, borderColor: theme.primary },
      ]}
      onPress={() => onToggle(!value)}>
      <Text
        style={[
          styles.toggleItemText,
          { color: theme.textSecondary },
          value && { color: theme.background },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  /** Link to add a missing field in Settings */
  const AddLink = ({ label }: { label: string }) => (
    <TouchableOpacity
      style={[styles.addButton, { borderColor: theme.primary }]}
      onPress={() => navigation.navigate("Settings")}>
      <Text style={[styles.addButtonText, { color: theme.primary }]}>
        + Add {label}
      </Text>
    </TouchableOpacity>
  );

  // ── INVOICE SETUP VIEW ─────────────────────────────────────────────────────
  if (activeQuote) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
        edges={[]}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScroll={onScrollViewScroll}
          scrollEventThrottle={16}>
          <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.primary }]}>
              ← BACK TO HISTORY
            </Text>
          </TouchableOpacity>

          <Text style={[styles.header, { color: theme.text }]}>
            INVOICE SETUP
          </Text>

          {/* ── 1. BUSINESS DETAILS ── */}
          <SectionLabel title="1. Business Details" />
          <Text style={[styles.helperText, { color: theme.textSecondary, marginBottom: 10 }]}>
            Toggle which details appear on the invoice.
          </Text>
          <View style={styles.toggleGrid}>
            {businessLogo ? (
              <ToggleItem label="Logo" value={showBusinessLogo} onToggle={setShowBusinessLogo} />
            ) : null}
            {businessName ? (
              <ToggleItem label="Name" value={showBusinessName} onToggle={setShowBusinessName} />
            ) : (
              <AddLink label="Name" />
            )}
            {businessEmail ? (
              <ToggleItem label="Email" value={showBusinessEmail} onToggle={setShowBusinessEmail} />
            ) : (
              <AddLink label="Email" />
            )}
            {businessPhone ? (
              <ToggleItem label="Phone" value={showBusinessPhone} onToggle={setShowBusinessPhone} />
            ) : (
              <AddLink label="Phone" />
            )}
            {businessDescription ? (
              <ToggleItem label="Description" value={showBusinessDesc} onToggle={setShowBusinessDesc} />
            ) : (
              <AddLink label="Description" />
            )}
          </View>

          {/* ── 2. CLIENT DETAILS ── */}
          <SectionLabel title="2. Client Details" style={{ marginTop: 8 }} />
          <View
            style={[
              styles.section,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            {isEditingClient ? (
              <>
                {/* Client picker */}
                <Text style={[styles.label, { color: theme.text }]}>
                  Client Name{" "}
                  <Text style={[styles.labelOptional, { color: theme.textSecondary }]}>
                    (Optional)
                  </Text>
                </Text>
                <Text style={[styles.helperText, { color: theme.textSecondary, marginBottom: 10 }]}>
                  Select a saved client, or leave empty to skip.
                </Text>

                {/* Horizontal client list + add button */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.clientScroll}
                  keyboardShouldPersistTaps="handled">
                  {savedClients.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.clientChip,
                        { borderColor: theme.border, backgroundColor: theme.surface },
                        tmpClientName === c.name && {
                          borderColor: theme.primary,
                          backgroundColor: theme.primary,
                        },
                      ]}
                      onPress={() =>
                        setTmpClientName(tmpClientName === c.name ? "" : c.name)
                      }>
                      <Text
                        style={[
                          styles.clientChipText,
                          { color: theme.text },
                          tmpClientName === c.name && { color: theme.background },
                        ]}>
                        {c.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            "Remove Client",
                            `Remove "${c.name}" from saved clients?`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Remove",
                                style: "destructive",
                                onPress: () => {
                                  removeSavedClient(c.id);
                                  if (tmpClientName === c.name) setTmpClientName("");
                                },
                              },
                            ],
                          );
                        }}
                        hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
                        <Text
                          style={[
                            styles.clientChipRemove,
                            {
                              color:
                                tmpClientName === c.name
                                  ? theme.background
                                  : theme.textSecondary,
                            },
                          ]}>
                          ×
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}

                  {/* Add client chip — always visible at end of row */}
                  {!isAddingNewClient && (
                    <TouchableOpacity
                      style={[
                        styles.clientChip,
                        styles.clientChipAdd,
                        { borderColor: theme.primary },
                      ]}
                      onPress={() => setIsAddingNewClient(true)}>
                      <Text style={[styles.clientChipText, { color: theme.primary }]}>
                        + ADD CLIENT
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>

                {/* Quick-add form */}
                {isAddingNewClient && (
                  <View
                    style={[
                      styles.quickAddForm,
                      { backgroundColor: theme.background, borderColor: theme.border },
                    ]}>
                    <LabeledInput
                      ref={newClientRef}
                      label="New Client Name *"
                      value={newClientName}
                      onChangeText={setNewClientName}
                      onFocus={onFocusFor(newClientRef)}
                      placeholder="Enter name..."
                    />
                    <View style={styles.row}>
                      <TouchableOpacity
                        style={[styles.smallBtn, { flex: 1, marginRight: 4, backgroundColor: theme.primary }]}
                        onPress={handleSaveNewClient}>
                        <Text style={[styles.smallBtnText, { color: theme.background }]}>
                          SAVE & SELECT
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.smallBtn, { flex: 1, marginLeft: 4, backgroundColor: theme.border }]}
                        onPress={() => { setIsAddingNewClient(false); setNewClientName(""); }}>
                        <Text style={[styles.smallBtnText, { color: theme.text }]}>
                          CANCEL
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Description */}
                <LabeledInput
                  ref={clientDescRef}
                  label="Description"
                  helper="Optional note for this job — appears on the invoice."
                  value={tmpDescription}
                  onChangeText={setTmpDescription}
                  multiline
                  inputHeight={80}
                  onFocus={onFocusFor(clientDescRef)}
                />

                {/* Date */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Invoice Date *
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dateDisplay,
                      { borderColor: theme.border, backgroundColor: theme.background },
                    ]}
                    onPress={() => setShowPicker(true)}>
                    <Text style={[styles.dateDisplayText, { color: theme.text }]}>
                      {tmpDate.toLocaleDateString()}
                    </Text>
                    <Text style={[styles.dateChangeText, { color: theme.primary }]}>
                      CHANGE
                    </Text>
                  </TouchableOpacity>
                  {showPicker && (
                    <DateTimePicker
                      value={tmpDate}
                      mode="date"
                      display="default"
                      onChange={onDateChange}
                    />
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.saveClientBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSaveClientDetails}>
                  <Text style={[styles.saveClientBtnText, { color: theme.background }]}>
                    CONFIRM CLIENT DETAILS
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <DisplayField label="Client Name" value={clientName || "Not provided"} />
                <DisplayField label="Description" value={description || "Not provided"} />
                <DisplayField label="Date" value={date.toLocaleDateString()} last />
                <TouchableOpacity
                  style={[styles.editClientBtn, { borderColor: theme.primary }]}
                  onPress={handleEditClientDetails}>
                  <Text style={[styles.editClientBtnText, { color: theme.primary }]}>
                    EDIT DETAILS
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {!isEditingClient && (
            <>
              {/* ── 3. INVOICE TYPE ── */}
              <SectionLabel title="3. Invoice Type" style={{ marginTop: 8 }} />
              <SegmentedControl
                options={["Detailed", "Simple"]}
                value={isDetailed ? "Detailed" : "Simple"}
                onChange={(v) => setIsDetailed(v === "Detailed")}
                helper={
                  isDetailed
                    ? "Itemized breakdown: filament, electricity, wear & tear, margin."
                    : "Single-line quote — hides cost breakdown from client."
                }
              />

              {/* ── 4. SHIPPING (detailed only) ── */}
              {isDetailed && (
                <>
                  <SectionLabel title="4. Shipping — Optional" style={{ marginTop: 8 }} />
                  <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <TouchableOpacity
                      style={styles.shippingToggleRow}
                      onPress={() => setIncludeShipping(!includeShipping)}>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: theme.primary,
                            backgroundColor: includeShipping ? theme.primary : "transparent",
                          },
                        ]}>
                        {includeShipping && (
                          <Ionicons name="checkmark" size={14} color={theme.background} />
                        )}
                      </View>
                      <Text style={[styles.shippingToggleLabel, { color: theme.text }]}>
                        Include shipping cost on invoice
                      </Text>
                    </TouchableOpacity>

                    {includeShipping && (
                      <LabeledInput
                        ref={shippingRef}
                        label={`Shipping Amount (${currencySymbol})`}
                        helper="Added as a separate line item on the detailed invoice."
                        value={shippingAmount}
                        onChangeText={setShippingAmount}
                        keyboardType="numeric"
                        onFocus={onFocusFor(shippingRef)}
                      />
                    )}
                  </View>
                </>
              )}

              {/* ── ACTIONS ── */}
              <TouchableOpacity
                style={[styles.previewBtn, { backgroundColor: theme.border }]}
                onPress={() => setIsPreviewVisible(true)}>
                <Text style={[styles.previewBtnText, { color: theme.text }]}>
                  PREVIEW PDF
                </Text>
              </TouchableOpacity>

              {!isGenerated && !isGenerating && (
                <TouchableOpacity
                  style={[styles.generateBtn, { backgroundColor: theme.primary }]}
                  onPress={handleGenerateInvoice}>
                  <Text style={[styles.generateBtnText, { color: theme.background }]}>
                    GENERATE INVOICE
                  </Text>
                </TouchableOpacity>
              )}

              {isGenerating && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={[styles.loaderText, { color: theme.textSecondary }]}>
                    Rendering invoice…
                  </Text>
                </View>
              )}

              {isGenerated && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.exportBtn, { flex: 1, marginRight: 6, backgroundColor: theme.success }]}
                    onPress={handleShare}>
                    <Text style={[styles.exportBtnText, { color: "#fff" }]}>
                      SHARE PDF
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.exportBtn, { flex: 1, marginLeft: 6, backgroundColor: theme.primary }]}
                    onPress={handleDownload}>
                    <Text style={[styles.exportBtnText, { color: theme.background }]}>
                      DOWNLOAD PDF
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* PDF Preview Modal */}
        <Modal visible={isPreviewVisible} animationType="slide">
          <SafeAreaView
            style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View
              style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Invoice Preview
              </Text>
              <TouchableOpacity
                onPress={() => setIsPreviewVisible(false)}
                style={[styles.closeBtn, { backgroundColor: theme.danger }]}>
                <Text style={styles.closeBtnText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
            <WebView
              originWhitelist={["*"]}
              source={{ html: generateHTML() }}
              style={[styles.webview, { backgroundColor: "#fff" }]}
              containerStyle={{ backgroundColor: "#fff" }}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  // ── HISTORY LIST VIEW ─────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={[]}>
      <View style={styles.listContainer}>
        <Text style={[styles.header, { color: theme.text }]}>HISTORY</Text>
        <Text style={[styles.subHeader, { color: theme.textSecondary }]}>
          12-HOUR CACHE
        </Text>

        {recentQuotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No recent calculations.{"\n"}Go to the Calculator tab to get started.
            </Text>
          </View>
        ) : (
          <FlatList
            data={recentQuotes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.quoteCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => setSelectedQuoteId(item.id)}>
                <View style={styles.quoteCardHeader}>
                  <Text style={[styles.quoteCardMaterial, { color: theme.text }]}>
                    {item.materialName}
                  </Text>
                  <Text style={[styles.quoteCardPrice, { color: theme.primary }]}>
                    {item.currencySymbol}
                    {item.finalQuote.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.quoteCardFooter}>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    {item.printTime}h • {item.modelWeight}
                    {item.unit}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  listContainer: { flex: 1, padding: 16 },
  header: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 20,
    letterSpacing: 1,
  },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, fontWeight: "600", textAlign: "center", lineHeight: 24 },
  quoteCard: { padding: 16, borderRadius: 4, marginBottom: 12, borderWidth: 1 },
  quoteCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  quoteCardMaterial: { fontSize: 18, fontWeight: "700" },
  quoteCardPrice: { fontSize: 18, fontWeight: "800" },
  quoteCardFooter: { flexDirection: "row", justifyContent: "space-between" },
  backButton: { marginBottom: 15 },
  backButtonText: { fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  section: { padding: 16, borderRadius: 4, borderWidth: 1, marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 6 },
  helperText: { fontSize: 11, fontStyle: "italic" },
  input: { borderWidth: 1, borderRadius: 4, padding: 12, fontSize: 16 },

  // Business detail toggles
  toggleGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  toggleItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  toggleItemText: { fontSize: 12, fontWeight: "700" },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "dashed",
    marginRight: 8,
    marginBottom: 8,
  },
  addButtonText: { fontSize: 12, fontWeight: "800" },

  // Client picker
  clientScroll: { flexDirection: "row", marginBottom: 8 },
  clientChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 8,
  },
  clientChipText: { fontSize: 13, fontWeight: "700", marginRight: 6 },
  clientChipRemove: { fontSize: 16, fontWeight: "800", lineHeight: 18 },
  clientChipAdd: { borderStyle: "dashed" },
  labelOptional: { fontSize: 12, fontWeight: "400", fontStyle: "italic" },
  addNewClientBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    marginBottom: 8,
  },
  addNewClientText: { fontSize: 12, fontWeight: "800" },
  quickAddForm: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 8,
  },
  row: { flexDirection: "row" },
  smallBtn: { padding: 12, borderRadius: 4, alignItems: "center" },
  smallBtnText: { fontWeight: "800", fontSize: 12 },

  // Date
  dateDisplay: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateDisplayText: { fontSize: 16, fontWeight: "500" },
  dateChangeText: { fontSize: 11, fontWeight: "800" },

  saveClientBtn: {
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 8,
  },
  saveClientBtnText: { fontWeight: "800", fontSize: 14 },
  editClientBtn: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
  },
  editClientBtnText: { fontWeight: "800", fontSize: 12 },

  // Shipping
  shippingToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  shippingToggleLabel: { fontSize: 14, fontWeight: "600" },

  // Actions
  previewBtn: {
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  previewBtnText: { fontSize: 14, fontWeight: "800" },
  generateBtn: { padding: 18, borderRadius: 4, alignItems: "center" },
  generateBtnText: { fontSize: 16, fontWeight: "800", letterSpacing: 1 },
  loaderContainer: { alignItems: "center", padding: 20 },
  loaderText: { marginTop: 10, fontSize: 13 },
  actionRow: { flexDirection: "row", justifyContent: "space-between" },
  exportBtn: { padding: 18, borderRadius: 4, alignItems: "center" },
  exportBtnText: { fontSize: 14, fontWeight: "800" },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  closeBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 },
  closeBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  webview: { flex: 1 },
});

export default ExportScreen;
