import { useEffect, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { RootState } from '../../app/store';
import { clearToast } from '../../features/ui/uiSlice';

const Toast: FC = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state: RootState) => state.ui.toasts);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={(id) => dispatch(clearToast(id))} />
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
      case 'success': return <CheckCircle size={20} className="text-success" />;
      case 'error': return <AlertCircle size={20} className="text-error" />;
      default: return <Info size={20} className="text-info" />;
    }
  };

  return (
    <div className={`toast-item toast-${toast.type}`}>
      {getIcon()}
      <p className="toast-message">{toast.message}</p>
      <button onClick={() => onClose(toast.id)} className="toast-close">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
