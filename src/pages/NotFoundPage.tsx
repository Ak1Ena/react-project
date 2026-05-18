import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import styles from './NotFoundPage.module.css';

const NotFoundPage: FC = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.iconBubble}>
          <Compass size={48} />
        </div>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Page not found</h2>
        <p className={styles.subtitle}>
          We couldn't find what you were looking for. The link might be broken or the page may have moved.
        </p>
        <Link to="/" className={styles.homeBtn}>
          <Home size={16} />
          <span>Back to dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
