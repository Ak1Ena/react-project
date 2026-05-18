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
  const { status, error, items } = useSelector((state: RootState) => state.games);
  const { searchQuery } = useSelector((state: RootState) => state.filters);
  const filteredGames = useSelector(selectFilteredGames);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on new search
    if (searchQuery.trim().length > 2) {
      const delayDebounceFn = setTimeout(() => {
        // Fetch a larger batch from Steam (50) to make pagination meaningful
        dispatch(searchGames(searchQuery));
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else if (searchQuery.trim().length === 0) {
      dispatch(fetchGames());
    }
  }, [dispatch, searchQuery]);

  // Pagination logic
  const totalGames = filteredGames.length;
  const totalPages = Math.ceil(totalGames / itemsPerPage);
  const paginatedGames = filteredGames.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={styles.pageBtn}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className={styles.pageNumbers}>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.active : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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
