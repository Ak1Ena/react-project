import { useEffect, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { fetchGames } from '../features/games/gamesSlice';
import GameGrid from '../components/GameGrid/GameGrid';
import FilterBar from '../components/FilterBar/FilterBar';
import styles from './HomePage.module.css';

const HomePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: games, status, error } = useSelector((state: RootState) => state.games);
  const filters = useSelector((state: RootState) => state.filters);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchGames());
    }
  }, [status, dispatch]);

  const filteredGames = games
    .filter((game) => {
      const matchesSearch = game.name.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesGenre = filters.genre === 'All' || game.genre.includes(filters.genre);
      const matchesPlatform = filters.platform === 'All' || game.platforms.some(p => p.includes(filters.platform));
      return matchesSearch && matchesGenre && matchesPlatform;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'title-asc': return a.name.localeCompare(b.name);
        case 'title-desc': return b.name.localeCompare(a.name);
        case 'rating-desc': return b.rating - a.rating;
        case 'rating-asc': return a.rating - b.rating;
        case 'year-desc': return b.releaseYear - a.releaseYear;
        case 'year-asc': return a.releaseYear - b.releaseYear;
        default: return 0;
      }
    });

  return (
    <div className={styles.homePage}>
      <header className={styles.pageHeader}>
        <h1>Explore Games</h1>
        <p>Discover your next favorite game and add it to your collection.</p>
      </header>
      
      <FilterBar />
      
      {status === 'failed' && <div className={styles.errorMessage}>{error}</div>}
      
      <GameGrid games={filteredGames} loading={status === 'loading'} />
    </div>
  );
};

export default HomePage;
