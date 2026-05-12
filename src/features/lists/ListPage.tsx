import { useEffect, type FC } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../app/store';
import { fetchListEntries, selectEntriesByStatus } from './listsSlice';
import { fetchGames } from '../games/gamesSlice';
import ListEntryCard from '../../components/ListEntryCard/ListEntryCard';
import styles from './ListPage.module.css';

const ListPage: FC = () => {
  const { status: currentStatus } = useParams<{ status: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const filteredEntries = useSelector((state: RootState) => selectEntriesByStatus(state, currentStatus));
  const { status: listStatus } = useSelector((state: RootState) => state.lists);
  const { items: games, status: gamesStatus } = useSelector((state: RootState) => state.games);

  useEffect(() => {
    if (listStatus === 'idle') dispatch(fetchListEntries());
    if (gamesStatus === 'idle') dispatch(fetchGames());
  }, [listStatus, gamesStatus, dispatch]);

  const getGame = (gameId: string) => games.find((g) => g.id === gameId);

  return (
    <div className={styles.listPage}>
      <header className={styles.pageHeader}>
        <h1>My Personal Lists</h1>
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
                const game = getGame(entry.gameid);
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
