import { type FC } from 'react';
import { useDispatch } from 'react-redux';
import { Star, Trash2, Edit3, MoveRight } from 'lucide-react';
import type { Game } from '../features/games/gamesAPI';
import type { ListEntry, ListStatus } from '../features/lists/listsAPI';
import { removeFromList, updateListEntry } from '../features/lists/listsSlice';
import type { AppDispatch } from '../app/store';
import { openModal } from '../features/ui/uiSlice';

interface ListEntryCardProps {
  entry: ListEntry;
  game: Game;
}

const ListEntryCard: FC<ListEntryCardProps> = ({ entry, game }) => {
  const dispatch = useDispatch<AppDispatch>();

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

  return (
    <div className="list-entry-card">
      <div className="list-entry-image">
        <img src={game.coverImage} alt={game.title} />
      </div>
      <div className="list-entry-content">
        <div className="list-entry-header">
          <h3>{game.title}</h3>
          <div className="list-entry-actions">
            <button onClick={handleEditNotes} title="Edit Notes/Rating">
              <Edit3 size={18} />
            </button>
            <button onClick={handleRemove} className="remove-btn" title="Remove from list">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        <div className="list-entry-meta">
          <div className="list-entry-status-select">
            <MoveRight size={14} />
            <select value={entry.status} onChange={handleStatusChange}>
              <option value="playing">Playing</option>
              <option value="completed">Completed</option>
              <option value="backlog">Backlog</option>
              <option value="wishlist">Wishlist</option>
            </select>
          </div>
          <div className="list-entry-personal-rating">
            <Star size={14} fill={entry.personalRating > 0 ? "currentColor" : "none"} />
            <span>{entry.personalRating || 'No rating'}/10</span>
          </div>
        </div>

        {entry.notes && (
          <p className="list-entry-notes">
            {entry.notes}
          </p>
        )}
        
        <div className="list-entry-date">
          Added on {new Date(entry.dateAdded).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default ListEntryCard;
