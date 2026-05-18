import { useEffect, useState, type FC } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ArrowLeft, Check, Gamepad2, Clock, Send, Loader2 } from 'lucide-react';
import { useUI } from '../context/UIContext';
import type { RootState, AppDispatch } from '../app/store';
import { fetchGameById, clearSelectedGame } from '../features/games/gamesSlice';
import {
  addToList,
  fetchListEntries,
  updateListEntry,
  fetchGameReviews,
  selectCommunityReviewsForGame,
} from '../features/lists/listsSlice';
import { fetchAllUsers } from '../features/auth/authSlice';
import type { ListStatus } from '../features/lists/listsAPI';
import styles from './GameDetailPage.module.css';

const GameDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useUI();
  const { selectedGame: game, status } = useSelector((state: RootState) => state.games);
  const { entries } = useSelector((state: RootState) => state.lists);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const allUsers = useSelector((state: RootState) => state.auth.users);
  const communityReviews = useSelector((state: RootState) =>
    selectCommunityReviewsForGame(state, id)
  );
  
  const existingEntry = entries.find((e) => e.gameId === game?.id);

  const displayRating = existingEntry?.personalRating || 0;
  const [localReview, setLocalReview] = useState('');
  const [reviewSending, setReviewSending] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ListStatus | null>(null);
  const [pendingRating, setPendingRating] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchGameById(id));
      dispatch(fetchListEntries());
      dispatch(fetchGameReviews(id));
      dispatch(fetchAllUsers());
    }
    return () => {
      dispatch(clearSelectedGame());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (existingEntry) {
      setLocalReview(existingEntry.review || '');
    }
  }, [existingEntry?.id, existingEntry?.review]);

  if (status === 'loading' || !game) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const handleStatusChange = async (newStatus: ListStatus) => {
    if (!currentUser || pendingStatus) return;
    setPendingStatus(newStatus);
    try {
      if (existingEntry) {
        await dispatch(updateListEntry({ id: existingEntry.id, entry: { status: newStatus } })).unwrap();
      } else {
        await dispatch(addToList({
          gameId: game.id,
          userId: currentUser.id,
          status: newStatus,
          notes: '',
          review: '',
          personalRating: 0,
        })).unwrap();
      }
    } catch {
      showToast('Failed to update status. Try again.', 'error');
    } finally {
      setPendingStatus(null);
    }
  };

  const handleRatingChange = async (rating: number) => {
    if (!existingEntry || pendingRating !== null) return;
    setPendingRating(rating);
    try {
      await dispatch(updateListEntry({ id: existingEntry.id, entry: { personalRating: rating } })).unwrap();
    } catch {
      showToast('Failed to save rating. Try again.', 'error');
    } finally {
      setPendingRating(null);
    }
  };

  const handleSaveReview = async () => {
    if (!existingEntry || reviewSending) return;
    const trimmed = localReview.trim();
    if (!trimmed) {
      showToast('Please write something before sending your review.', 'error');
      return;
    }
    setReviewSending(true);
    try {
      await dispatch(updateListEntry({ id: existingEntry.id, entry: { review: trimmed } })).unwrap();
      showToast('Review sent!', 'success');
    } catch {
      showToast('Failed to send review. Try again.', 'error');
    } finally {
      setReviewSending(false);
    }
  };

  const reviewDirty = !!existingEntry && localReview.trim() !== (existingEntry.review || '').trim();

  const usernameById = (userId: string) => {
    if (currentUser && userId === currentUser.id) return currentUser.username;
    const u = allUsers.find((x) => x.id === userId);
    return u ? u.username : 'Anonymous';
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };


  const statuses: { id: ListStatus; label: string; icon: ReactNode }[] = [
    { id: 'playing', label: 'Playing', icon: <Gamepad2 size={16} /> },
    { id: 'completed', label: 'Completed', icon: <Check size={16} /> },
    { id: 'backlog', label: 'Backlog', icon: <Clock size={16} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Star size={16} /> },
  ];

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back to Library</span>
        </button>
      </header>

      <div className={styles.mainLayout}>
        <div className={styles.leftCol}>
          <div className={styles.heroCard}>
            {game.image && <img src={game.image} alt={game.name} className={styles.heroImage} />}
            <div className={styles.patternOverlay}></div>
            <h2 className={styles.heroTitle}>{game.name}</h2>
          </div>

          <div className={styles.trackSection}>
            <h3 className={styles.sectionTitle}>TRACK IN</h3>
            <div className={styles.statusList}>
              {statuses.map(s => {
                const isActive = existingEntry?.status === s.id;
                const isPending = pendingStatus === s.id;
                return (
                  <button
                    key={s.id}
                    className={isActive ? `${styles.statusItem} ${styles.active}` : styles.statusItem}
                    onClick={() => handleStatusChange(s.id)}
                    disabled={pendingStatus !== null}
                  >
                    {s.icon}
                    <span>{s.label}</span>
                    {isPending ? (
                      <Loader2 size={14} className={`${styles.checkIcon} ${styles.spin}`} />
                    ) : (
                      isActive && <Check size={14} className={styles.checkIcon} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <header className={styles.detailHeader}>
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

          {existingEntry ? (
            <>
              <div className={styles.ratingSection}>
                <h3 className={styles.inputLabel}>
                  YOUR RATING
                  {pendingRating !== null && (
                    <Loader2 size={12} className={styles.spinInline} />
                  )}
                </h3>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={20}
                      fill={displayRating >= s ? "var(--primary)" : "none"}
                      color={displayRating >= s ? "var(--primary)" : "var(--text-muted)"}
                      onClick={() => handleRatingChange(s)}
                      style={{
                        cursor: pendingRating !== null ? 'wait' : 'pointer',
                        opacity: pendingRating !== null ? 0.6 : 1,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.reviewSection}>
                <h3 className={styles.inputLabel}>YOUR REVIEW</h3>
                <div className={styles.reviewWrapper}>
                  <textarea
                    className={styles.reviewArea}
                    placeholder="Jot down a thought about this one..."
                    value={localReview}
                    onChange={(e) => setLocalReview(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.saveReviewBtn}
                    onClick={handleSaveReview}
                    disabled={reviewSending || !reviewDirty || !localReview.trim()}
                  >
                    {reviewSending ? (
                      <Loader2 size={14} className={styles.spin} />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>
                      {reviewSending
                        ? 'Sending...'
                        : existingEntry.review ? 'Update Review' : 'Send Review'}
                    </span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.trackPrompt}>
              <p>Select a status on the left to start tracking this game, rate it, and write a review.</p>
            </div>
          )}

          <div className={styles.platformsSection}>
            <h3 className={styles.inputLabel}>PLATFORMS</h3>
            <div className={styles.platforms}>
              {game.platforms.map(platform => (
                <span key={platform} className={styles.platformBadge}>{platform}</span>
              ))}
            </div>
          </div>

          <div className={styles.commentsSection}>
            <h3 className={styles.inputLabel}>
              COMMUNITY COMMENTS <span className={styles.commentCount}>({communityReviews.length})</span>
            </h3>
            {communityReviews.length === 0 ? (
              <p className={styles.emptyComments}>
                No comments from other players yet. Be the first to share your thoughts above!
              </p>
            ) : (
              <ul className={styles.commentsList}>
                {communityReviews.map((c) => {
                  const username = usernameById(c.userId);
                  const initials = username.substring(0, 2).toUpperCase();
                  const isMine = !!currentUser && c.userId === currentUser.id;
                  return (
                    <li key={c.id} className={styles.commentItem}>
                      <div className={styles.commentAvatar}>{initials}</div>
                      <div className={styles.commentBody}>
                        <div className={styles.commentHeader}>
                          <span className={styles.commentAuthor}>{username}</span>
                          {isMine && <span className={styles.commentYouBadge}>You</span>}
                          {c.personalRating > 0 && (
                            <span className={styles.commentRating}>
                              <Star size={12} fill="var(--primary)" color="var(--primary)" />
                              {c.personalRating}/5
                            </span>
                          )}
                          <span className={styles.commentDate}>{formatDate(c.dateAdded)}</span>
                        </div>
                        <p className={styles.commentText}>{c.review}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;
