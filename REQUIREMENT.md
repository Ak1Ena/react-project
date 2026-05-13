# 📋 Project Requirements — Game Library Browser

## 1. Project Overview

**Project Name:** Game Library Browser with Personal Lists
**Type:** Frontend-only Single Page Application (SPA)
**Tech Stack:** React + Redux Toolkit + MockAPI
**Goal:** Build a web application where users can browse a game catalog, manage personal game lists, and perform full CRUD operations using a mock backend.

### Target Users

This application is designed for **gamers who want to organize, track, and discover video games** — similar to Goodreads (for books) or Letterboxd (for movies), but for video games.

**Primary users:**
- Gamers with libraries across multiple platforms (Steam, PS5, Xbox, Switch)
- Game collectors who need to track owned games
- Players with large backlogs of unfinished games
- People looking for new games by genre, platform, or rating

### Catalog Approach

The application uses a **hybrid catalog model**:
- The catalog is **pre-filled** by the developer with 30–50 games in MockAPI
- Users primarily **add pre-existing games to their personal lists**
- Users **optionally** can also contribute new games to the catalog
- All CRUD operations are demonstrated on the `listEntries` resource (main focus)
- Optional CRUD on the `games` resource for catalog contributions

---

## 2. Functional Requirements

### 2.1 Game Catalog
- Display a list of all games from MockAPI
- Show each game with: cover image, title, genre, platform, release year, rating
- Click a game to view its detail page
- Support pagination or infinite scroll (optional)

### 2.2 Search, Filter & Sort
- Real-time search by game title
- Filter by:
  - Genre (Action, RPG, FPS, Strategy, etc.)
  - Platform (PC, PS5, Xbox, Switch, etc.)
  - Release year (range or single year)
  - Minimum rating
- Sort by:
  - Title (A–Z, Z–A)
  - Rating (high to low, low to high)
  - Release year (newest, oldest)

### 2.3 Game Detail Page
- Display all game information
- Show game description
- "Add to list" controls (select status: Playing / Completed / Backlog / Wishlist)
- Show user's personal notes and rating if the game is in a list
- Edit and delete the game (optional — admin-style)

### 2.4 Personal Lists
- Four separate lists: **Playing**, **Completed**, **Backlog**, **Wishlist**
- Each list shows all games with that status
- Each list entry displays: game info, personal rating, personal notes, date added
- Allow moving a game between lists (update status)
- Allow editing notes and personal rating
- Allow removing a game from a list

### 2.5 Add New Game (Optional)
- Form to add a new game to the catalog
- Required fields: title, genre, platform, release year, cover image URL
- Optional: rating, description
- Form validation (no empty required fields, valid year, valid URL)

---

## 3. CRUD Operations Mapping

| Operation | Action |
|-----------|--------|
| **Create** | Add a game to a personal list • Add new game to catalog |
| **Read** | Fetch game catalog • Fetch personal lists • Fetch game details |
| **Update** | Change game's list status • Edit notes / personal rating • Update game info |
| **Delete** | Remove game from personal list • Delete game from catalog |

---

## 4. Pages / Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Browse all games with filters and search |
| `/games/:id` | GameDetailPage | Detail view of a single game |
| `/my-list/playing` | ListPage | Currently playing games |
| `/my-list/completed` | ListPage | Completed games |
| `/my-list/backlog` | ListPage | Backlog games |
| `/my-list/wishlist` | ListPage | Wishlist games |
| `/add-game` | AddGamePage | Add a new game to the catalog (optional) |

---

## 5. Redux Slice Structure

### 5.1 gamesSlice
- **State:** `{ items: [], status: 'idle' | 'loading' | 'succeeded' | 'failed', error: null }`
- **Async Thunks:** `fetchGames`, `fetchGameById`, `createGame`, `updateGame`, `deleteGame`

### 5.2 listsSlice
- **State:** `{ entries: [], status, error }`
- **Async Thunks:** `fetchListEntries`, `addToList`, `updateListEntry`, `removeFromList`

### 5.3 filtersSlice
- **State:** `{ searchQuery, genre, platform, year, minRating, sortBy }`
- **Reducers:** `setSearchQuery`, `setGenre`, `setPlatform`, `setYear`, `setMinRating`, `setSortBy`, `resetFilters`

### 5.4 uiSlice (optional)
- **State:** `{ modalOpen, toastMessage, theme }`
- **Reducers:** `openModal`, `closeModal`, `showToast`, `clearToast`, `toggleTheme`

---

## 6. MockAPI Endpoints

### Resource: `games`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/games` | Fetch all games |
| GET | `/games/:id` | Fetch a single game |
| POST | `/games` | Create a new game |
| PUT | `/games/:id` | Update a game |
| DELETE | `/games/:id` | Delete a game |

