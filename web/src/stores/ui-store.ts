import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  activeFilters: Record<string, any>
  modalState: Record<string, boolean>
  selectedMineId: string | null
  setSidebarOpen: (open: boolean) => void
  setFilter: (key: string, value: any) => void
  clearFilters: () => void
  setModalOpen: (modalId: string, open: boolean) => void
  setSelectedMineId: (mineId: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeFilters: {},
  modalState: {},
  selectedMineId: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setFilter: (key, value) => 
    set((state) => ({ activeFilters: { ...state.activeFilters, [key]: value } })),
  clearFilters: () => set({ activeFilters: {} }),
  setModalOpen: (modalId, open) => 
    set((state) => ({ modalState: { ...state.modalState, [modalId]: open } })),
  setSelectedMineId: (mineId) => set({ selectedMineId: mineId })
}))
