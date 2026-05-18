import { useEffect, useRef, useCallback, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { 
  fetchGames, 
  searchGames, 
  selectSearchResults,
  selectMockApiGames,
  selectSteamFeaturedGames,
  selectCatalogPagination,
  selectSearchStatus,
  clearSearch
} from '../features/games/gamesSlice';
import GameGrid from '../components/GameGrid/GameGrid';
import FilterBar from '../components/FilterBar/FilterBar';
import styles from './HomePage.module.css';

const HomePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const searchResults = useSelector(selectSearchResults);
  const mockApiGames = useSelector(selectMockApiGames);
  const steamFeaturedGames = useSelector(selectSteamFeaturedGames);
  
  const status = useSelector((state: RootState) => state.games.status);
  const searchStatus = useSelector(selectSearchStatus);
  const error = useSelector((state: RootState) => state.games.error);
  const { searchQuery } = useSelector((state: RootState) => state.filters);
  const { limit, offset, hasMore } = useSelector(selectCatalogPagination);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (status === 'loading') return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        dispatch(fetchGames({ limit, offset }));
      }
    });
    
    if (node) observer.current.observe(node);
  }, [status, hasMore, dispatch, limit, offset]);

  // Initial fetch
  useEffect(() => {
    if (mockApiGames.length === 0 && steamFeaturedGames.length === 0 && status === 'idle') {
      dispatch(fetchGames({ limit: 48, offset: 0 }));
    }
  }, [dispatch, mockApiGames.length, steamFeaturedGames.length, status]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayDebounceFn = setTimeout(() => {
        dispatch(searchGames(searchQuery));
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else if (searchResults.length > 0) {
      dispatch(clearSearch());
    }
  }, [dispatch, searchQuery, searchResults.length]);

  return (
    <div className={styles.homePage}>
      <header className={styles.pageHeader}>
        <h1>Explore Games</h1>
        <p>Discover your next favorite game and add it to your collection.</p>
      </header>
      
      <FilterBar />
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.catalogContent}>
        {/* 1. Search Results Section */}
        {searchQuery.trim().length > 2 && (
          <section className={styles.section}>
            <h2>Steam Search Results</h2>
            <GameGrid games={searchResults} loading={searchStatus === 'loading'} />
            {searchStatus === 'succeeded' && searchResults.length === 0 && (
              <p className={styles.noResults}>No games found on Steam matching "{searchQuery}".</p>
            )}
            <hr className={styles.separator} />
          </section>
        )}

        {/* 2. MockAPI / Curated Collection Section */}
        {mockApiGames.length > 0 && (
          <section className={styles.section}>
            <h2>Curated Collection</h2>
            <GameGrid games={mockApiGames} />
            <hr className={styles.separator} />
          </section>
        )}

        {/* 3. Steam Featured Catalog Section */}
        <section className={styles.section}>
          <h2>Featured on Steam</h2>
          <GameGrid games={steamFeaturedGames} loading={status === 'loading' && steamFeaturedGames.length === 0} />
          
          {/* Intersection Observer Target */}
          <div ref={lastElementRef} className={styles.loaderTarget}>
            {status === 'loading' && (
              <div className={styles.loadingMore}>Loading more Steam games...</div>
            )}
            {!hasMore && steamFeaturedGames.length > 0 && (
              <div className={styles.endOfCatalog}>You've reached the end of the Steam featured list.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
