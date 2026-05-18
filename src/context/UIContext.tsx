import { useState } from 'react';
import type { FC, ReactNode } from 'react';
import { UIContext } from './UIContextDef';
import type { ModalData, Toast } from './UIContextDef';

export const UIProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ModalData>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const openModal = (type: string, data: ModalData = null) => {
    setModalOpen(true);
    setModalType(type);
    setModalData(data);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setModalData(null);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const clearToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <UIContext.Provider
      value={{
        modalOpen,
        modalType,
        modalData,
        toasts,
        theme,
        openModal,
        closeModal,
        showToast,
        clearToast,
        toggleTheme,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
