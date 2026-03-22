import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface MaterialProfile {
  id: string;
  name: string;
  price: number;
  unit: string; // "g", "kg", "lb"
}

interface StoreState {
  electricityRate: number;
  printerWattage: number;
  profitMargin: number;
  wearAndTearFee: number;
  materials: MaterialProfile[];
  
  setElectricityRate: (rate: number) => void;
  setPrinterWattage: (wattage: number) => void;
  setProfitMargin: (margin: number) => void;
  setWearAndTearFee: (fee: number) => void;
  addMaterial: (material: Omit<MaterialProfile, "id">) => void;
  updateMaterial: (id: string, material: Partial<Omit<MaterialProfile, "id">>) => void;
  removeMaterial: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      electricityRate: 0.15,
      printerWattage: 300,
      profitMargin: 50,
      wearAndTearFee: 0.50,
      materials: [],

      setElectricityRate: (rate) => set({ electricityRate: rate }),
      setPrinterWattage: (wattage) => set({ printerWattage: wattage }),
      setProfitMargin: (margin) => set({ profitMargin: margin }),
      setWearAndTearFee: (fee) => set({ wearAndTearFee: fee }),
      
      addMaterial: (material) => set((state) => ({
        materials: [
          ...state.materials,
          { ...material, id: Date.now().toString() }
        ]
      })),

      updateMaterial: (id, updatedFields) => set((state) => ({
        materials: state.materials.map((m) => 
          m.id === id ? { ...m, ...updatedFields } : m
        )
      })),
      
      removeMaterial: (id) => set((state) => ({
        materials: state.materials.filter((m) => m.id !== id)
      })),
    }),
    {
      name: "3d-quote-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
