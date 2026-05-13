import { useState, type FC, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import type { RootState, AppDispatch } from '../../app/store';
import { closeModal } from '../../features/ui/uiSlice';
import { updateListEntry } from '../../features/lists/listsSlice';
import type { Game } from '../../features/games/gamesAPI';
import type { ListEntry } from '../../features/lists/listsAPI';

interface EditEntryData {
  entry: ListEntry;
  game: Game;
}
import styles from './Modal.module.css';

const Modal: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { modalOpen, modalType, modalData } = useSelector((state: RootState) => state.ui);

  if (!modalOpen) return null;

  const handleClose = () => {
    dispatch(closeModal());
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
  const dispatch = useDispatch<AppDispatch>();
  const [notes, setNotes] = useState(data.entry.notes || '');
  const [review, setReview] = useState(data.entry.review || '');
  const [rating, setRating] = useState(data.entry.personalRating || 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(updateListEntry({ 
      id: data.entry.id, 
      entry: { notes, review, personalRating: Number(rating) } 
    }));
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editEntryForm}>
      <h2>Edit Entry: {data.game.name}</h2>
      <div className={styles.formGroup}>
        <label>Personal Rating (0-10)</label>
        <input 
          type="number" 
          min="0" 
          max="10" 
          step="0.5"
          value={rating} 
          onChange={(e) => setRating(Number(e.target.value))} 
        />
      </div>
      <div className={styles.formGroup}>
        <label>Notes</label>
        <textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Personal notes..."
          rows={2}
        />
      </div>
      <div className={styles.formGroup}>
        <label>Review</label>
        <textarea 
          value={review} 
          onChange={(e) => setReview(e.target.value)}
          placeholder="What did you think of the game?"
          rows={4}
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