### Resource: `listEntries`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/list` | Fetch all list entries |
| POST | `/list` | Add a game to a list |
| PUT | `/list/:id` | Update list entry |
| DELETE | `/list/:id` | Remove from list |

---

## 7. Data Models

### Game
```json
{
  "id": "1",
  "title": "The Witcher 3: Wild Hunt",
  "genre": "RPG",
  "platform": "PC, PS5, Xbox",
  "releaseYear": 2015,
  "rating": 9.3,
  "coverImage": "https://example.com/witcher3.jpg",
  "description": "An open-world action RPG..."
}
```

### ListEntry
```json
{
  "id": "1",
  "gameId": "1",
  "status": "playing",
  "notes": "Loving the storyline so far",
  "personalRating": 9,
  "dateAdded": "2025-01-15T10:30:00Z"
}
```

---

## 8. Component Breakdown

| Component | Purpose |
|-----------|---------|
| `Navbar` | Top navigation with links to all routes |
| `GameCard` | Display a single game (used in grids) |
| `GameGrid` | Grid layout for game cards |
| `FilterBar` | Search input + filter dropdowns + sort selector |
| `GameDetail` | Full game info + add/edit list controls |
| `ListEntryCard` | List entry with status switcher, notes, rating, remove |
| `AddGameForm` | Form for creating a new game |
| `Modal` | Reusable modal for confirmations/forms |
| `Toast` | Notification messages |
| `LoadingSpinner` | Loading state indicator |
| `ErrorMessage` | Error state display |

---

## 9. Non-Functional Requirements

### 9.1 Performance
- Initial page load under 3 seconds
- Smooth UI interactions (no lag on filter changes)
- Use React `memo` and `useMemo` where appropriate

### 9.2 Usability
- Responsive design (mobile, tablet, desktop)
- Clear feedback for all user actions (toasts, loading states)
- Intuitive navigation
- Empty states for lists with no games

### 9.3 Code Quality
- Follow React best practices (functional components, hooks)
- Proper folder structure (features/components/pages)
- Use Redux Toolkit (`createSlice`, `createAsyncThunk`)
- Modular and reusable components
- Meaningful variable and function names
- Comments for complex logic

### 9.4 Error Handling
- Catch and display API errors gracefully
- Validate forms before submission
- Handle empty states (no games, no list entries)
- Handle 404 (game not found)

---

## 10. Technical Requirements

| Tool / Library | Required |
|----------------|----------|
| React (v18+) | ✅ |
| Redux Toolkit | ✅ |
| React-Redux | ✅ |
| React Router DOM (v6+) | ✅ |
| Axios or Fetch API | ✅ |
| MockAPI account | ✅ |
| CSS framework (any) | ✅ |
| Git for version control | ✅ |

---

## 11. Deliverables

- ✅ Source code (GitHub repository)
- ✅ README.md with setup instructions
- ✅ requirement.md (this document)
- ✅ Working MockAPI endpoints
- ✅ Deployed demo (Netlify / Vercel / GitHub Pages — optional)
- ✅ Project presentation / documentation

---

## 12. Project Timeline (Suggested)

| Week | Tasks |
|------|-------|
| **Week 1** | Setup project, install dependencies, configure MockAPI, design UI mockups |
| **Week 2** | Build catalog page, game cards, fetch games via Redux |
| **Week 3** | Implement filters, search, sort, and game detail page |
| **Week 4** | Build personal lists (CRUD on list entries) |
| **Week 5** | Add new game form, validation, polish UI, handle errors |
| **Week 6** | Testing, deployment, documentation, final review |

---

## 13. Acceptance Criteria

The project is considered complete when:
- [ ] All games can be browsed from MockAPI
- [ ] Search, filter, and sort work correctly
- [ ] Users can add games to any of the four lists (Create)
- [ ] Users can view their lists (Read)
- [ ] Users can update status, notes, and personal rating (Update)
- [ ] Users can remove games from their lists (Delete)
- [ ] All Redux state is managed properly (no prop drilling)
- [ ] App is responsive on all screen sizes
- [ ] App handles loading and error states
- [ ] Code is clean, organized, and well-documented
- [ ] README.md is complete and accurate

---

## 14. Stretch Goals (Optional)

- 📊 Stats dashboard (games per list, total games, favorite genre)
- 🖱️ Drag-and-drop between lists
- 🌙 Dark mode
- 💾 Export lists as JSON / CSV
- 👥 Multi-user simulation with login
- 🏆 Achievements / progress tracking
- 📈 Charts and visualizations (Recharts)
- 🔔 Reminder notifications for backlog games

---

## 15. References

- [React Documentation](https://react.dev)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [React Router Documentation](https://reactrouter.com)
- [MockAPI Documentation](https://mockapi.io)
- [Axios Documentation](https://axios-http.com)