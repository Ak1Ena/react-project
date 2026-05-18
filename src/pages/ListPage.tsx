import { useEffect, useState, useMemo, type FC } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { fetchListEntries, selectEntriesByStatus } from '../features/lists/listsSlice';
import { fetchGames, fetchGamesByIds, selectGamesById } from '../features/games/gamesSlice';
import ListEntryCard from '../components/ListEntryCard/ListEntryCard';
import SteamLibraryImport from '../components/SteamLibraryImport/SteamLibraryImport';
import Pagination from '../components/Pagination/Pagination';
import styles from './ListPage.module.css';

const ListPage: FC = () => {
  const { status: currentStatus } = useParams<{ status: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const filteredEntries = useSelector((state: RootState) => selectEntriesByStatus(state, currentStatus));
  const { entries, status: listStatus } = useSelector((state: RootState) => state.lists);
  const { status: gamesStatus } = useSelector((state: RootState) => state.games);
  const gamesById = useSelector(selectGamesById);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchListEntries());
    }
    if (gamesStatus === 'idle') {
      dispatch(fetchGames());
    }
  }, [currentUser?.id, gamesStatus, dispatch]);

  // Lazy load missing games
  const missingIds = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const e of entries) {
      if (!gamesById[e.gameId] && !seen.has(e.gameId)) {
        seen.add(e.gameId);
        out.push(e.gameId);
      }
    }
    return out;
  }, [entries, gamesById]);

  useEffect(() => {
    if (missingIds.length > 0) {
      dispatch(fetchGamesByIds(missingIds));
    }
  }, [missingIds, dispatch]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentStatus]);

  const getGame = (gameId: string) => gamesById[gameId];

  // Pagination logic
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={styles.listPage}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTitle}>
          <h1>My Personal Lists</h1>
        </div>
        <div className={styles.listTabs}>
          <NavLink to="/my-list/playing" className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>Playing</NavLink>
          <NavLink to="/my-list/completed" className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>Completed</NavLink>
          <NavLink to="/my-list/backlog" className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>Backlog</NavLink>
          <NavLink to="/my-list/wishlist" className={({ isActive }) => isActive ? `${styles.tab} ${styles.active}` : styles.tab}>Wishlist</NavLink>
        </div>
      </header>

      <SteamLibraryImport />

      {listStatus === 'failed' && (
        <div className={styles.errorMessage}>Failed to load your list. Please try again.</div>
      )}

      {listStatus === 'loading' ? (
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
                      game={game} 
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.paginationWrapper}>
            <Pagination
              currentPage={currentPage}
              total={filteredEntries.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ListPage;
