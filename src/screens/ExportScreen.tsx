import React, { useState, useEffect, useLayoutEffect } from "react";
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
    currencySymbol,
    pdfFont,
    taxRate,
    clearOldQuotes,
    profitMargin,
  } = useStore();

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  // Invoice Customization Toggles
  const [showBusinessName, setShowBusinessName] = useState(true);
  const [showBusinessEmail, setShowBusinessEmail] = useState(true);
  const [showBusinessPhone, setShowBusinessPhone] = useState(true);
  const [showBusinessDesc, setShowBusinessDesc] = useState(true);

  // Client Details & Lock-in State
  const [isEditingClient, setIsEditingClient] = useState(true);
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());

  // Temp Edit states
  const [tmpClientName, setTmpClientName] = useState("");
  const [tmpDescription, setTmpDescription] = useState("");
  const [tmpDate, setTmpDate] = useState(new Date());

  // Generation State (Labor Illusion)
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // Date Picker State
  const [showPicker, setShowPicker] = useState(false);
  const [isDetailed, setIsDetailed] = useState(true);

  // Preview State
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Find the actual quote object from history
  const activeQuote =
    recentQuotes.find((q) => q.id === selectedQuoteId) || null;

  // STRICT FOCUS MODE: Hide gear icon from parent stack header when in setup
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (selectedQuoteId) {
      parent?.setOptions({
        headerRight: () => null,
      });
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
    if (isFocused) {
      clearOldQuotes();
    }
  }, [isFocused]);

  useEffect(() => {
    if (selectedQuoteId && !activeQuote) {
      handleBackToList();
    }
  }, [recentQuotes, selectedQuoteId, activeQuote]);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || tmpDate;
    setShowPicker(Platform.OS === "ios");
    setTmpDate(currentDate);
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
    setClientName("");
    setDescription("");
    setDate(new Date());
    setTmpClientName("");
    setTmpDescription("");
    setTmpDate(new Date());
  };

  const generateHTML = () => {
    if (!activeQuote) return "";

    const marginAmount = activeQuote.baseCost * (profitMargin / 100);
    const dateStr = date.toLocaleDateString();
    const fontStack =
      pdfFont === "Times New Roman"
        ? "'Times New Roman', Times, serif"
        : "'Helvetica Neue', Helvetica, Arial, sans-serif";

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: ${fontStack}; padding: 40px; color: #000; line-height: 1.2; }
            .invoice-title { font-size: 48px; font-weight: 900; letter-spacing: -2px; margin-bottom: 30px; }
            
            .meta-section { display: flex; justify-content: space-between; margin-bottom: 30px; align-items: flex-start; }
            .biz-details { flex: 1; }
            .biz-name { font-size: 16px; font-weight: 800; margin-bottom: 4px; text-transform: uppercase; }
            .biz-text { font-size: 12px; color: #444; margin-bottom: 2px; }
            
            .date-block { text-align: right; }
            .label-sm { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #000; margin-bottom: 4px; letter-spacing: 0.5px; }
            .value-md { font-size: 14px; font-weight: 600; margin-bottom: 20px; }

            .client-section { margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-start; }
            .client-details { flex: 1; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; border-bottom: 2px solid #000; padding: 12px 5px; font-size: 12px; font-weight: 900; text-transform: uppercase; }
            td { padding: 15px 5px; border-bottom: 1px solid #EEE; font-size: 14px; }
            .col-qty { text-align: center; width: 80px; }
            .col-price { text-align: right; width: 100px; font-weight: 600; }
            
            .summary-section { margin-top: 30px; margin-left: auto; width: 45%; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 5px; font-size: 14px; }
            .summary-row.total { 
              margin-top: 15px;
              padding: 15px 5px; 
              border-top: 2px solid #000; 
              border-bottom: 4px double #000; 
              font-size: 20px; 
              font-weight: 900; 
              text-transform: uppercase;
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
              ${
                isDetailed
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
                  <td>Equipment Wear & Tear</td>
                  <td class="col-qty">1</td>
                  <td class="col-price">${activeQuote.currencySymbol}${activeQuote.wearAndTearCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Service Profit Margin (${profitMargin}%)</td>
                  <td class="col-qty">1</td>
                  <td class="col-price">${activeQuote.currencySymbol}${marginAmount.toFixed(2)}</td>
                </tr>
              `
                  : `
                <tr>
                  <td>Custom 3D Print Job (${activeQuote.materialName})</td>
                  <td class="col-qty">1</td>
                  <td class="col-price">${activeQuote.currencySymbol}${(activeQuote.finalQuote - activeQuote.taxAmount).toFixed(2)}</td>
                </tr>
              `
              }
            </tbody>
          </table>

          <div class="summary-section">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${activeQuote.currencySymbol}${(activeQuote.finalQuote - activeQuote.taxAmount).toFixed(2)}</span>
            </div>
            ${activeQuote.taxAmount > 0 ? `
            <div class="summary-row">
              <span>Tax (${taxRate}%)</span>
              <span>${activeQuote.currencySymbol}${activeQuote.taxAmount.toFixed(2)}</span>
            </div>
            ` : ""}
            <div class="summary-row total">
              <span>Total</span>
              <span>${activeQuote.currencySymbol}${activeQuote.finalQuote.toFixed(2)}</span>
            </div>
          </div>

          ${description ? `<div class="notes"><div class="notes-label">Additional Details</div>${description}</div>` : ""}

          <div class="footer">
            Generated by 3D QUOTE PRO
          </div>
        </body>
      </html>
    `;
  };

  const handleShare = async () => {
    try {
      const html = generateHTML();
      const { uri } = await Print.printToFileAsync({ 
        html,
        width: 595,
        height: 842 
      });
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      console.error("Error sharing:", error);
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
          Alert.alert("Success", "Invoice saved to the selected folder.");
        }
      } else {
        await Sharing.shareAsync(tempUri);
      }
    } catch (error) {
      console.error("Error downloading:", error);
      Alert.alert("Error", "Could not save the file.");
    }
  };

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

  const AddLink = ({ label }: { label: string }) => (
    <TouchableOpacity
      style={[styles.addButton, { borderColor: theme.primary }]}
      onPress={() => navigation.navigate("Settings")}>
      <Text style={[styles.addButtonText, { color: theme.primary }]}>
        + Add {label}
      </Text>
    </TouchableOpacity>
  );

  if (activeQuote) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
        edges={[]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            onPress={handleBackToList}
            style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.primary }]}>
              ← BACK TO HISTORY
            </Text>
          </TouchableOpacity>

          <Text style={[styles.header, { color: theme.text }]}>
            INVOICE SETUP
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            1. BUSINESS DETAILS
          </Text>
          <Text
            style={[
              styles.helperText,
              { color: theme.textSecondary, marginBottom: 12 },
            ]}>
            Toggle display on invoice.
          </Text>
          <View style={styles.toggleGrid}>
            <ToggleItem
              label="Name"
              value={showBusinessName}
              onToggle={setShowBusinessName}
            />
            {businessEmail ? (
              <ToggleItem
                label="Email"
                value={showBusinessEmail}
                onToggle={setShowBusinessEmail}
              />
            ) : (
              <AddLink label="Email" />
            )}
            {businessPhone ? (
              <ToggleItem
                label="Phone"
                value={showBusinessPhone}
                onToggle={setShowBusinessPhone}
              />
            ) : (
              <AddLink label="Phone" />
            )}
            {businessDescription ? (
              <ToggleItem
                label="Description"
                value={showBusinessDesc}
                onToggle={setShowBusinessDesc}
              />
            ) : (
              <AddLink label="Description" />
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            2. CLIENT DETAILS
          </Text>
          <View
            style={[
              styles.section,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            {isEditingClient ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Client Name
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
                    value={tmpClientName}
                    onChangeText={setTmpClientName}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Description
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.text,
                        borderColor: theme.border,
                        backgroundColor: theme.background,
                        height: 80,
                      },
                    ]}
                    value={tmpDescription}
                    onChangeText={setTmpDescription}
                    multiline
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Invoice Date *
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dateDisplay,
                      {
                        borderColor: theme.border,
                        backgroundColor: theme.background,
                      },
                    ]}
                    onPress={() => setShowPicker(true)}>
                    <Text
                      style={[styles.dateDisplayText, { color: theme.text }]}>
                      {tmpDate.toLocaleDateString()}
                    </Text>
                    <Text
                      style={[styles.dateChangeText, { color: theme.primary }]}>
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
                  style={[
                    styles.saveClientBtn,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleSaveClientDetails}>
                  <Text
                    style={[
                      styles.saveClientBtnText,
                      { color: theme.background },
                    ]}>
                    SAVE CLIENT DETAILS
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View
                  style={[
                    styles.displayBox,
                    { borderBottomColor: theme.border },
                  ]}>
                  <Text
                    style={[
                      styles.displayLabel,
                      { color: theme.textSecondary },
                    ]}>
                    Client Name
                  </Text>
                  <Text style={[styles.displayText, { color: theme.text }]}>
                    {clientName || "Not provided"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.displayBox,
                    { borderBottomColor: theme.border },
                  ]}>
                  <Text
                    style={[
                      styles.displayLabel,
                      { color: theme.textSecondary },
                    ]}>
                    Description
                  </Text>
                  <Text style={[styles.displayText, { color: theme.text }]}>
                    {description || "Not provided"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.displayBox,
                    { borderBottomColor: "transparent" },
                  ]}>
                  <Text
                    style={[
                      styles.displayLabel,
                      { color: theme.textSecondary },
                    ]}>
                    Date
                  </Text>
                  <Text style={[styles.displayText, { color: theme.text }]}>
                    {date.toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.editClientBtn, { borderColor: theme.primary }]}
                  onPress={handleEditClientDetails}>
                  <Text
                    style={[
                      styles.editClientBtnText,
                      { color: theme.primary },
                    ]}>
                    EDIT DETAILS
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {!isEditingClient && (
            <>
              <Text
                style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                3. INVOICE TYPE
              </Text>
              <View style={[styles.toggleRow, { borderColor: theme.primary }]}>
                <TouchableOpacity
                  onPress={() => setIsDetailed(true)}
                  style={[
                    styles.toggleBtn,
                    isDetailed && { backgroundColor: theme.primary },
                  ]}>
                  <Text
                    style={[
                      styles.toggleBtnText,
                      { color: theme.primary },
                      isDetailed && { color: theme.background },
                    ]}>
                    Detailed
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsDetailed(false)}
                  style={[
                    styles.toggleBtn,
                    !isDetailed && { backgroundColor: theme.primary },
                  ]}>
                  <Text
                    style={[
                      styles.toggleBtnText,
                      { color: theme.primary },
                      !isDetailed && { color: theme.background },
                    ]}>
                    Simple
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  styles.helperText,
                  { color: theme.textSecondary, marginTop: 8 },
                ]}>
                {isDetailed
                  ? "Itemized breakdown of all costs."
                  : "Simplified single-line quote."}
              </Text>

              <TouchableOpacity
                style={[styles.previewBtn, { backgroundColor: theme.border }]}
                onPress={() => setIsPreviewVisible(true)}>
                <Text style={[styles.previewBtnText, { color: theme.text }]}>
                  PREVIEW PDF
                </Text>
              </TouchableOpacity>

              {!isGenerated && !isGenerating && (
                <TouchableOpacity
                  style={[
                    styles.generateBtn,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleGenerateInvoice}>
                  <Text
                    style={[
                      styles.generateBtnText,
                      { color: theme.background },
                    ]}>
                    GENERATE INVOICE
                  </Text>
                </TouchableOpacity>
              )}

              {isGenerating && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text
                    style={[styles.loaderText, { color: theme.textSecondary }]}>
                    Rendering professional invoice...
                  </Text>
                </View>
              )}

              {isGenerated && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.exportBtn,
                      {
                        flex: 1,
                        marginRight: 6,
                        backgroundColor: theme.success,
                      },
                    ]}
                    onPress={handleShare}>
                    <Text style={[styles.exportBtnText, { color: "#fff" }]}>
                      SHARE PDF
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.exportBtn,
                      {
                        flex: 1,
                        marginLeft: 6,
                        backgroundColor: theme.primary,
                      },
                    ]}
                    onPress={handleDownload}>
                    <Text
                      style={[
                        styles.exportBtnText,
                        { color: theme.background },
                      ]}>
                      DOWNLOAD PDF
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>

        <Modal visible={isPreviewVisible} animationType="slide">
          <SafeAreaView
            style={[
              styles.modalContainer,
              { backgroundColor: theme.background },
            ]}>
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
              style={[styles.webview, { backgroundColor: theme.background }]}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

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
              No recent calculations.
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
                  <Text style={[styles.materialName, { color: theme.text }]}>
                    {item.materialName}
                  </Text>
                  <Text style={[styles.quotePrice, { color: theme.primary }]}>
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
  emptyText: { fontSize: 16, fontWeight: "600" },
  quoteCard: { padding: 16, borderRadius: 4, marginBottom: 12, borderWidth: 1 },
  quoteCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  materialName: { fontSize: 18, fontWeight: "700" },
  quotePrice: { fontSize: 18, fontWeight: "800" },
  quoteCardFooter: { flexDirection: "row", justifyContent: "space-between" },
  backButton: { marginBottom: 15 },
  backButtonText: { fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  section: { padding: 16, borderRadius: 4, borderWidth: 1, marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 1,
    marginTop: 12,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 4, padding: 12, fontSize: 16 },
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
  helperText: { fontSize: 12, fontStyle: "italic" },
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
  displayBox: { paddingVertical: 12, borderBottomWidth: 1 },
  displayLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  displayText: { fontSize: 16, fontWeight: "500" },
  saveClientBtn: {
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 10,
  },
  saveClientBtnText: { fontWeight: "800", fontSize: 14 },
  editClientBtn: {
    marginTop: 15,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
  },
  editClientBtnText: { fontWeight: "800", fontSize: 12 },
  toggleRow: {
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
  },
  toggleBtn: { flex: 1, padding: 12, alignItems: "center" },
  toggleBtnText: { fontWeight: "800", fontSize: 13 },
  previewBtn: {
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 12,
    marginTop: 12,
  },
  previewBtnText: { fontSize: 14, fontWeight: "800" },
  generateBtn: { padding: 18, borderRadius: 4, alignItems: "center" },
  generateBtnText: { fontSize: 16, fontWeight: "800", letterSpacing: 1 },
  loaderContainer: { alignItems: "center", padding: 20 },
  loaderText: { marginTop: 10, fontSize: 13 },
  actionRow: { flexDirection: "row", justifyContent: "space-between" },
  exportBtn: { padding: 18, borderRadius: 4, alignItems: "center" },
  exportBtnText: { fontSize: 14, fontWeight: "800" },
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
