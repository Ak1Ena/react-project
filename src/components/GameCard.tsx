import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Monitor } from 'lucide-react';
import type { Game } from '../features/games/gamesAPI';

interface GameCardProps {
  game: Game;
}

const GameCard: FC<GameCardProps> = ({ game }) => {
  return (
    <div className="game-card">
      <Link to={`/games/${game.id}`} className="game-card-image-link">
        <img src={game.coverImage} alt={game.title} className="game-card-image" />
        <div className="game-card-rating">
          <Star size={16} fill="currentColor" />
          <span>{game.rating}</span>
        </div>
      </Link>
      <div className="game-card-content">
        <h3 className="game-card-title">
          <Link to={`/games/${game.id}`}>{game.title}</Link>
        </h3>
        <div className="game-card-info">
          <span className="game-card-genre">{game.genre}</span>
        </div>
        <div className="game-card-details">
          <div className="game-card-detail">
            <Monitor size={14} />
            <span>{game.platform}</span>
          </div>
          <div className="game-card-detail">
            <Calendar size={14} />
            <span>{game.releaseYear}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
