import { useEffect, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight, Trophy, Flame, CheckCircle2 } from 'lucide-react';
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

  const activities = [
    { id: 1, type: 'log', user: 'H', action: 'logged 2.5h in', target: games[0]?.name || 'Hollow Drift', time: '2h ago', color: 'var(--accent-purple)' },
    { id: 2, type: 'complete', user: 'P', action: 'completed Act 3 of', target: games[1]?.name || 'Petalfall', time: 'Today', color: 'var(--accent-red)' },
    { id: 3, type: 'wishlist', user: 'H', action: 'added Wishlist to', target: games[2]?.name || 'Hollow Drift: Echoes', time: 'Yesterday', color: 'var(--text-muted)' },
    { id: 4, type: 'rate', user: 'T', action: 'rated 4 ★', target: games[3]?.name || 'Tinkerfen', time: 'Yesterday', color: 'var(--accent-green)' },
  ];

  const completedCount = entries.filter(e => e.status === 'completed').length;

  const achievements = [
    { id: 1, title: 'First Hundred', desc: 'Tracked 100 hours', icon: <Trophy size={16} />, color: 'var(--accent-orange)' },
    { id: 2, title: 'On Fire', desc: '4-day streak', icon: <Flame size={16} />, color: 'var(--accent-red)' },
    { id: 3, title: 'Closer', desc: `${completedCount} games completed`, icon: <CheckCircle2 size={16} />, color: 'var(--accent-purple)' },
  ];

  return (
    <div className={styles.dashboard}>
      {heroGame && (
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroLabel}>RESUME PLAYING · 64% COMPLETE</span>
            <h1 className={styles.heroTitle}>{heroGame.name}</h1>
            <p className={styles.heroMeta}>{heroGame.genre[0]} · Action · 42h played</p>
          </div>
          <div className={styles.heroGradient}></div>
        </div>
      )}

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Continue playing <span className={styles.count}>/6</span></h2>
              <button className={styles.seeAll}>See all <ChevronRight size={16} /></button>
            </div>
            <div className={styles.gameRow}>
              {playingGames.map(game => (
                <GameCard key={game.id} game={game} status="Playing" />
              ))}
            </div>
          </section>
        </div>

        <div className={styles.rightCol}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Activity</h2>
            <div className={styles.activityList}>
              {activities.map(act => (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityAvatar} style={{ backgroundColor: act.color }}>{act.user}</div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>
                      You {act.action} <strong>{act.target}</strong>
                    </p>
                    <span className={styles.activityTime}>{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Achievements</h2>
            <div className={styles.achievementList}>
              {achievements.map(ach => (
                <div key={ach.id} className={styles.achievementItem}>
                  <div className={styles.achievementIcon} style={{ color: ach.color }}>
                    {ach.icon}
                  </div>
                  <div className={styles.achievementInfo}>
                    <h4 className={styles.achievementTitle}>{ach.title}</h4>
                    <p className={styles.achievementDesc}>{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
