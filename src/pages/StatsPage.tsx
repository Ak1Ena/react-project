import { useEffect, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trophy, Gamepad2, Clock, Heart, Star, TrendingUp, Target, BookMarked } from 'lucide-react';
import type { RootState, AppDispatch } from '../app/store';
import { fetchListEntries } from '../features/lists/listsSlice';
import { fetchGames } from '../features/games/gamesSlice';
import styles from './StatsPage.module.css';

const StatsPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const entries = useSelector((state: RootState) => state.lists.entries);
  const games = useSelector((state: RootState) => state.games.items);
  const listStatus = useSelector((state: RootState) => state.lists.status);
  const gamesStatus = useSelector((state: RootState) => state.games.status);

  useEffect(() => {
    if (listStatus === 'idle') dispatch(fetchListEntries());
    if (gamesStatus === 'idle') dispatch(fetchGames());
  }, [listStatus, gamesStatus, dispatch]);

  const playing   = entries.filter(e => e.status === 'playing').length;
  const completed = entries.filter(e => e.status === 'completed').length;
  const backlog   = entries.filter(e => e.status === 'backlog').length;
  const wishlist  = entries.filter(e => e.status === 'wishlist').length;
  const total     = entries.length;

  const ratedEntries = entries.filter(e => e.personalRating > 0);
  const avgRating = ratedEntries.length > 0
    ? (ratedEntries.reduce((sum, e) => sum + e.personalRating, 0) / ratedEntries.length).toFixed(1)
    : '—';

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const genreCounts: Record<string, number> = {};
  entries.forEach(entry => {
    const game = games.find(g => g.id === entry.gameId);
    if (game) {
      game.genre.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    }
  });
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  const favoriteGenre = sortedGenres[0]?.[0] ?? '—';
  const maxGenreCount = sortedGenres[0]?.[1] ?? 1;

  const listStats = [
    { label: 'Playing',   count: playing,   color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: Gamepad2 },
    { label: 'Completed', count: completed, color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  icon: Trophy   },
    { label: 'Backlog',   count: backlog,   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Clock    },
    { label: 'Wishlist',  count: wishlist,  color: '#ec4899', bg: 'rgba(236,72,153,0.12)',  icon: Heart    },
  ];

  if ((listStatus === 'loading' || gamesStatus === 'loading') && total === 0) {
    return <div className={styles.loading}>Loading your stats...</div>;
  }

  return (
    <div className={styles.statsPage}>
      <header className={styles.pageHeader}>
        <h1>My Stats</h1>
        <p>A summary of your gaming journey</p>
      </header>

      {/* Overview */}
      <div className={styles.overviewGrid}>
        <div className={`${styles.overviewCard} ${styles.highlighted}`}>
          <div className={styles.overviewIcon}><Target size={26} /></div>
          <div className={styles.overviewValue}>{total}</div>
          <div className={styles.overviewLabel}>Total Games Tracked</div>
        </div>
        <div className={styles.overviewCard}>
          <div className={styles.overviewIcon}><Star size={22} /></div>
          <div className={styles.overviewValue}>{avgRating}</div>
          <div className={styles.overviewLabel}>Avg Personal Rating</div>
        </div>
        <div className={styles.overviewCard}>
          <div className={styles.overviewIcon}><TrendingUp size={22} /></div>
          <div className={styles.overviewValue}>{completionRate}%</div>
          <div className={styles.overviewLabel}>Completion Rate</div>
        </div>
        <div className={styles.overviewCard}>
          <div className={styles.overviewIcon}><BookMarked size={22} /></div>
          <div className={styles.overviewValue} title={favoriteGenre}>{favoriteGenre}</div>
          <div className={styles.overviewLabel}>Favorite Genre</div>
        </div>
      </div>

      {/* Games per list */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Games per List</h2>
        <div className={styles.listGrid}>
          {listStats.map(({ label, count, color, bg, icon: Icon }) => (
            <div key={label} className={styles.listCard}>
              <div className={styles.listCardTop}>
                <div className={styles.listCardIcon} style={{ background: bg, color }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className={styles.listCardCount}>{count}</div>
                  <div className={styles.listCardLabel}>{label}</div>
                </div>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: total > 0 ? `${(count / total) * 100}%` : '0%',
                    background: color,
                  }}
                />
              </div>
              <div className={styles.progressLabel}>
                {total > 0 ? Math.round((count / total) * 100) : 0}% of library
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Genre breakdown */}
      {sortedGenres.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Genre Breakdown</h2>
          <div className={styles.genreList}>
            {sortedGenres.map(([genre, count]) => (
              <div key={genre} className={styles.genreRow}>
                <span className={styles.genreName}>{genre}</span>
                <div className={styles.genreBarTrack}>
                  <div
                    className={styles.genreBarFill}
                    style={{ width: `${(count / maxGenreCount) * 100}%` }}
                  />
                </div>
                <span className={styles.genreCount}>{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {total === 0 && (
        <div className={styles.emptyState}>
          <Gamepad2 size={48} />
          <h3>No games tracked yet</h3>
          <p>Add games to your lists to see your stats here.</p>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
