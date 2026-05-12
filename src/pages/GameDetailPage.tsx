import { useEffect, useState, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Calendar, Monitor, ChevronLeft, Plus, Check } from 'lucide-react';
import type { RootState, AppDispatch } from '../app/store';
import { fetchGameById, clearSelectedGame } from '../features/games/gamesSlice';
import { addToList, fetchListEntries } from '../features/lists/listsSlice';
import type { ListStatus } from '../features/lists/listsAPI';
import { showToast } from '../features/ui/uiSlice';

const GameDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedGame: game, status } = useSelector((state: RootState) => state.games);
  const { entries } = useSelector((state: RootState) => state.lists);
  
  const [selectedStatus, setSelectedStatus] = useState<ListStatus>('backlog');

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
    return <div className="loading">Loading game details...</div>;
  }

  const existingEntry = entries.find((e) => e.gameId === game.id);

  const handleAddToList = () => {
    dispatch(addToList({
      gameId: game.id,
      status: selectedStatus,
      notes: '',
      personalRating: 0,
    })).then(() => {
      dispatch(showToast({ message: `${game.title} added to your ${selectedStatus} list!`, type: 'success' }));
    });
  };

  return (
    <div className="game-detail-page">
      <button onClick={() => navigate(-1)} className="back-button">
        <ChevronLeft size={20} />
        Back
      </button>

      <div className="game-detail-container">
        <div className="game-detail-header">
          <div className="game-detail-cover">
            <img src={game.coverImage} alt={game.title} />
          </div>
          <div className="game-detail-info">
            <h1>{game.title}</h1>
            <div className="game-detail-badges">
              <span className="badge-genre">{game.genre}</span>
              <div className="badge-rating">
                <Star size={16} fill="currentColor" />
                <span>{game.rating}</span>
              </div>
            </div>
            
            <div className="game-detail-meta">
              <div className="meta-item">
                <Monitor size={18} />
                <span>{game.platform}</span>
              </div>
              <div className="meta-item">
                <Calendar size={18} />
                <span>{game.releaseYear}</span>
              </div>
            </div>

            <div className="game-detail-actions">
              {existingEntry ? (
                <div className="already-in-list">
                  <Check size={20} />
                  <span>Already in your {existingEntry.status} list</span>
                  <button onClick={() => navigate(`/my-list/${existingEntry.status}`)} className="btn-link">
                    View in list
                  </button>
                </div>
              ) : (
                <div className="add-to-list-control">
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value as ListStatus)}
                    className="status-select"
                  >
                    <option value="playing">Playing</option>
                    <option value="completed">Completed</option>
                    <option value="backlog">Backlog</option>
                    <option value="wishlist">Wishlist</option>
                  </select>
                  <button onClick={handleAddToList} className="btn-primary">
                    <Plus size={20} />
                    Add to List
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="game-detail-body">
          <section className="game-description">
            <h2>Description</h2>
            <p>{game.description}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;
