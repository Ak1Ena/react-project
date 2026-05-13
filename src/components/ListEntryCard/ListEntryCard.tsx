import { type FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Star, Trash2, Edit3, MoveRight } from 'lucide-react';
import type { Game } from '../../features/games/gamesAPI';
import type { ListEntry, ListStatus } from '../../features/lists/listsAPI';
import { removeFromList, updateListEntry } from '../../features/lists/listsSlice';
import type { AppDispatch } from '../../app/store';
import { openModal } from '../../features/ui/uiSlice';
import styles from './ListEntryCard.module.css';

interface ListEntryCardProps {
  entry: ListEntry;
  game: Game;
}

const ListEntryCard: FC<ListEntryCardProps> = ({ entry, game }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [hoverRating, setHoverRating] = useState(0);

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this game from your list?')) {
      dispatch(removeFromList(entry.id));
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(updateListEntry({ id: entry.id, entry: { status: e.target.value as ListStatus } }));
  };

  const handleEditNotes = () => {
    dispatch(openModal({ type: 'EDIT_ENTRY', data: { entry, game } }));
  };

  const handleRatingChange = (newRating: number) => {
    dispatch(updateListEntry({ id: entry.id, entry: { personalRating: newRating } }));
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
        
        <div className={styles.listEntryDate}>
          Added on {new Date(entry.dateAdded).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default ListEntryCard;
