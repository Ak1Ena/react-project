import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  modalOpen: boolean;
  modalType: string | null;
  modalData: unknown | null;
  toasts: Toast[];
  theme: 'light' | 'dark';
}

const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';

const initialState: UIState = {
  modalOpen: false,
  modalType: null,
  modalData: null,
  toasts: [],
  theme: savedTheme,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<{ type: string; data?: unknown }>) => {
      state.modalOpen = true;
      state.modalType = action.payload.type;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.modalType = null;
      state.modalData = null;
    },
    showToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      state.toasts.push({
        ...action.payload,
        id: Date.now().toString(),
      });
    },
    clearToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
  },
});

export const { openModal, closeModal, showToast, clearToast, toggleTheme } = uiSlice.actions;

export default uiSlice.reducer;
