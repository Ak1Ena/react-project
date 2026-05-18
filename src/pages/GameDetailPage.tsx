import { useEffect, type FC, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, X, Check, Gamepad2, Clock } from 'lucide-react';
import type { RootState, AppDispatch } from '../app/store';
import { fetchGameById, clearSelectedGame } from '../features/games/gamesSlice';
import { addToList, fetchListEntries, updateListEntry } from '../features/lists/listsSlice';
import type { ListStatus } from '../features/lists/listsAPI';
import styles from './GameDetailPage.module.css';

const GameDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedGame: game, status } = useSelector((state: RootState) => state.games);
  const { entries } = useSelector((state: RootState) => state.lists);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const existingEntry = entries.find((e) => e.gameId === game?.id);

  // Use the Redux state as the source of truth
  const displayRating = existingEntry?.personalRating || 0;
  const displayReview = existingEntry?.review || '';

  useEffect(() => {
    if (id) {
      dispatch(fetchGameById(id));
      dispatch(fetchListEntries());
    }
    return () => {
      dispatch(clearSelectedGame());
    };
  }, [id, dispatch]);

  if (status === 'loading' || !game) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const handleStatusChange = (newStatus: ListStatus) => {
    if (!currentUser) return;
    if (existingEntry) {
      dispatch(updateListEntry({ id: existingEntry.id, entry: { status: newStatus } }));
    } else {
      dispatch(addToList({
        gameId: game.id,
        userId: currentUser.id,
        status: newStatus,
        notes: '',
        review: '',
        personalRating: 0,
      }));
    }
  };

  const statuses: { id: ListStatus; label: string; icon: JSX.Element }[] = [
    { id: 'playing', label: 'Playing', icon: <Gamepad2 size={16} /> },
    { id: 'completed', label: 'Completed', icon: <Check size={16} /> },
    { id: 'backlog', label: 'Backlog', icon: <Clock size={16} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Star size={16} /> },
  ];

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <button className={styles.closeBtn} onClick={() => navigate(-1)}>
          <X size={20} />
        </button>

        <div className={styles.leftCol}>
          <div className={styles.heroCard}>
            <div className={styles.patternOverlay}></div>
            <h2 className={styles.heroTitle}>{game.name}</h2>
          </div>

          <div className={styles.trackSection}>
            <h3 className={styles.sectionTitle}>TRACK IN</h3>
            <div className={styles.statusList}>
              {statuses.map(s => (
                <button 
                  key={s.id} 
                  className={existingEntry?.status === s.id ? `${styles.statusItem} ${styles.active}` : styles.statusItem}
                  onClick={() => handleStatusChange(s.id)}
                >
                  {s.icon}
                  <span>{s.label}</span>
                  {existingEntry?.status === s.id && <Check size={14} className={styles.checkIcon} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <header className={styles.header}>
            <h1 className={styles.title}>{game.name}</h1>
            <div className={styles.infoRow}>
              <span>{game.genre.join(' · ')}</span>
              <span className={styles.dot}>·</span>
              <span>{game.releaseYear}</span>
              <span className={styles.dot}>·</span>
              <div className={styles.commRating}>
                <Star size={14} fill="var(--primary)" color="var(--primary)" />
                <strong>{game.rating} community</strong>
              </div>
            </div>
          </header>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>STATUS</span>
              <span className={styles.statValue} style={{ color: existingEntry ? 'var(--primary)' : 'var(--text-muted)' }}>
                {existingEntry ? existingEntry.status.charAt(0).toUpperCase() + existingEntry.status.slice(1) : 'Not tracked'}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>GENRE</span>
              <span className={styles.statValue}>{game.genre[0]}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>RELEASE YEAR</span>
              <span className={styles.statValue}>{game.releaseYear}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>PLATFORMS</span>
              <span className={styles.statValue}>{game.platforms.length} platforms</span>
            </div>
          </div>

          <div className={styles.ratingSection}>
            <h3 className={styles.inputLabel}>YOUR RATING</h3>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star 
                  key={s} 
                  size={20} 
                  fill={displayRating >= s ? "var(--primary)" : "none"} 
                  color={displayRating >= s ? "var(--primary)" : "var(--text-muted)"}
                  onClick={() => {
                    if (existingEntry) {
                      dispatch(updateListEntry({ id: existingEntry.id, entry: { personalRating: s } }));
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>

          <div className={styles.reviewSection}>
            <h3 className={styles.inputLabel}>YOUR REVIEW</h3>
            <textarea 
              className={styles.reviewArea}
              placeholder="Jot down a thought about this one..."
              value={displayReview}
              onChange={(e) => {
                if (existingEntry) {
                  dispatch(updateListEntry({ id: existingEntry.id, entry: { review: e.target.value } }));
                }
              }}
            />
          </div>

          <div className={styles.platformsSection}>
            <h3 className={styles.inputLabel}>PLATFORMS</h3>
            <div className={styles.platforms}>
              <span className={styles.platformBadge}>PC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;
