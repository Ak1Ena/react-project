import { type FC, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Star, Trash2 } from 'lucide-react';
import type { Game } from '../../features/games/gamesAPI';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
  status?: string;
  onRemove?: () => void;
  removing?: boolean;
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

const GameCard: FC<GameCardProps> = ({ game, status = 'Playing', onRemove, removing }) => {
  const gradientClass = getGradientClass(game.name);

  const handleRemoveClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <div className={styles.gameCard}>
      <Link to={`/games/${game.id}`} className={`${styles.cardTop} ${gradientClass}`}>
        <div className={styles.statusBadge}>
          {status}
        </div>

        {onRemove && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={handleRemoveClick}
            disabled={removing}
            title="Remove from list"
          >
            {removing ? <Loader2 size={14} className={styles.removeSpin} /> : <Trash2 size={14} />}
          </button>
        )}

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
