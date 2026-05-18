import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Game } from '../../features/games/gamesAPI';
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

  return (
    <div className={styles.gameCard}>
      <Link to={`/games/${game.id}`} className={`${styles.cardTop} ${gradientClass}`}>
        <div className={styles.statusBadge}>
          {status}
        </div>

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
