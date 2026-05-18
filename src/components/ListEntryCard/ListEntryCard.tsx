import { type FC, useState, useEffect, useMemo, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Trash2, Edit3, MoveRight, Save, Trophy, Clock, Calendar } from 'lucide-react';
import type { Game } from '../../features/games/gamesAPI';
import type { ListEntry, ListStatus } from '../../features/lists/listsAPI';
import { removeFromList, updateListEntry } from '../../features/lists/listsSlice';
import type { AppDispatch, RootState } from '../../app/store';
import { openModal } from '../../features/ui/uiSlice';
import styles from './ListEntryCard.module.css';
import { fetchGameAchievements } from '../../features/steam/steamSlice';

interface ListEntryCardProps {
  entry: ListEntry;
  game?: Game;
}

const ListEntryCard: FC<ListEntryCardProps> = memo(({ entry, game }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Granular selectors to prevent unnecessary re-renders
  const steamId = useSelector((state: RootState) => (state as any).steam?.steamId);
  const achievements = useSelector((state: RootState) => (state as any).steam?.achievements[game?.id || entry.gameId]);
  const ownedGames = useSelector((state: RootState) => (state as any).steam?.ownedGames);
  
  // Memoize fallback stats
  const steamStatsFallback = useMemo(() => {
    if (!Array.isArray(ownedGames)) return null;
    return ownedGames.find((og: any) => og.appid.toString() === entry.gameId);
  }, [ownedGames, entry.gameId]);

  const displayPlaytime = entry.playtime ?? steamStatsFallback?.playtime_forever;
  const displayLastPlayed = entry.lastPlayed ?? (steamStatsFallback as any)?.rtime_last_played;

  const [hoverRating, setHoverRating] = useState(0);
  const [reviewInput, setReviewInput] = useState(entry.review || '');
  const [isEditingReview, setIsEditingReview] = useState(!entry.review);

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this game from your list?')) {
      dispatch(removeFromList(entry.id));
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(updateListEntry({ id: entry.id, entry: { status: e.target.value as ListStatus } }));
  };

  const handleRatingChange = (newRating: number) => {
    dispatch(updateListEntry({ id: entry.id, entry: { personalRating: newRating } }));
  };

  const handleEditNotes = () => {
    if (game) {
      dispatch(openModal({ type: 'EDIT_ENTRY', data: { entry, game } }));
    }
  };

  const handlePostReview = () => {
    if (reviewInput?.trim()) {
      dispatch(updateListEntry({ id: entry.id, entry: { review: reviewInput } }));
      setIsEditingReview(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have a steamId and haven't fetched these achievements yet
    if (steamId && (game?.id || entry.gameId) && !achievements) {
      dispatch(fetchGameAchievements({ steamId, appId: game?.id || entry.gameId }));
    }
  }, [steamId, game?.id, entry.gameId, achievements, dispatch]);

  if (!game) {
    return;
  }

  return (
    <div className={styles.listEntryCard}>
      <div className={styles.listEntryImage}>
        <img src={game.image} alt={game.name} />
      </div>
      <div className={styles.listEntryContent}>
        <div className={styles.listEntryHeader}>
          <h3>{game.name}</h3>
          <div className={styles.listEntryActions}>
            <button onClick={handleEditNotes} title="Edit Notes/Rating">
              <Edit3 size={18} />
            </button>
            <button onClick={handleRemove} className={styles.removeBtn} title="Remove from list">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        <div className={styles.listEntryMeta}>
          <div className={styles.listEntryStatusSelect}>
            <MoveRight size={14} />
            <select value={entry.status} onChange={handleStatusChange}>
              <option value="playing">Playing</option>
              <option value="completed">Completed</option>
              <option value="backlog">Backlog</option>
              <option value="wishlist">Wishlist</option>
            </select>
          </div>
          <div className={styles.listEntryStarRating}>
            {[...Array(10)].map((_, index) => {
              const starValue = index + 1;
              return (
                <button
                  key={index}
                  type="button"
                  className={styles.starButton}
                  onClick={() => handleRatingChange(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  title={`Rate ${starValue}/10`}
                >
                  <Star 
                    size={16} 
                    fill={(hoverRating || entry.personalRating) >= starValue ? "#f59e0b" : "none"}
                    color={(hoverRating || entry.personalRating) >= starValue ? "#f59e0b" : "var(--text-secondary)"}
                  />
                </button>
              );
            })}
            <span className={styles.ratingText}>{entry.personalRating || 0}/10</span>
          </div>
        </div>

        {(achievements || displayPlaytime !== undefined || displayLastPlayed) && (
          <div className={styles.steamStats}>
            {achievements && achievements.total > 0 && (
              <div className={styles.achievementSection}>
                <div className={styles.achievementHeader}>
                  <div className={styles.statItem}>
                    <Trophy size={14} className={styles.trophyIcon} />
                    <span>Achievements</span>
                  </div>
                  <span>{achievements.achieved} / {achievements.total}</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${(achievements.achieved / achievements.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className={styles.statItem}>
              {displayPlaytime !== undefined && (
                <div className={styles.statBadge} title="Total Playtime">
                  <Clock size={14} className={styles.clockIcon} />
                  <span>{Math.round(displayPlaytime / 60)}h</span>
                </div>
              )}

              {displayLastPlayed && (
                <div className={styles.statBadge} title="Last Played">
                  <Calendar size={14} className={styles.clockIcon} />
                  <span>{new Date(displayLastPlayed * 1000).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.listEntryDetails}>
          {entry.notes && (
            <p className={styles.listEntryNotes}>
              <strong>Notes:</strong> {entry.notes}
            </p>
          )}
          
          <div className={styles.listEntryReviewSection}>
            {isEditingReview ? (
              <div className={styles.reviewInputWrapper}>
                <textarea 
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  placeholder="Write a review..."
                  className={styles.inlineReviewTextarea}
                  rows={3}
                />
                <button 
                  onClick={handlePostReview} 
                  className={styles.postReviewBtn}
                  disabled={!reviewInput?.trim()}
                >
                  <Save size={14} />
                  Post Review
                </button>
              </div>
            ) : (
              <div className={styles.listEntryReview}>
                <div className={styles.reviewBlockHeader}>
                <h4>Review:</h4>
                <button onClick={() => setIsEditingReview(true)} className={styles.editReviewInlineBtn}>
                  <Edit3 size={12} />
                </button>
              </div>
              <p>{entry.review}</p>
            </div>
            )}
          </div>
        </div>
        
        <div className={styles.listEntryDate}>
          Added on {new Date(entry.dateAdded).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
});

export default ListEntryCard;