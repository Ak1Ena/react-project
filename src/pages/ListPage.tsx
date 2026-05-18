import { useState, type FC } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetGamesQuery,
  useGetListEntriesQuery,
  useRemoveFromListMutation,
} from '../features/api/gameApi';
import type { RootState } from '../app/store';
import { selectFilteredGames } from '../features/filters/filtersSlice';
import { useUI } from '../context/useUI';
import FilterBar from '../components/FilterBar/FilterBar';
import GameCard from '../components/GameCard/GameCard';
import Spinner from '../components/Spinner/Spinner';
import styles from './ListPage.module.css';

const ListPage: FC = () => {
  const { status } = useParams<{ status: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useUI();

  const { data: games = [], isLoading: gamesLoading } = useGetGamesQuery();
  const { data: allEntries = [] } = useGetListEntriesQuery(currentUser?.id ?? '', {
    skip: !currentUser,
  });
  const [removeFromList] = useRemoveFromListMutation();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filteredGames = useSelector((state: RootState) =>
    selectFilteredGames(state, games, allEntries, status),
  );

  const handleRemoveFromList = async (gameId: string) => {
    const entry = allEntries.find((e) => e.gameId === gameId && (!status || e.status === status));
    if (!entry || removingId) return;
    if (!window.confirm('Remove this game from your list?')) return;
    setRemovingId(entry.id);
    try {
      await removeFromList(entry.id).unwrap();
      showToast('Removed from your list.', 'success');
    } catch {
      showToast('Failed to remove. Try again.', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Library';

  if (gamesLoading) {
    return (
      <div className={styles.listPage}>
        <Spinner fullPage label="Loading..." />
      </div>
    );
  }

  return (
    <div className={styles.listPage}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{displayStatus}</h1>
          <p className={styles.subtitle}>
            {filteredGames.length} titles · auto-synced from your connected platforms
          </p>
        </div>
      </header>

      <FilterBar totalResults={filteredGames.length} />

      <div className={styles.gridContainer}>
        {filteredGames.map(game => (
          <GameCard
            key={game.id}
            game={game}
            status={displayStatus}
            onRemove={status ? () => handleRemoveFromList(game.id) : undefined}
            removing={status ? removingId === allEntries.find(e => e.gameId === game.id && e.status === status)?.id : false}
          />
        ))}
      </div>
    </div>
  );
};

export default ListPage;
