import { useState, type FC, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { useCreateGameMutation } from '../features/api/gameApi';
import { useUI } from '../context/useUI';
import styles from './AddGamePage.module.css';

const AddGamePage: FC = () => {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [createGame, { isLoading: loading }] = useCreateGameMutation();

  const [formData, setFormData] = useState({
    name: '',
    genre: ['Action'] as string[],
    platforms: [] as string[],
    releaseYear: new Date().getFullYear(),
    rating: 0,
    image: '',
    description: '',
  });

  const genres = ['Action', 'RPG', 'FPS', 'Strategy', 'Adventure', 'Sports', 'Simulation'];
  const availablePlatforms = ['Windows', 'Mac', 'Linux'];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'genre') {
      setFormData((prev) => ({ ...prev, genre: [value] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'releaseYear' || name === 'rating' ? Number(value) : value,
      }));
    }
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  // Resize + re-encode to keep the base64 payload under MockAPI's request
  // size cap (~1MB). 800px wide JPEG @ 0.8 is plenty for a cover image.
  const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onloadend = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(1, maxWidth / img.width);
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context unavailable'));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image is too large. Please select a file under 5MB.', 'error');
      return;
    }
    try {
      const compressed = await compressImage(file);
      setFormData((prev) => ({ ...prev, image: compressed }));
    } catch {
      showToast('Could not process that image. Try a different one.', 'error');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.platforms.length === 0) {
      showToast('Pick at least one platform.', 'error');
      return;
    }
    try {
      const gameData = {
        ...formData,
        appid: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000),
      };
      await createGame(gameData).unwrap();
      showToast('Game added successfully to catalog!', 'success');
      navigate('/');
    } catch {
      showToast('Failed to add game. Please try again.', 'error');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back to Library</span>
        </button>
      </header>

      <div className={styles.mainLayout}>
        <div className={styles.leftCol}>
          <div className={styles.imagePreviewCard}>
            {formData.image ? (
              <img src={formData.image} alt="Preview" className={styles.previewImage} />
            ) : (
              <div className={styles.placeholderIcon}>
                <ImageIcon size={48} />
                <span>Image Preview</span>
              </div>
            )}
            <div className={styles.patternOverlay}></div>
            <h2 className={styles.previewTitle}>{formData.name || 'New Game'}</h2>
          </div>

          <div className={styles.infoBox}>
            <div className={styles.infoIcon}>
              <Sparkles size={18} />
            </div>
            <p className={styles.infoText}>
              Adding a game will make it available for all users in the community catalog.
            </p>
          </div>
        </div>

        <div className={styles.rightCol}>
          <header className={styles.formHeader}>
            <h1 className={styles.title}>Add New Game</h1>
            <p className={styles.subtitle}>Fill in the details to contribute to the catalog</p>
          </header>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Game Title*</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Elden Ring"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Genre*</label>
                <select 
                  name="genre" 
                  value={formData.genre[0]} 
                  onChange={handleChange}
                  className={styles.select}
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Platforms*</label>
                <div className={styles.platformChips}>
                  {availablePlatforms.map((p) => {
                    const selected = formData.platforms.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={selected ? `${styles.platformChip} ${styles.platformChipActive}` : styles.platformChip}
                        aria-pressed={selected}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Release Year*</label>
                <input
                  type="number"
                  name="releaseYear"
                  required
                  min="1950"
                  max={new Date().getFullYear() + 5}
                  value={formData.releaseYear}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Base Rating (0-10)</label>
                <input
                  type="number"
                  name="rating"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Cover Image*</label>
                <div className={styles.uploadWrapper}>
                  <label htmlFor="image-upload" className={styles.uploadLabel}>
                    <Upload size={16} />
                    <span>{formData.image ? 'Change Image' : 'Upload Image'}</span>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                  />
                  {formData.image && <span className={styles.fileName}>Image selected ✅</span>}
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a brief description..."
                className={styles.textarea}
              />
            </div>

            <div className={styles.formActions}>
              <button type="button" onClick={() => navigate(-1)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" disabled={loading || !formData.image || formData.platforms.length === 0} className={styles.saveBtn}>
                {loading ? <Loader2 size={18} className={styles.spin} /> : <Save size={18} />}
                <span>{loading ? 'Saving...' : 'Save Game'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGamePage;
