import { useState, type FC, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronLeft, Save, Search, Loader2 } from 'lucide-react';
import type { AppDispatch } from '../app/store';
import { createGame } from '../features/games/gamesSlice';
import { showToast } from '../features/ui/uiSlice';
import { getGameDetails } from '../features/steam/steamAPI';
import styles from './AddGamePage.module.css';

const AddGamePage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    name: '',
    genre: ['Action'] as string[],
    platforms: [] as string[],
    releaseYear: new Date().getFullYear(),
    rating: 0,
    image: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [steamId, setSteamId] = useState('');
  const [fetchingSteam, setFetchingSteam] = useState(false);

  const genres = ['Action', 'RPG', 'FPS', 'Strategy', 'Adventure', 'Sports', 'Simulation'];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'genre') {
      setFormData((prev) => ({ ...prev, genre: [value] }));
    } else if (name === 'platforms') {
      setFormData((prev) => ({ ...prev, platforms: value.split(',').map(p => p.trim()).filter(Boolean) }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'releaseYear' || name === 'rating' ? Number(value) : value,
      }));
    }
  };

  const handleFetchSteam = async () => {
    if (!steamId) {
      dispatch(showToast({ message: 'Please enter a Steam App ID', type: 'error' }));
      return;
    }

    setFetchingSteam(true);
    try {
      const details = await getGameDetails(Number(steamId));
      
      const steamGenres = details.genres?.map(g => g.description) || [];
      const primaryGenre = genres.find(g => steamGenres.includes(g)) || steamGenres[0] || 'Action';
      
      const steamPlatforms = [];
      if (details.platforms.windows) steamPlatforms.push('PC');
      if (details.platforms.mac) steamPlatforms.push('Mac');
      if (details.platforms.linux) steamPlatforms.push('Linux');

      const releaseYear = details.release_date?.date ? new Date(details.release_date.date).getFullYear() : new Date().getFullYear();

      setFormData({
        name: details.name,
        genre: [primaryGenre],
        platforms: steamPlatforms,
        releaseYear,
        rating: 0,
        image: details.header_image,
        description: details.short_description || details.about_the_game?.replace(/<[^>]*>?/gm, '').substring(0, 300) + '...',
      });

      dispatch(showToast({ message: `Imported ${details.name} from Steam!`, type: 'success' }));
    } catch (error) {
      console.error(error);
      dispatch(showToast({ message: 'Failed to fetch Steam data. Check the App ID.', type: 'error' }));
    } finally {
      setFetchingSteam(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const gameData = {
        ...formData,
        appid: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000),
      };
      await dispatch(createGame(gameData)).unwrap();
      dispatch(showToast({ message: 'Game added successfully to catalog!', type: 'success' }));
      navigate('/');
    } catch {
      dispatch(showToast({ message: 'Failed to add game. Please try again.', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.addGamePage}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <ChevronLeft size={20} />
        Back
      </button>

      <div className={styles.formContainer}>
        <h1>Add New Game to Catalog</h1>

        <div className={styles.steamImportSection}>
          <div className={styles.formGroup}>
            <label>Quick Import from Steam</label>
            <div className={styles.steamInputGroup}>
              <input 
                type="text" 
                placeholder="Steam App ID (e.g. 1245620)" 
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
              />
              <button 
                type="button" 
                onClick={handleFetchSteam} 
                disabled={fetchingSteam}
                className={styles.btnSteam}
              >
                {fetchingSteam ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                {fetchingSteam ? 'Fetching...' : 'Fetch Data'}
              </button>
            </div>
            <p className={styles.helperText}>Enter the numeric App ID from the Steam store URL.</p>
          </div>
        </div>

        <div className={styles.divider}><span>OR FILL MANUALLY</span></div>

        <form onSubmit={handleSubmit} className={styles.addGameForm}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Game Title*</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Elden Ring"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="genre">Genre*</label>
              <select id="genre" name="genre" value={formData.genre[0]} onChange={handleChange}>
                {genres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="platforms">Platforms* (comma separated)</label>
              <input
                type="text"
                id="platforms"
                name="platforms"
                required
                value={formData.platforms.join(', ')}
                onChange={handleChange}
                placeholder="e.g. PC, PS5, Xbox"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="releaseYear">Release Year*</label>
              <input
                type="number"
                id="releaseYear"
                name="releaseYear"
                required
                min="1950"
                max={new Date().getFullYear() + 5}
                value={formData.releaseYear}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="rating">Base Rating (0-10)</label>
              <input
                type="number"
                id="rating"
                name="rating"
                min="0"
                max="10"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image">Cover Image URL*</label>
              <input
                type="url"
                id="image"
                name="image"
                required
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a brief description of the game..."
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={() => navigate(-1)} className={styles.btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              <Save size={20} />
              {loading ? 'Saving...' : 'Save Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGamePage;
