import { useEffect, type FC } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useUI } from '../../context/useUI';
import styles from './Toast.module.css';

const Toast: FC = () => {
  const { toasts, clearToast } = useUI();

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={(id) => clearToast(id)} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: { id: string; message: string; type: 'success' | 'error' | 'info' };
  onClose: (id: string) => void;
}

const ToastItem: FC<ToastItemProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle size={20} className={styles.textSuccess} />;
      case 'error': return <AlertCircle size={20} className={styles.textError} />;
      default: return <Info size={20} className={styles.textInfo} />;
    }
  };

  const typeClass = styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}` as keyof typeof styles];

  return (
    <div className={`${styles.toastItem} ${typeClass}`}>
      {getIcon()}
      <p className={styles.toastMessage}>{toast.message}</p>
      <button onClick={() => onClose(toast.id)} className={styles.toastClose}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
