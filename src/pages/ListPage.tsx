import { type FC } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetGamesQuery, useGetListEntriesQuery } from '../features/api/gameApi';
import type { RootState } from '../app/store';
import FilterBar from '../components/FilterBar/FilterBar';
import GameCard from '../components/GameCard/GameCard';
import styles from './ListPage.module.css';

const ListPage: FC = () => {
  const { status } = useParams<{ status: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const filters = useSelector((state: RootState) => state.filters);

  const { data: games = [], isLoading: gamesLoading } = useGetGamesQuery();
  const { data: allEntries = [] } = useGetListEntriesQuery(currentUser?.id ?? '', {
    skip: !currentUser,
  });

  const entries = status ? allEntries.filter((e) => e.status === status) : allEntries;

  const filteredGames = games.filter((game) => {
    if (status) {
      const entry = entries.find((e) => e.gameId === game.id && e.status === status);
      if (!entry) return false;
    }

    if (filters.searchQuery && !game.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.genre !== 'All' && !game.genre.includes(filters.genre)) {
      return false;
    }
    if (filters.platform !== 'All' && !game.platforms.some(p => p.includes(filters.platform))) {
      return false;
    }
    if (filters.year !== 'All') {
      if (filters.year === '≤2022') {
        if (game.releaseYear > 2022) return false;
      } else if (game.releaseYear.toString() !== filters.year) {
        return false;
      }
    }
    if (game.rating < filters.minRating) {
      return false;
    }

    return true;
  });

  const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Library';

  if (gamesLoading) {
    return <div className={styles.listPage}>Loading...</div>;
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
          <GameCard key={game.id} game={game} status={displayStatus} />
        ))}
      </div>
    </div>
  );
};

export default ListPage;
