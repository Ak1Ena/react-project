import { type FC } from 'react';
import GameCard from '../GameCard/GameCard';
import type { Game } from '../../features/games/gamesAPI';
import styles from './GameGrid.module.css';

interface GameGridProps {
  games: Game[];
  loading?: boolean;
}

const GameGrid: FC<GameGridProps> = ({ games, loading }) => {
  if (loading) {
    return <div className={styles.loading}>Loading games...</div>;
  }

  if (games.length === 0) {
    return <div className={styles.emptyState}>No games found.</div>;
  }

  return (
    <div className={styles.gameGrid}>
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};

export default GameGrid;
