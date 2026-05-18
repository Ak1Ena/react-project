import { useState, type FC, type FormEvent } from 'react';
import { X, Star } from 'lucide-react';
import { useUpdateListEntryMutation } from '../../features/api/gameApi';
import type { Game } from '../../features/games/gamesAPI';
import type { ListEntry } from '../../features/lists/listsAPI';
import { useUI } from '../../context/useUI';

interface EditEntryData {
  entry: ListEntry;
  game: Game;
}
import styles from './Modal.module.css';

const Modal: FC = () => {
  const { modalOpen, modalType, modalData, closeModal } = useUI();

  if (!modalOpen) return null;

  const handleClose = () => {
    closeModal();
  };

  const renderContent = () => {
    switch (modalType) {
      case 'EDIT_ENTRY':
        return <EditEntryForm data={modalData as EditEntryData} onClose={handleClose} />;
      default:
        return <div>Unknown modal type</div>;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={handleClose}>
          <X size={24} />
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

const EditEntryForm: FC<{ data: EditEntryData; onClose: () => void }> = ({ data, onClose }) => {
  const [updateListEntry] = useUpdateListEntryMutation();
  const [notes, setNotes] = useState(data.entry.notes || '');
  const [rating, setRating] = useState(data.entry.personalRating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateListEntry({
      id: data.entry.id,
      entry: { notes, personalRating: Number(rating) },
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editEntryForm}>
      <h2>Edit Entry: {data.game.name}</h2>
      <div className={styles.formGroup}>
        <label>Personal Rating ({rating}/10)</label>
        <div className={styles.starRating}>
          {[...Array(10)].map((_, index) => {
            const starValue = index + 1;
            return (
              <button
                key={index}
                type="button"
                className={styles.starButton}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star 
                  size={24} 
                  fill={(hoverRating || rating) >= starValue ? "#f59e0b" : "none"}
                  color={(hoverRating || rating) >= starValue ? "#f59e0b" : "var(--text-secondary)"}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div className={styles.formGroup}>
        <label>Notes</label>
        <textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Personal notes..."
          rows={3}
        />
      </div>
      <div className={styles.formActions}>
        <button type="button" onClick={onClose} className={styles.btnSecondary}>Cancel</button>
        <button type="submit" className={styles.btnPrimary}>Save Changes</button>
      </div>
    </form>
  );
};

export default Modal;
