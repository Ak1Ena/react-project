import { useEffect, useState, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { RootState, AppDispatch } from '../app/store';
import { fetchGames, selectFilteredGames, searchGames } from '../features/games/gamesSlice';
import GameGrid from '../components/GameGrid/GameGrid';
import FilterBar from '../components/FilterBar/FilterBar';
import styles from './HomePage.module.css';

const HomePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.games);
  const { searchQuery } = useSelector((state: RootState) => state.filters);
  const filteredGames = useSelector(selectFilteredGames);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on new search
    if (searchQuery.trim().length > 2) {
      const delayDebounceFn = setTimeout(() => {
        dispatch(searchGames(searchQuery));
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else if (searchQuery.trim().length === 0) {
      dispatch(fetchGames());
    }
  }, [dispatch, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const paginatedGames = filteredGames.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.homePage}>
      <header className={styles.pageHeader}>
        <h1>Explore Games</h1>
        <p>Discover your next favorite game and add it to your collection.</p>
      </header>
      
      <FilterBar />
      
      {status === 'failed' && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.catalogContent}>
        <GameGrid games={paginatedGames} loading={status === 'loading'} />
        
        {totalPages > 1 && !status.includes('loading') && (
          <div className={styles.pagination}>
            <button 
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }}
              disabled={currentPage === 1}
              className={styles.pageBtn}
            >
              <ChevronLeft size={20} />
            </button>
            
            <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>

            <button 
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0); }}
              disabled={currentPage === totalPages}
              className={styles.pageBtn}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
