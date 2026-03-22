import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface MaterialProfile {
  id: string;
  name: string;
  price: number;
  unit: string; // "g", "kg", "lb"
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
  finalQuote: number;
  timestamp: number;
}

interface StoreState {
  electricityRate: number;
  printerWattage: number;
  profitMargin: number;
  wearAndTearFee: number;
  materials: MaterialProfile[];
  businessName: string;
  recentQuotes: QuoteRecord[];

  setElectricityRate: (rate: number) => void;
  setPrinterWattage: (wattage: number) => void;
  setProfitMargin: (margin: number) => void;
  setWearAndTearFee: (fee: number) => void;
  setBusinessName: (name: string) => void;
  addMaterial: (material: Omit<MaterialProfile, "id">) => void;
  updateMaterial: (id: string, material: Partial<Omit<MaterialProfile, "id">>) => void;
  removeMaterial: (id: string) => void;
  addQuoteToHistory: (quote: Omit<QuoteRecord, "id" | "timestamp">) => void;
  clearOldQuotes: () => void;
}

const EXPIRE_TIME = 12 * 60 * 60 * 1000; // 12 hours

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      electricityRate: 0.15,
      printerWattage: 300,
      profitMargin: 50,
      wearAndTearFee: 0.50,
      materials: [],
      businessName: "",
      recentQuotes: [],

      setElectricityRate: (rate) => set({ electricityRate: rate }),
      setPrinterWattage: (wattage) => set({ printerWattage: wattage }),
      setProfitMargin: (margin) => set({ profitMargin: margin }),
      setWearAndTearFee: (fee) => set({ wearAndTearFee: fee }),
      setBusinessName: (name) => set({ businessName: name }),

      addMaterial: (material) =>
        set((state) => ({
          materials: [
            ...state.materials,
            { ...material, id: Date.now().toString() },
          ],
        })),

      updateMaterial: (id, updatedFields) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...updatedFields } : m
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
            id: now.toString(),
            timestamp: now,
          };
          const filteredHistory = state.recentQuotes.filter(
            (q) => now - q.timestamp < EXPIRE_TIME
          );
          return {
            recentQuotes: [newQuote, ...filteredHistory],
          };
        }),

      clearOldQuotes: () =>
        set((state) => {
          const now = Date.now();
          return {
            recentQuotes: state.recentQuotes.filter(
              (q) => now - q.timestamp < EXPIRE_TIME
            ),
          };
        }),
    }),
    {
      name: "3d-quote-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
