import { useEffect, type FC, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Loader2 } from 'lucide-react';
import type { RootState, AppDispatch } from '../app/store';
import { fetchListEntries, selectEntriesByStatus, syncSteamLibrary } from '../features/lists/listsSlice';
import { fetchGames } from '../features/games/gamesSlice';
import { showToast } from '../features/ui/uiSlice';
import ListEntryCard from '../components/ListEntryCard/ListEntryCard';
import styles from './ListPage.module.css';

const ListPage: FC = () => {
  const { status: currentStatus } = useParams<{ status: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const filteredEntries = useSelector((state: RootState) => selectEntriesByStatus(state, currentStatus));
  const { status: listStatus } = useSelector((state: RootState) => state.lists);
  const { items: games, status: gamesStatus } = useSelector((state: RootState) => state.games);

  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (listStatus === 'idle') dispatch(fetchListEntries());
    if (gamesStatus === 'idle') dispatch(fetchGames());
  }, [listStatus, gamesStatus, dispatch]);

  const getGame = (gameId: string) => games.find((g) => g.id === gameId);

  const handleSteamSync = async () => {
    const steamInput = window.prompt('Enter your Steam ID or Vanity URL name:');
    if (!steamInput) return;

    setSyncing(true);
    try {
      const count = await dispatch(syncSteamLibrary(steamInput)).unwrap();
      dispatch(showToast({ message: `Successfully synced ${count} games from Steam!`, type: 'success' }));
    } catch (error) {
      dispatch(showToast({ message: typeof error === 'string' ? error : 'Steam sync failed', type: 'error' }));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={styles.listPage}>
      <header className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1>My Personal Lists</h1>
          <button 
            onClick={handleSteamSync} 
            disabled={syncing} 
            className={styles.steamSyncBtn}
            title="Import from Steam"
          >
            {syncing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            <span>{syncing ? 'Syncing...' : 'Sync Steam'}</span>
          </button>
        </div>
        <div className={styles.listTabs}>
          <NavLink to="/my-list/playing" className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>Playing</NavLink>
          <NavLink to="/my-list/completed" className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>Completed</NavLink>
          <NavLink to="/my-list/backlog" className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>Backlog</NavLink>
          <NavLink to="/my-list/wishlist" className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>Wishlist</NavLink>
        </div>
      </header>

      {(listStatus === 'failed' || gamesStatus === 'failed') && (
        <div className={styles.errorMessage}>Failed to load your list. Please try again.</div>
      )}

      {(listStatus === 'loading' || gamesStatus === 'loading') ? (
        <div className={styles.loading}>Loading your list...</div>
      ) : (
        <div className={styles.listContainer}>
          {filteredEntries.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No games in your {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : ''} list yet.</p>
              <NavLink to="/" className={styles.btnPrimary}>Browse Games</NavLink>
            </div>
          ) : (
            <div className={styles.listGrid}>
              {filteredEntries.map((entry) => {
                const game = getGame(entry.gameId);
                return game ? (
                  <ListEntryCard key={entry.id} entry={entry} game={game} />
                ) : null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListPage;
