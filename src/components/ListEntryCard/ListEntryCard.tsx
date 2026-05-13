import { type FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Star, Trash2, Edit3, MoveRight, Save, X } from 'lucide-react';
import type { Game } from '../../features/games/gamesAPI';
import type { ListEntry, ListStatus } from '../../features/lists/listsAPI';
import { removeFromList, updateListEntry } from '../../features/lists/listsSlice';
import type { AppDispatch } from '../../app/store';
import styles from './ListEntryCard.module.css';

interface ListEntryCardProps {
  entry: ListEntry;
  game: Game;
}

const ListEntryCard: FC<ListEntryCardProps> = ({ entry, game }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [hoverRating, setHoverRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [tempNotes, setTempNotes] = useState(entry.notes);
  const [tempReview, setTempReview] = useState(entry.review);

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

  const handleSave = () => {
    dispatch(updateListEntry({ 
      id: entry.id, 
      entry: { notes: tempNotes, review: tempReview } 
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempNotes(entry.notes);
    setTempReview(entry.review);
    setIsEditing(false);
  };

  return (
    <div className={styles.listEntryCard}>
      <div className={styles.listEntryImage}>
        <img src={game.image} alt={game.name} />
      </div>
      <div className={styles.listEntryContent}>
        <div className={styles.listEntryHeader}>
          <h3>{game.name}</h3>
          <div className={styles.listEntryActions}>
            {isEditing ? (
              <>
                <button onClick={handleSave} className={styles.saveBtn} title="Save Changes">
                  <Save size={18} />
                </button>
                <button onClick={handleCancel} className={styles.cancelBtn} title="Cancel">
                  <X size={18} />
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} title="Edit Notes/Review">
                <Edit3 size={18} />
              </button>
            )}
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

        <div className={styles.listEntryDetails}>
          {isEditing ? (
            <div className={styles.inlineEditFields}>
              <div className={styles.fieldGroup}>
                <label>Notes</label>
                <input 
                  value={tempNotes} 
                  onChange={(e) => setTempNotes(e.target.value)} 
                  placeholder="Personal notes..."
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Review</label>
                <textarea 
                  value={tempReview} 
                  onChange={(e) => setTempReview(e.target.value)} 
                  placeholder="Write your review..."
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <>
              {entry.notes && (
                <p className={styles.listEntryNotes}>
                  <strong>Notes:</strong> {entry.notes}
                </p>
              )}
              
              {entry.review && (
                <div className={styles.listEntryReview}>
                  <h4>Review:</h4>
                  <p>{entry.review}</p>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className={styles.listEntryDate}>
          Added on {new Date(entry.dateAdded).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default ListEntryCard;
