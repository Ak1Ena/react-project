import { useState, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Library, ChevronDown, ChevronUp, Download } from 'lucide-react';
import type { AppDispatch } from '../../app/store';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { addToList, selectListEntries } from '../../features/lists/listsSlice';
import { showToast } from '../../features/ui/uiSlice';
import {
  fetchSteamLibrary,
  steamSignInUrl,
  type SteamOwnedGame,
} from '../../features/games/gamesAPI';
import type { ListStatus } from '../../features/lists/listsAPI';
import styles from './SteamLibraryImport.module.css';

const SIGN_IN_BUTTON =
  'https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_01.png';

const SteamLibraryImport: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectCurrentUser);
  const entries = useSelector(selectListEntries);

  const [expanded, setExpanded] = useState(false);
  const [loadingLib, setLoadingLib] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<SteamOwnedGame[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [targetStatus, setTargetStatus] = useState<ListStatus>('backlog');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);

  const alreadyOwnedAppids = new Set(entries.map((e) => e.gameId));
  const steamid = currentUser?.steamid;

  const handleLinkSteam = () => {
    window.location.href = steamSignInUrl('/my-list/playing');
  };

  const handleFetchLibrary = async () => {
    if (!steamid) return;
    setError(null);
    setLibrary(null);
    setSelected(new Set());
    setLoadingLib(true);
    try {
      const res = await fetchSteamLibrary(steamid);
      const sorted = [...res.games].sort(
        (a, b) => b.playtime_forever - a.playtime_forever
      );
      setLibrary(sorted);
      const preselect = new Set<number>(
        sorted
          .filter((g) => !alreadyOwnedAppids.has(String(g.appid)))
          .map((g) => g.appid)
      );
      setSelected(preselect);
    } catch (e: any) {
      const msg = e.response?.data?.error || e.message || 'Failed to fetch library';
      setError(msg);
    } finally {
      setLoadingLib(false);
    }
  };

  const toggle = (appid: number) => {
    const next = new Set(selected);
    if (next.has(appid)) next.delete(appid);
    else next.add(appid);
    setSelected(next);
  };

  const selectAll = () => {
    if (!library) return;
    setSelected(new Set(library.map((g) => g.appid)));
  };

  const selectNone = () => setSelected(new Set());

  const handleImport = async () => {
    if (!currentUser) {
      dispatch(showToast({ message: 'Please log in to import your library.', type: 'error' }));
      return;
    }
    if (!library || selected.size === 0) return;
    setImporting(true);
    const targets = library.filter((g) => selected.has(g.appid));
    setImportProgress({ done: 0, total: targets.length });
    let added = 0;
    for (let i = 0; i < targets.length; i++) {
      const g = targets[i];
      if (alreadyOwnedAppids.has(String(g.appid))) {
        setImportProgress({ done: i + 1, total: targets.length });
        continue;
      }
      try {
        await dispatch(
          addToList({
            gameId: String(g.appid),
            userId: currentUser.id,
            status: targetStatus,
            notes: '',
            review: '',
            personalRating: 0,
          })
        ).unwrap();
        added++;
      } catch {
        // Continue — partial import is still useful.
      }
      setImportProgress({ done: i + 1, total: targets.length });
    }
    setImporting(false);
    setImportProgress(null);
    dispatch(
      showToast({
        message: `Imported ${added} game${added === 1 ? '' : 's'} into your ${targetStatus} list.`,
        type: added > 0 ? 'success' : 'error',
      })
    );
    if (added > 0) {
      setLibrary(null);
      setSelected(new Set());
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Library size={20} />
          <span>Steam Library</span>
          {currentUser?.steamid && (
            <span className={styles.identity}>
              {currentUser.avatar && (
                <img src={currentUser.avatar} alt="" className={styles.avatar} />
              )}
              <span>{currentUser.displayName || currentUser.username}</span>
            </span>
          )}
        </div>
        <button className={styles.toggleBtn} onClick={() => setExpanded((v) => !v)}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? 'Hide' : steamid ? 'Import games' : 'Link Steam'}
        </button>
      </div>

      {expanded && (
        <div className={styles.body}>
          {!steamid ? (
            <>
              <p className={styles.helpText}>
                Link a Steam account to import your owned games. Your Steam profile and
                game list must be set to <em>Public</em>.
              </p>
              <div className={styles.row}>
                <button
                  className={styles.steamButton}
                  onClick={handleLinkSteam}
                  aria-label="Sign in through Steam"
                >
                  <img src={SIGN_IN_BUTTON} alt="Sign in through Steam" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.row}>
                <button
                  className={styles.primaryBtn}
                  onClick={handleFetchLibrary}
                  disabled={loadingLib || importing}
                >
                  {loadingLib ? 'Fetching…' : 'Fetch My Library'}
                </button>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              {library && (
                <>
                  <div className={styles.row}>
                    <span className={styles.summary}>
                      {library.length} games — {selected.size} selected
                    </span>
                    <button className={styles.secondaryBtn} onClick={selectAll}>All</button>
                    <button className={styles.secondaryBtn} onClick={selectNone}>None</button>
                    <select
                      className={styles.select}
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value as ListStatus)}
                    >
                      <option value="backlog">Add to Backlog</option>
                      <option value="playing">Add to Playing</option>
                      <option value="completed">Add to Completed</option>
                      <option value="wishlist">Add to Wishlist</option>
                    </select>
                    <button
                      className={styles.primaryBtn}
                      onClick={handleImport}
                      disabled={importing || selected.size === 0}
                    >
                      <Download size={16} />
                      {importing
                        ? `Importing ${importProgress?.done}/${importProgress?.total}…`
                        : `Import ${selected.size}`}
                    </button>
                  </div>

                  <div className={styles.libraryList}>
                    {library.map((g) => {
                      const owned = alreadyOwnedAppids.has(String(g.appid));
                      const hours = (g.playtime_forever / 60).toFixed(1);
                      return (
                        <label key={g.appid} className={styles.libraryItem}>
                          <input
                            type="checkbox"
                            checked={selected.has(g.appid)}
                            onChange={() => toggle(g.appid)}
                            disabled={importing}
                          />
                          <span className={styles.libraryName}>
                            {g.name}
                            {owned && <em> — already in your list</em>}
                          </span>
                          <span className={styles.libraryPlaytime}>{hours}h</span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SteamLibraryImport;
