import { useState, type FC, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronLeft, Save } from 'lucide-react';
import type { AppDispatch } from '../app/store';
import { createGame } from '../features/games/gamesSlice';
import { showToast } from '../features/ui/uiSlice';

const AddGamePage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    title: '',
    genre: 'Action',
    platform: '',
    releaseYear: new Date().getFullYear(),
    rating: 0,
    coverImage: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);

  const genres = ['Action', 'RPG', 'FPS', 'Strategy', 'Adventure', 'Sports', 'Simulation'];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'releaseYear' || name === 'rating' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(createGame(formData)).unwrap();
      dispatch(showToast({ message: 'Game added successfully to catalog!', type: 'success' }));
      navigate('/');
    } catch (error) {
      dispatch(showToast({ message: 'Failed to add game. Please try again.', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-game-page">
      <button onClick={() => navigate(-1)} className="back-button">
        <ChevronLeft size={20} />
        Back
      </button>

      <div className="form-container">
        <h1>Add New Game to Catalog</h1>
        <form onSubmit={handleSubmit} className="add-game-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Game Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Elden Ring"
              />
            </div>

            <div className="form-group">
              <label htmlFor="genre">Genre*</label>
              <select id="genre" name="genre" value={formData.genre} onChange={handleChange}>
                {genres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="platform">Platforms*</label>
              <input
                type="text"
                id="platform"
                name="platform"
                required
                value={formData.platform}
                onChange={handleChange}
                placeholder="e.g. PC, PS5, Xbox"
              />
            </div>

            <div className="form-group">
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

            <div className="form-group">
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

            <div className="form-group">
              <label htmlFor="coverImage">Cover Image URL*</label>
              <input
                type="url"
                id="coverImage"
                name="coverImage"
                required
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="form-group full-width">
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

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
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
