import { createContext } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ModalData = Record<string, unknown> | null;

export interface UIContextType {
  modalOpen: boolean;
  modalType: string | null;
  modalData: ModalData;
  toasts: Toast[];
  theme: 'light' | 'dark';
  openModal: (type: string, data?: ModalData) => void;
  closeModal: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  clearToast: (id: string) => void;
  toggleTheme: () => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);
