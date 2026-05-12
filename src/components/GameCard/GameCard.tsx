import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Monitor } from 'lucide-react';
import type { Game } from '../../features/games/gamesAPI';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
}

const GameCard: FC<GameCardProps> = ({ game }) => {
  return (
    <div className={styles.gameCard}>
      <Link to={`/games/${game.id}`} className={styles.gameCardImageLink}>
        <img src={game.image} alt={game.name} className={styles.gameCardImage} />
        <div className={styles.gameCardRating}>
          <Star size={16} fill="currentColor" />
          <span>{game.rating}</span>
        </div>
      </Link>
      <div className={styles.gameCardContent}>
        <h3 className={styles.gameCardTitle}>
          <Link to={`/games/${game.id}`}>{game.name}</Link>
        </h3>
        <div className={styles.gameCardInfo}>
          <span className="badge-genre">{game.genre.join(', ')}</span>
        </div>
        <div className={styles.gameCardDetails}>
          <div className={styles.gameCardDetail}>
            <Monitor size={14} />
            <span>{game.platforms.join(', ')}</span>
          </div>
          <div className={styles.gameCardDetail}>
            <Calendar size={14} />
            <span>{game.releaseYear}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
