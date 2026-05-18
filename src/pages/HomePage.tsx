import { useEffect, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight } from 'lucide-react';
import type { RootState, AppDispatch } from '../app/store';
import { fetchGames, selectGames } from '../features/games/gamesSlice';
import { fetchListEntries } from '../features/lists/listsSlice';
import GameCard from '../components/GameCard/GameCard';
import styles from './HomePage.module.css';

const HomePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const games = useSelector(selectGames);
  const { entries } = useSelector((state: RootState) => state.lists);

  useEffect(() => {
    dispatch(fetchGames());
    dispatch(fetchListEntries());
  }, [dispatch]);

  const playingGames = entries.length > 0 
    ? games.filter(g => entries.some(e => e.gameId === g.id && e.status === 'playing')).slice(0, 6)
    : games.slice(0, 6);

  const heroGame = playingGames[0] || games[0];

  return (
    <div className={styles.dashboard}>
      {heroGame && (
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroLabel}>RESUME PLAYING</span>
            <h1 className={styles.heroTitle}>{heroGame.name}</h1>
            <p className={styles.heroMeta}>{heroGame.genre.join(' · ')} · {heroGame.releaseYear}</p>
          </div>
          <div className={styles.heroGradient}></div>
        </div>
      )}

      <div className={styles.fullWidthGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Continue playing <span className={styles.count}>/{playingGames.length}</span></h2>
            <button className={styles.seeAll}>See all <ChevronRight size={16} /></button>
          </div>
          <div className={styles.gameRow}>
            {playingGames.map(game => (
              <GameCard key={game.id} game={game} status="Playing" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
