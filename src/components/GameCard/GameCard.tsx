import { type FC, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Heart } from 'lucide-react';
import type { Game } from '../../features/games/gamesAPI';
import type { RootState, AppDispatch } from '../../app/store';
import { addToList, updateListEntry } from '../../features/lists/listsSlice';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
  status?: string;
}

const getGradientClass = (name: string) => {
  const gradients = [
    styles.gradientPurple,
    styles.gradientRed,
    styles.gradientOrange,
    styles.gradientGreen,
    styles.gradientBlue,
    styles.gradientTeal,
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

const GameCard: FC<GameCardProps> = ({ game, status = 'Playing' }) => {
  const gradientClass = getGradientClass(game.name);
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const entries = useSelector((state: RootState) => state.lists.entries);

  const existingEntry = entries.find((e) => e.gameId === game.id);
  const isFavorited = !!existingEntry?.isFavorite;

  const handleFavoriteClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return;

    if (existingEntry) {
      dispatch(updateListEntry({
        id: existingEntry.id,
        entry: { isFavorite: !isFavorited },
      }));
    } else {
      dispatch(addToList({
        gameId: game.id,
        userId: currentUser.id,
        status: 'wishlist',
        notes: '',
        review: '',
        personalRating: 0,
        isFavorite: true,
      }));
    }
  };

  return (
    <div className={styles.gameCard}>
      <Link to={`/games/${game.id}`} className={`${styles.cardTop} ${gradientClass}`}>
        <div className={styles.statusBadge}>
          {status}
        </div>
        <button
          type="button"
          className={isFavorited ? `${styles.favoriteBtn} ${styles.favoriteBtnActive}` : styles.favoriteBtn}
          onClick={handleFavoriteClick}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorited}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={16}
            fill={isFavorited ? 'var(--accent-red)' : 'none'}
            color="var(--accent-red)"
          />
        </button>

        {game.image && <img src={game.image} alt={game.name} className={styles.cardImage} />}
        <div className={styles.patternOverlay}></div>

        <h3 className={styles.cardTitleOver}>{game.name}</h3>
      </Link>

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h4 className={styles.gameName}>{game.name}</h4>
        </div>
        <div className={styles.metaRow}>
          <span>{game.genre[0]}</span>
          <span className={styles.dot}>·</span>
          <span>{game.releaseYear}</span>
          <span className={styles.dot}>·</span>
          <div className={styles.rating}>
            <Star size={12} fill="var(--primary)" color="var(--primary)" />
            <span>{game.rating}</span>
          </div>
        </div>
        <div className={styles.platforms}>
          {game.platforms.map(p => (
            <span key={p} className={styles.platform}>{p}</span>
          ))}
        </div>
        <div className={styles.bottomLine}></div>
      </div>
    </div>
  );
};

export default GameCard;
