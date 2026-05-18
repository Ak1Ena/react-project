import { useEffect, useState, type FC } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import type { RootState, AppDispatch } from '../app/store';
import { fetchListEntries, selectEntriesByStatus } from '../features/lists/listsSlice';
import { fetchGames } from '../features/games/gamesSlice';
import { syncSteamLibrary, fetchOwnedGames } from '../features/steam/steamSlice';
import ListEntryCard from '../components/ListEntryCard/ListEntryCard';
import styles from './ListPage.module.css';

const ListPage: FC = () => {
  const { status: currentStatus } = useParams<{ status: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const filteredEntries = useSelector((state: RootState) => selectEntriesByStatus(state, currentStatus));
  const { status: listStatus } = useSelector((state: RootState) => state.lists);
  const { items: games, status: gamesStatus } = useSelector((state: RootState) => state.games);
  const { steamId, status: steamStatus } = useSelector((state: RootState) => state.steam);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchListEntries());
      if (steamId) {
        dispatch(fetchOwnedGames(steamId));
      }
    }
    if (gamesStatus === 'idle') {
      dispatch(fetchGames());
    }
  }, [currentUser?.id, steamId, gamesStatus, dispatch]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentStatus]);

  const handleSyncLibrary = () => {
    if (window.confirm('This will import up to 50 new Steam games into your Backlog. Continue?')) {
      dispatch(syncSteamLibrary());
    }
  };

  const getGame = (gameId: string) => games.find((g) => g.id === gameId);

  // Pagination logic
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.listPage}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTitle}>
          <h1>My Personal Lists</h1>
          {steamId && (
            <button 
              onClick={handleSyncLibrary} 
              className={styles.syncBtn}
              disabled={steamStatus === 'loading'}
            >
              <RefreshCw size={16} className={steamStatus === 'loading' ? styles.spin : ''} />
              {steamStatus === 'loading' ? 'Syncing...' : 'Sync Steam'}
            </button>
          )}
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
        <>
          <div className={styles.listContainer}>
            {filteredEntries.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No games in your {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : ''} list yet.</p>
                <NavLink to="/" className={styles.btnPrimary}>Browse Games</NavLink>
              </div>
            ) : (
              <div className={styles.listGrid}>
                {paginatedEntries.map((entry) => {
                  const game = getGame(entry.gameId);
                  return (
                    <ListEntryCard 
                      key={entry.id} 
                      entry={entry} 
                      game={game as any} 
                    />
                  );
                })}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                <ChevronLeft size={20} />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.pageActive : ''}`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={styles.pageBtn}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListPage;
