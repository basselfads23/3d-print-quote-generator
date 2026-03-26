import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface MaterialProfile {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export interface SavedClient {
  id: string;
  name: string;
}

export interface QuoteRecord {
  id: string;
  materialName: string;
  printTime: number;
  modelWeight: number;
  unit: string;
  materialCost: number;
  electricityCost: number;
  wearAndTearCost: number;
  baseCost: number;
  taxAmount: number;
  finalQuote: number;
  timestamp: number;
  currencySymbol: string;
}

const DEFAULT_VALUES = {
  isSetupComplete: false,
  businessName: "",
  businessEmail: "",
  businessPhone: "",
  businessDescription: "",
  businessLogo: "",
  currencySymbol: "$",
  weightUnit: "g",
  pdfFont: "Helvetica",
  electricityRate: 0,
  printerWattage: 0,
  profitMargin: 0,
  wearAndTearFee: 0,
  taxRate: 0,
  materials: [] as MaterialProfile[],
  recentQuotes: [] as QuoteRecord[],
  savedClients: [] as SavedClient[],
};

interface StoreState {
  // Setup Guard
  isSetupComplete: boolean;

  // User Profile
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessDescription: string;
  businessLogo: string;

  // App Preferences
  currencySymbol: string;
  weightUnit: string;
  pdfFont: string;

  // Print Variables
  electricityRate: number;
  printerWattage: number;
  profitMargin: number;
  wearAndTearFee: number;
  taxRate: number;

  // Data
  materials: MaterialProfile[];
  recentQuotes: QuoteRecord[];
  savedClients: SavedClient[];

  // Actions
  completeSetup: () => void;
  setBusinessName: (name: string) => void;
  setBusinessEmail: (email: string) => void;
  setBusinessPhone: (phone: string) => void;
  setBusinessDescription: (desc: string) => void;
  setBusinessLogo: (uri: string) => void;
  setCurrencySymbol: (symbol: string) => void;
  setWeightUnit: (unit: string) => void;
  setPdfFont: (font: string) => void;
  setElectricityRate: (rate: number) => void;
  setPrinterWattage: (wattage: number) => void;
  setProfitMargin: (margin: number) => void;
  setWearAndTearFee: (fee: number) => void;
  setTaxRate: (rate: number) => void;

  addMaterial: (material: Omit<MaterialProfile, "id" | "unit">) => void;
  updateMaterial: (
    id: string,
    material: Partial<Omit<MaterialProfile, "id">>,
  ) => void;
  removeMaterial: (id: string) => void;
  addQuoteToHistory: (
    quote: Omit<QuoteRecord, "id" | "timestamp" | "currencySymbol">,
  ) => void;
  clearOldQuotes: () => void;
  clearAllQuotes: () => void;
  factoryReset: () => void;

  addSavedClient: (name: string) => void;
  removeSavedClient: (id: string) => void;
}

const EXPIRE_TIME = 12 * 60 * 60 * 1000; // 12 hours

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...DEFAULT_VALUES,

      completeSetup: () => set({ isSetupComplete: true }),
      setBusinessName: (name) => set({ businessName: name }),
      setBusinessEmail: (email) => set({ businessEmail: email }),
      setBusinessPhone: (phone) => set({ businessPhone: phone }),
      setBusinessDescription: (desc) => set({ businessDescription: desc }),
      setBusinessLogo: (uri) => set({ businessLogo: uri }),
      setCurrencySymbol: (symbol) => set({ currencySymbol: symbol }),
      setWeightUnit: (unit) => set({ weightUnit: unit }),
      setPdfFont: (font) => set({ pdfFont: font }),
      setElectricityRate: (rate) => set({ electricityRate: rate }),
      setPrinterWattage: (wattage) => set({ printerWattage: wattage }),
      setProfitMargin: (margin) => set({ profitMargin: margin }),
      setWearAndTearFee: (fee) => set({ wearAndTearFee: fee }),
      setTaxRate: (rate) => set({ taxRate: rate }),

      addMaterial: (material) =>
        set((state) => ({
          materials: [
            ...state.materials,
            {
              ...material,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              unit: state.weightUnit,
            },
          ],
        })),

      updateMaterial: (id, updatedFields) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...updatedFields } : m,
          ),
        })),

      removeMaterial: (id) =>
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
        })),

      addQuoteToHistory: (quote) =>
        set((state) => {
          const now = Date.now();
          const newQuote: QuoteRecord = {
            ...quote,
            id: `${now}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: now,
            currencySymbol: state.currencySymbol,
          };
          const filteredHistory = state.recentQuotes.filter(
            (q) => now - q.timestamp < EXPIRE_TIME,
          );
          return { recentQuotes: [newQuote, ...filteredHistory] };
        }),

      clearOldQuotes: () =>
        set((state) => {
          const now = Date.now();
          return {
            recentQuotes: state.recentQuotes.filter(
              (q) => now - q.timestamp < EXPIRE_TIME,
            ),
          };
        }),

      clearAllQuotes: () => set({ recentQuotes: [] }),

      factoryReset: () => set(DEFAULT_VALUES),

      addSavedClient: (name) =>
        set((state) => ({
          savedClients: [
            ...state.savedClients,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: name.trim(),
            },
          ],
        })),

      removeSavedClient: (id) =>
        set((state) => ({
          savedClients: state.savedClients.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "3d-quote-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
