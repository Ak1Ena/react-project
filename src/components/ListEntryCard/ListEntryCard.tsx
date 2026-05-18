import { type FC, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Trash2, Edit3, MoveRight, Save, Trophy, Clock, Calendar } from 'lucide-react';
import type { Game } from '../../features/games/gamesAPI';
import type { ListEntry, ListStatus } from '../../features/lists/listsAPI';
import { removeFromList, updateListEntry } from '../../features/lists/listsSlice';
import type { AppDispatch } from '../../app/store';
import { openModal } from '../../features/ui/uiSlice';
import styles from './ListEntryCard.module.css';
import { RootState } from '../../app/store';
import { fetchGameAchievements } from '../../features/steam/steamSlice';

interface ListEntryCardProps {
  entry: ListEntry;
  game?: Game;
}

const ListEntryCard: FC<ListEntryCardProps> = ({ entry, game: initialGame }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { steamId, achievements, ownedGames } = useSelector((state: RootState) => state.steam);
  
  const [game, setGame] = useState<Game | undefined>(initialGame);
  const [isLocalLoading, setIsLocalLoading] = useState(!initialGame);
  
  // Try to find stats in the global state if not in entry (fallback for old entries)
  const steamStatsFallback = ownedGames.find(og => og.appid.toString() === entry.gameId);
  const displayPlaytime = entry.playtime ?? steamStatsFallback?.playtime_forever;
  const displayLastPlayed = entry.lastPlayed ?? (steamStatsFallback as any)?.rtime_last_played;

  const [hoverRating, setHoverRating] = useState(0);
  const [reviewInput, setReviewInput] = useState(entry.review || '');
  const [isEditingReview, setIsEditingReview] = useState(!entry.review);

  // Fetch game details if not provided
  useEffect(() => {
    if (!initialGame && entry.gameId) {
      const fetchLocalGame = async () => {
        try {
          const { fetchGameById } = await import('../../features/games/gamesAPI');
          const data = await fetchGameById(entry.gameId);
          setGame(data);
        } catch (error) {
          console.error('Failed to fetch game for list entry', error);
        } finally {
          setIsLocalLoading(false);
        }
      };
      fetchLocalGame();
    } else {
      setGame(initialGame);
      setIsLocalLoading(false);
    }
  }, [initialGame, entry.gameId]);

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

  const gameAchievements = game ? achievements[game.id || entry.gameId] : null;

  useEffect(() => {
    if (steamId && (game?.id || entry.gameId)) {
      dispatch(fetchGameAchievements({ steamId, appId: game?.id || entry.gameId }));
    }
  }, [steamId, game?.id, entry.gameId, dispatch]);

  if (isLocalLoading) {
    return <div className={`${styles.listEntryCard} ${styles.skeleton}`}>Loading game info...</div>;
  }

  if (!game) {
    return (
      <div className={styles.listEntryCard}>
        <div className={styles.listEntryContent}>
          <h3>Unknown Game (ID: {entry.gameId})</h3>
          <button onClick={handleRemove} className={styles.removeBtn}>Remove</button>
        </div>
      </div>
    );
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

        {(gameAchievements || displayPlaytime !== undefined || displayLastPlayed) && (
          <div className={styles.steamStats}>
            {gameAchievements && gameAchievements.total > 0 && (
              <div className={styles.achievementSection}>
                <div className={styles.achievementHeader}>
                  <div className={styles.statItem}>
                    <Trophy size={14} className={styles.trophyIcon} />
                    <span>Achievements</span>
                  </div>
                  <span>{gameAchievements.achieved} / {gameAchievements.total}</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${(gameAchievements.achieved / gameAchievements.total) * 100}%` }}
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
 GetComponent:
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
};

export default ListEntryCard;
