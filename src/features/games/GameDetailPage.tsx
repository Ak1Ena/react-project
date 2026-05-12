import { useEffect, useState, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Calendar, Monitor, ChevronLeft, Plus, Check } from 'lucide-react';
import type { RootState, AppDispatch } from '../../app/store';
import { fetchGameById, clearSelectedGame } from './gamesSlice';
import { addToList, fetchListEntries } from '../lists/listsSlice';
import type { ListStatus } from '../lists/listsAPI';
import { showToast } from '../ui/uiSlice';
import { selectCurrentUser } from '../auth/authSlice';
import styles from './GameDetailPage.module.css';

const GameDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedGame: game, status } = useSelector((state: RootState) => state.games);
  const { entries } = useSelector((state: RootState) => state.lists);
  const currentUser = useSelector(selectCurrentUser);
  
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

  if (status === 'failed') {
    return <div className={styles.errorMessage}>Failed to load game details.</div>;
  }

  if (status === 'loading' || !game) {
    return <div className={styles.loading}>Loading game details...</div>;
  }

  const existingEntry = entries.find((e) => e.gameId === game.id);

  const handleAddToList = () => {
    if (!currentUser) {
      dispatch(showToast({ message: 'Please log in to add games to your list.', type: 'error' }));
      return;
    }

    dispatch(addToList({
      gameId: game.id,
      userId: currentUser.id,
      status: selectedStatus,
      notes: '',
      personalRating: 0,
    })).then(() => {
      dispatch(showToast({ message: `${game.name} added to your ${selectedStatus} list!`, type: 'success' }));
    });
  };

  return (
    <div className={styles.gameDetailPage}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <ChevronLeft size={20} />
        Back
      </button>

      <div className={styles.gameDetailContainer}>
        <div className={styles.gameDetailHeader}>
          <div className={styles.gameDetailCover}>
            <img src={game.image} alt={game.name} />
          </div>
          <div className={styles.gameDetailInfo}>
            <h1>{game.name}</h1>
            <div className={styles.gameDetailBadges}>
              <span className={styles.badgeGenre}>{game.genre.join(', ')}</span>
              <div className={styles.badgeRating}>
                <Star size={16} fill="currentColor" />
                <span>{game.rating}</span>
              </div>
            </div>
            
            <div className={styles.gameDetailMeta}>
              <div className={styles.metaItem}>
                <Monitor size={18} />
                <span>{game.platforms.join(', ')}</span>
              </div>
              <div className={styles.metaItem}>
                <Calendar size={18} />
                <span>{game.releaseYear}</span>
              </div>
            </div>

            <div className={styles.gameDetailActions}>
              {existingEntry ? (
                <div className={styles.alreadyInList}>
                  <Check size={20} />
                  <span>Already in your {existingEntry.status} list</span>
                  <button onClick={() => navigate(`/my-list/${existingEntry.status}`)} className={styles.btnLink}>
                    View in list
                  </button>
                </div>
              ) : (
                <div className={styles.addToListControl}>
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value as ListStatus)}
                    className={styles.statusSelect}
                  >
                    <option value="playing">Playing</option>
                    <option value="completed">Completed</option>
                    <option value="backlog">Backlog</option>
                    <option value="wishlist">Wishlist</option>
                  </select>
                  <button onClick={handleAddToList} className={styles.btnPrimary}>
                    <Plus size={20} />
                    Add to List
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.gameDetailBody}>
          <section className={styles.gameDescription}>
            <h2>Description</h2>
            <p>{game.description}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;
