import { useEffect, type FC } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { fetchListEntries } from '../features/lists/listsSlice';
import { fetchGames } from '../features/games/gamesSlice';
import ListEntryCard from '../components/ListEntryCard';

const ListPage: FC = () => {
  const { status: currentStatus } = useParams<{ status: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { entries, status: listStatus } = useSelector((state: RootState) => state.lists);
  const { items: games, status: gamesStatus } = useSelector((state: RootState) => state.games);

  useEffect(() => {
    if (listStatus === 'idle') dispatch(fetchListEntries());
    if (gamesStatus === 'idle') dispatch(fetchGames());
  }, [listStatus, gamesStatus, dispatch]);

  const filteredEntries = entries.filter((entry) => entry.status === currentStatus);
  
  const getGame = (gameId: string) => games.find((g) => g.id === gameId);

  return (
    <div className="list-page">
      <header className="page-header">
        <h1>My Personal Lists</h1>
        <div className="list-tabs">
          <NavLink to="/my-list/playing" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>Playing</NavLink>
          <NavLink to="/my-list/completed" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>Completed</NavLink>
          <NavLink to="/my-list/backlog" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>Backlog</NavLink>
          <NavLink to="/my-list/wishlist" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>Wishlist</NavLink>
        </div>
      </header>

      {(listStatus === 'loading' || gamesStatus === 'loading') ? (
        <div className="loading">Loading your list...</div>
      ) : (
        <div className="list-container">
          {filteredEntries.length === 0 ? (
            <div className="empty-state">
              <p>No games in your {currentStatus} list yet.</p>
              <NavLink to="/" className="btn-primary">Browse Games</NavLink>
            </div>
          ) : (
            <div className="list-grid">
              {filteredEntries.map((entry) => {
                const game = getGame(entry.gameId);
                return game ? (
                  <ListEntryCard key={entry.id} entry={entry} game={game} />
                ) : null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListPage;
