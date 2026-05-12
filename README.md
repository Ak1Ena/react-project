# React + Redux Toolkit Best Practices

This project is initialized with a feature-based folder structure designed for scalability and maintainability.

## Folder Structure

- **`src/app/`**: Global app configuration.
  - `store.ts`: Redux store configuration.
- **`src/features/`**: Feature-specific logic. Each folder represents a major feature (e.g., `counter`, `auth`, `products`).
  - Contains slices, components, and hooks that are unique to that feature.
- **`src/components/`**: Shared UI components used across multiple features (e.g., `Button`, `Modal`, `Input`).
- **`src/hooks/`**: Custom React hooks.
  - `redux.ts`: Typed versions of `useDispatch` and `useSelector` (`useAppDispatch`, `useAppSelector`).
- **`src/services/`**: API definitions, typically using RTK Query for data fetching and caching.
- **`src/utils/`**: Shared helper functions and utility classes.
- **`src/assets/`**: Static files like images, fonts, and global CSS.

## Key Technologies

- **Vite**: Next-generation frontend tooling for fast development.
- **React**: UI library.
- **Redux Toolkit (RTK)**: The official, opinionated toolset for efficient Redux development.
- **TypeScript**: Static typing for better developer experience and reliability.

## Getting Started

1. **Install dependencies**: `npm install`
2. **Run dev server**: `npm run dev`
3. **Build for production**: `npm run build`

## Best Practices Followed

1. **Feature-Based Organization**: Logic is grouped by feature rather than type (reducers, actions, etc.).
2. **Typed Redux Hooks**: Uses `useAppDispatch` and `useAppSelector` for type safety.
3. **Immer Integration**: RTK uses Immer under the hood, allowing for "mutable" update logic in reducers.
4. **Boilerplate Reduction**: Uses `createSlice` to combine actions and reducers.
