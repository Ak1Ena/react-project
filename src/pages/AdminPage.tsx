import { useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Loader2, Search, Star, Plus } from 'lucide-react';
import {
  useGetGamesQuery,
  useDeleteGameMutation,
} from '../features/api/gameApi';
import { useUI } from '../context/useUI';
import Spinner from '../components/Spinner/Spinner';
import styles from './AdminPage.module.css';

const AdminPage: FC = () => {
  const { showToast } = useUI();
  const { data: games = [], isLoading } = useGetGamesQuery();
  const [deleteGame] = useDeleteGameMutation();

  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete "${name}" from the catalog?`)) return;
    setDeletingId(id);
    try {
      await deleteGame(id).unwrap();
      showToast('Game deleted.', 'success');
    } catch {
      showToast('Failed to delete game. Try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) return <Spinner fullPage label="Loading catalog..." />;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin · Catalog</h1>
          <p className={styles.subtitle}>{filtered.length} of {games.length} games</p>
        </div>
        <Link to="/add-game" className={styles.addGameBtn}>
          <Plus size={18} />
          <span>Add New Game</span>
        </Link>
      </header>

      <div className={styles.searchRow}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.coverCol}>Cover</th>
              <th>Title</th>
              <th>Genre</th>
              <th>Year</th>
              <th>Rating</th>
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  {search ? `No games match "${search}"` : 'No games yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((g) => {
                const isDeleting = deletingId === g.id;
                return (
                  <tr key={g.id}>
                    <td className={styles.coverCol}>
                      {g.image ? (
                        <img src={g.image} alt={g.name} className={styles.coverImg} />
                      ) : (
                        <div className={styles.coverPlaceholder}>—</div>
                      )}
                    </td>
                    <td>
                      <Link to={`/games/${g.id}`} className={styles.titleLink}>
                        {g.name}
                      </Link>
                    </td>
                    <td className={styles.muted}>{g.genre[0] ?? '—'}</td>
                    <td className={styles.muted}>{g.releaseYear}</td>
                    <td>
                      <span className={styles.ratingPill}>
                        <Star size={12} fill="var(--primary)" color="var(--primary)" />
                        {g.rating}
                      </span>
                    </td>
                    <td className={styles.actionsCol}>
                      <div className={styles.actions}>
                        <Link
                          to={`/add-game?id=${g.id}`}
                          className={styles.actionBtn}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.dangerBtn}`}
                          onClick={() => handleDelete(g.id, g.name)}
                          disabled={isDeleting}
                          title="Delete"
                        >
                          {isDeleting ? (
                            <Loader2 size={14} className={styles.spin} />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
