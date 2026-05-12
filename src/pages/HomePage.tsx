import { useEffect, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { fetchGames } from '../features/games/gamesSlice';
import GameGrid from '../components/GameGrid';
import FilterBar from '../components/FilterBar';

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
      const matchesSearch = game.title.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesGenre = filters.genre === 'All' || game.genre === filters.genre;
      const matchesPlatform = filters.platform === 'All' || game.platform.includes(filters.platform);
      return matchesSearch && matchesGenre && matchesPlatform;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'title-asc': return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        case 'rating-desc': return b.rating - a.rating;
        case 'rating-asc': return a.rating - b.rating;
        case 'year-desc': return b.releaseYear - a.releaseYear;
        case 'year-asc': return a.releaseYear - b.releaseYear;
        default: return 0;
      }
    });

  return (
    <div className="home-page">
      <header className="page-header">
        <h1>Explore Games</h1>
        <p>Discover your next favorite game and add it to your collection.</p>
      </header>
      
      <FilterBar />
      
      {status === 'failed' && <div className="error-message">{error}</div>}
      
      <GameGrid games={filteredGames} loading={status === 'loading'} />
    </div>
  );
};

export default HomePage;
