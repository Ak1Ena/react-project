# 🎮 Game Library Browser with Personal Lists

A React + Redux web application for browsing video games and organizing them into personal lists (Playing, Completed, Backlog, Wishlist). Built as a frontend-only project using MockAPI as the backend.

## 📖 Description

Game Library Browser is a single-page web application that allows users to:
- Explore a pre-filled catalog of video games
- Search, filter, and sort games by various criteria
- Organize games into four personal lists
- Add personal notes and ratings to tracked games
- Optionally contribute new games to the catalog
- Perform full CRUD (Create, Read, Update, Delete) operations on their game lists

## 👥 Target Users

This website is designed for **gamers who want a personal tool to organize, track, and discover video games** — think of it as a "Goodreads for games" or a personal Letterboxd for gaming.

**Ideal users include:**
- 🎮 **Gamers** with libraries across Steam, PlayStation, Xbox, or Switch
- 📚 **Game collectors** who own many games and need to track them
- 🎯 **Backlog strugglers** who buy games faster than they finish them
- 🔍 **Game discoverers** looking for new games by genre, platform, or rating

**Example user persona:**
> **Alex, 24** — plays games 10+ hours a week, owns 150+ games across multiple platforms. Uses Game Library Browser to track which games are finished, which are in progress, and what to play next.

## 🧭 How It Works

The website uses a **hybrid catalog approach**:

- 📦 **Pre-filled catalog** — The site comes pre-loaded with ~30–50 games in MockAPI, so users see a populated catalog right away.
- ➕ **User contributions (optional)** — Users can add new games to the catalog if they don't find what they're looking for.
- 📋 **Personal lists** — Users primarily interact with the site by adding games to their own four lists: **Playing**, **Completed**, **Backlog**, **Wishlist**.
- ⭐ **Personal data** — Each list entry can have personal notes and a personal rating, separate from the catalog rating.

This keeps the experience realistic (like Steam or Metacritic) while still demonstrating full CRUD operations.

## ✨ Features

- 🔍 **Browse & Search** — Explore the full game catalog with real-time search
- 🎯 **Filter & Sort** — Filter by genre, platform, release year, and rating
- 📋 **Four Personal Lists** — Playing, Completed, Backlog, Wishlist
- ⭐ **Personal Ratings & Notes** — Add your own score and notes for each game
- 🔄 **Move Between Lists** — Easily change a game's status
- ➕ **Add New Games (Optional)** — Contribute new games to the catalog
- ✏️ **Edit & Delete** — Full control over your personal list entries

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend Framework | React (TypeScript) |
| State Management | Redux Toolkit |
| Routing | React Router |
| HTTP Client | Axios |
| Mock Backend | MockAPI |
| Styling | CSS Modules |

## 📁 Project Structure

```
game-library-browser/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── mockApi.ts          # Axios instances & API helpers
│   ├── app/
│   │   └── store.ts            # Redux store configuration
│   ├── features/
│   │   ├── games/
│   │   │   ├── gamesSlice.ts
│   │   │   ├── gamesAPI.ts
│   │   │   ├── GameDetailPage.tsx
│   │   │   └── AddGamePage.tsx
│   │   ├── lists/
│   │   │   ├── listsSlice.ts
│   │   │   ├── listsAPI.ts
│   │   │   └── ListPage.tsx
│   │   ├── filters/
│   │   │   └── filtersSlice.ts
│   │   └── ui/
│   │       └── uiSlice.ts
│   ├── components/
│   │   ├── Navbar/
│   │   ├── GameCard/
│   │   ├── GameGrid/
│   │   ├── FilterBar/
│   │   ├── ListEntryCard/
│   │   ├── Modal/
│   │   └── Toast/
│   ├── pages/
│   │   ├── HomePage.tsx
│   ├── routes/
│   │   └── AppRoutes.tsx
│   ├── App.tsx
│   └── main.tsx
├── .env
├── .gitignore
├── package.json
├── REQUIREMENT.md
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/game-library-browser.git
   cd game-library-browser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MockAPI**
   - Sign up at [mockapi.io](https://mockapi.io)
   - Create a new project
   - Create two resources: `games` and `lists`
   - Copy your project's base URL

4. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_GAME_API_URL=https://YOUR_MOCKAPI_PROJECT_ID.mockapi.io
   VITE_USER_API_URL=https://YOUR_MOCKAPI_PROJECT_ID.mockapi.io
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔌 MockAPI Setup

### Resource: `games` (endpoint: `/api/v1/games`)

| Field | Type | Description |
|-------|------|-------------|
| id | String | Auto-generated |
| appid | Number | Steam App ID |
| name | String | Game title |
| genre | Array | Array of genres |
| platforms | Array | Array of platforms |
| releaseYear | Number | Year of release |
| rating | Number | Average rating (0–10) |
| image | String | Image URL |
| description | String | Game description |

### Resource: `lists` (endpoint: `/api/v1/lists`)

| Field | Type | Description |
|-------|------|-------------|
| id | String | Auto-generated |
| gameid | String | Reference to game id |
| userid | String | User ID |
| status | String | playing / completed / backlog / wishlist |
| notes | String | User's personal notes |
| personalRating | Number | User's rating (0–10) |
| dateAdded | String | ISO date string |

## 🌐 Available Routes

| Route | Description |
|-------|-------------|
| `/` | Home / Browse catalog |
| `/games/:id` | Game detail page |
| `/my-list/playing` | Games currently playing |
| `/my-list/completed` | Completed games |
| `/my-list/backlog` | Games to play later |
| `/my-list/wishlist` | Wishlisted games |
| `/add-game` | Add a new game to the catalog |

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |

## 🧩 Redux Slices

- **gamesSlice** — Catalog data, loading & error states
- **listsSlice** — Personal list entries with CRUD logic
- **filtersSlice** — Search query, filters, and sort options
- **uiSlice** — Modals, toast messages, and UI state

## 🎨 Screenshots

_Add screenshots of your finished project here._

## 🌟 Stretch Goals

- 📊 Stats dashboard (games per list, favorite genre, total hours)
- 🖱️ Drag-and-drop to move games between lists
- 🌙 Dark mode toggle
- 💾 Export lists as JSON or CSV
- 👥 Simulated multi-user login

## 📚 Learning Outcomes

By building this project, you will practice:
- React component architecture
- State management with Redux Toolkit
- Async data flow with `createAsyncThunk`
- Routing with React Router
- RESTful CRUD with a mock backend
- Form handling and validation
- Responsive UI design

## 👤 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [MockAPI](https://mockapi.io) for the free mock backend service
- [Redux Toolkit](https://redux-toolkit.js.org) documentation
- Game cover images sourced from [SteamGridDB](https://www.steamgriddb.com) / [RAWG](https://rawg.io)