import { type FC } from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: number;
  label?: string;
  fullPage?: boolean;
  inline?: boolean;
}

const Spinner: FC<SpinnerProps> = ({ size = 24, label, fullPage, inline }) => {
  if (inline) {
    return <Loader2 size={size} className={styles.spinner} aria-label={label ?? 'Loading'} />;
  }

  return (
    <div className={fullPage ? styles.fullPage : styles.wrapper} role="status" aria-live="polite">
      <Loader2 size={size} className={styles.spinner} />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
};

export default Spinner;
