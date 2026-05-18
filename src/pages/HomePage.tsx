import { useEffect, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import {
  fetchGames,
  fetchFacets,
  setCurrentPage,
  selectSortedPageGames,
  selectTotal,
  selectCurrentPage,
  selectPageSize,
} from '../features/games/gamesSlice';
import GameGrid from '../components/GameGrid/GameGrid';
import FilterBar from '../components/FilterBar/FilterBar';
import Pagination from '../components/Pagination/Pagination';
import styles from './HomePage.module.css';

const HomePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.games);
  const filters = useSelector((state: RootState) => state.filters);
  const games = useSelector(selectSortedPageGames);
  const total = useSelector(selectTotal);
  const currentPage = useSelector(selectCurrentPage);
  const pageSize = useSelector(selectPageSize);

  useEffect(() => {
    dispatch(fetchFacets());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setCurrentPage(1));
  }, [
    dispatch,
    filters.searchQuery,
    filters.genre,
    filters.platform,
    filters.year,
    filters.minRating,
  ]);

  useEffect(() => {
    dispatch(
      fetchGames({
        page: currentPage,
        search: filters.searchQuery,
        genre: filters.genre,
        platform: filters.platform,
        year: filters.year,
        minRating: filters.minRating,
      })
    );
  }, [
    dispatch,
    currentPage,
    filters.searchQuery,
    filters.genre,
    filters.platform,
    filters.year,
    filters.minRating,
  ]);

  return (
    <div className={styles.homePage}>
      <header className={styles.pageHeader}>
        <h1>Explore Games</h1>
        <p>Discover your next favorite game and add it to your collection.</p>
      </header>

      <FilterBar />

      {status === 'failed' && <div className={styles.errorMessage}>{error}</div>}

      <GameGrid games={games} loading={status === 'loading'} />

      <Pagination
        currentPage={currentPage}
        total={total}
        pageSize={pageSize}
        onPageChange={(p) => dispatch(setCurrentPage(p))}
      />
    </div>
  );
};

export default HomePage;
