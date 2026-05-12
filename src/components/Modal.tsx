import { useState, type FC, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import type { RootState, AppDispatch } from '../app/store';
import { closeModal } from '../features/ui/uiSlice';
import { updateListEntry } from '../features/lists/listsSlice';

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
        return <EditEntryForm data={modalData} onClose={handleClose} />;
      default:
        return <div>Unknown modal type</div>;
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          <X size={24} />
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

const EditEntryForm: FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [notes, setNotes] = useState(data.entry.notes || '');
  const [rating, setRating] = useState(data.entry.personalRating || 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(updateListEntry({ 
      id: data.entry.id, 
      entry: { notes, personalRating: Number(rating) } 
    }));
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="edit-entry-form">
      <h2>Edit Entry: {data.game.title}</h2>
      <div className="form-group">
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
      <div className="form-group">
        <label>Notes</label>
        <textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you think of the game?"
          rows={4}
        />
      </div>
      <div className="form-actions">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Save Changes</button>
      </div>
    </form>
  );
};

export default Modal;
