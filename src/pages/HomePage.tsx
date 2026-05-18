import { type FC } from 'react';
import { useSelector } from 'react-redux';
import { ChevronRight } from 'lucide-react';
import type { RootState } from '../app/store';
import { useGetGamesQuery, useGetListEntriesQuery } from '../features/api/gameApi';
import GameCard from '../components/GameCard/GameCard';
import Spinner from '../components/Spinner/Spinner';
import styles from './HomePage.module.css';

const HomePage: FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { data: games = [], isLoading: gamesLoading } = useGetGamesQuery();
  const { data: entries = [] } = useGetListEntriesQuery(currentUser?.id ?? '', {
    skip: !currentUser,
  });

  if (gamesLoading) {
    return <Spinner fullPage label="Loading games..." />;
  }

  const playingGames = games.filter((g) =>
    entries.some((e) => String(e.gameId) === String(g.id) && e.status === 'playing'),
  ).slice(0, 6);

  const heroGame = playingGames[0] || games[0];

  return (
    <div className={styles.dashboard}>
      {heroGame && (
        <div className={styles.hero}>
          {heroGame.image && (
            <img src={heroGame.image} alt={heroGame.name} className={styles.heroImage} />
          )}
          <div className={styles.heroContent}>
            <span className={styles.heroLabel}>
              {playingGames.length > 0 ? 'RESUME PLAYING' : 'FEATURED GAME'}
            </span>
            <h1 className={styles.heroTitle}>{heroGame.name}</h1>
            <p className={styles.heroMeta}>
              {heroGame.genre.join(' · ')} · {heroGame.releaseYear}
            </p>
          </div>
          <div className={styles.heroGradient}></div>
        </div>
      )}

      <div className={styles.fullWidthGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Continue playing <span className={styles.count}>/{playingGames.length}</span>
            </h2>
            <button className={styles.seeAll}>
              See all <ChevronRight size={16} />
            </button>
          </div>
          <div className={styles.gameRow}>
            {playingGames.length > 0 ? (
              playingGames.map((game) => (
                <GameCard key={game.id} game={game} status="Playing" />
              ))
            ) : (
              <p className={styles.emptyMessage}>
                You haven't marked any games as "Playing" yet. Explore the catalog to get started!
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
