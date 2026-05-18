import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ListFilter, Plus } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar: FC = () => {
  const navigate = useNavigate();

  return (
    <header className={styles.navbar}>
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={18} />
        <input 
          type="text" 
          placeholder="Search 50,000+ games, studios, genres..." 
          className={styles.searchInput}
        />
        <div className={styles.searchShortcut}>
          <kbd>⌘</kbd>
          <kbd>K</kbd>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn}>
          <Bell size={20} />
          <span className={styles.badge}></span>
        </button>
        <button className={styles.iconBtn}>
          <ListFilter size={20} />
        </button>
        <button 
          className={styles.addBtn}
          onClick={() => navigate('/add-game')}
        >
          <Plus size={18} />
          <span>Add game</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
