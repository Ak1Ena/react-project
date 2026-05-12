import { type FC } from 'react';
import GameCard from '../GameCard/GameCard';
import type { Game } from '../../features/games/gamesAPI';

interface GameGridProps {
  games: Game[];
  loading?: boolean;
}

const GameGrid: FC<GameGridProps> = ({ games, loading }) => {
  if (loading) {
    return <div className="loading">Loading games...</div>;
  }

  if (games.length === 0) {
    return <div className="empty-state">No games found.</div>;
  }

  return (
    <div className="game-grid">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};

export default GameGrid;
