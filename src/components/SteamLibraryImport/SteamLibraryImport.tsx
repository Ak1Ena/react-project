import { useEffect, useState, type FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Library, ChevronDown, ChevronUp, Download, LogOut } from 'lucide-react';
import type { AppDispatch } from '../../app/store';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { addToList, selectListEntries } from '../../features/lists/listsSlice';
import { showToast } from '../../features/ui/uiSlice';
import {
  fetchSteamLibraryForMe,
  fetchSteamMe,
  signOutSteam,
  steamSignInUrl,
  type SteamOwnedGame,
  type SteamUser,
} from '../../features/games/gamesAPI';
import type { ListStatus } from '../../features/lists/listsAPI';
import styles from './SteamLibraryImport.module.css';

const SIGN_IN_BUTTON =
  'https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_01.png';

const SteamLibraryImport: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectCurrentUser);
  const entries = useSelector(selectListEntries);
  const location = useLocation();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [steamUser, setSteamUser] = useState<SteamUser | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingLib, setLoadingLib] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<SteamOwnedGame[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [targetStatus, setTargetStatus] = useState<ListStatus>('backlog');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);

  const alreadyOwnedAppids = new Set(entries.map((e) => e.gameId));

  useEffect(() => {
    let cancelled = false;
    setLoadingMe(true);
    fetchSteamMe()
      .then((u) => {
        if (!cancelled) setSteamUser(u);
      })
      .catch(() => {
        if (!cancelled) setSteamUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingMe(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const steam = params.get('steam');
    if (steam === 'ok') {
      setExpanded(true);
      dispatch(showToast({ message: 'Signed in with Steam.', type: 'success' }));
      params.delete('steam');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    } else if (steam === 'error') {
      dispatch(showToast({ message: 'Steam sign-in failed.', type: 'error' }));
      params.delete('steam');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [location.search, location.pathname, dispatch, navigate]);

  const handleSignIn = () => {
    window.location.href = steamSignInUrl();
  };

  const handleSignOut = async () => {
    try {
      await signOutSteam();
      setSteamUser(null);
      setLibrary(null);
      setSelected(new Set());
      dispatch(showToast({ message: 'Steam disconnected.', type: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Failed to disconnect Steam.', type: 'error' }));
    }
  };

  const handleFetchLibrary = async () => {
    setError(null);
    setLibrary(null);
    setSelected(new Set());
    setLoadingLib(true);
    try {
      const res = await fetchSteamLibraryForMe();
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
          {steamUser && (
            <span className={styles.identity}>
              {steamUser.avatar && (
                <img src={steamUser.avatar} alt="" className={styles.avatar} />
              )}
              <span>{steamUser.displayName || steamUser.steamid}</span>
            </span>
          )}
        </div>
        <button className={styles.toggleBtn} onClick={() => setExpanded((v) => !v)}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? 'Hide' : steamUser ? 'Manage' : 'Connect Steam'}
        </button>
      </div>

      {expanded && (
        <div className={styles.body}>
          {loadingMe ? (
            <p className={styles.helpText}>Checking Steam sign-in…</p>
          ) : !steamUser ? (
            <>
              <p className={styles.helpText}>
                Sign in with Steam to import your owned games. Your Steam profile and
                game list must be set to <em>Public</em> for the import to work.
              </p>
              <div className={styles.row}>
                <button
                  className={styles.steamButton}
                  onClick={handleSignIn}
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
                <button
                  className={styles.secondaryBtn}
                  onClick={handleSignOut}
                  disabled={importing}
                >
                  <LogOut size={14} />
                  Disconnect
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
