````md
# RULESET.md
## React & React Redux — Term Project Rules & Evaluation Guide

---

# 1. Project Overview

Develop a **Single Page Application (SPA)** using:

- React
- Redux Toolkit (RTK)
- React Router
- CSS Modules
- Mock REST API
- Vercel Deployment

### Team Requirements
- 2 students per group
- Duration: 1 week
- Language: JavaScript ES6+
- TypeScript is optional (**Bonus +5 คะแนน**)
- Deployment required on Vercel with public live URL

---

# 2. Recommended Project Ideas

| Topic | Description |
|---|---|
| Expense / Budget Manager | Track income & expenses with category filtering |
| Task / To-Do Board | Kanban board with task movement |
| Recipe Book | Add/edit/delete recipes with search & tags |
| Mini E-Commerce Store | Products, cart, checkout (mock payment) |
| Library / Book Catalog | Borrow-return system with search |
| Event Planner | Manage events and schedules |
| Employee Directory | CRUD employee management |

---

# 3. Mandatory Technical Requirements

All requirements below are REQUIRED.

| ID | Requirement | Details |
|---|---|---|
| R1 | React Functional Components | Class Components are NOT allowed |
| R2 | Redux Toolkit | Use configureStore + at least 2 slices |
| R3 | React Router | Minimum 3 different routes/pages |
| R4 | Async Data Fetching | Use createAsyncThunk OR RTK Query |
| R5 | Full CRUD | Create, Read, Update, Delete |
| R6 | Loading/Error UI | Spinner/skeleton + error handling |
| R7 | CSS Modules | Use `.module.css` |
| R8 | Environment Variables | Store API URL in `.env` |
| R9 | Vercel Deployment | Public live URL required |

---

# 4. Project Architecture Rules

## Required Folder Structure

```txt
my-app/
├── public/
├── src/
│   ├── app/
│   │   └── store.js
│   ├── features/
│   │   └── <feature>/
│   │       ├── <feature>Slice.js
│   │       ├── <feature>API.js
│   │       └── <Feature>Page.jsx
│   ├── components/
│   │   └── Button/
│   │       ├── Button.jsx
│   │       └── Button.module.css
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   └── NotFoundPage.jsx
│   ├── hooks/
│   └── main.jsx
├── .env
├── .env.example
├── .gitignore
└── package.json
````

---

# 5. React Rules

## Functional Components ONLY

✅ Allowed

```jsx
function HomePage() {
  return <h1>Home</h1>;
}
```

❌ NOT Allowed

```jsx
class HomePage extends React.Component {
  render() {
    return <h1>Home</h1>;
  }
}
```

---

## JSX Rules

* Must return ONE root element
* Use `className` instead of `class`
* Use `{}` for JavaScript expressions

✅ Correct

```jsx
<div className={styles.container}>
  {title}
</div>
```

---

## Controlled Components Required

All forms MUST use:

* `value`
* `onChange`

✅ Correct

```jsx
<input
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>
```

❌ Incorrect

```jsx
<input />
```

---

## Conditional Rendering Required

Must handle:

* Loading state
* Empty state
* Error state

Example:

```jsx
if (loading) return <Spinner />;
if (error) return <ErrorMessage />;
if (!items.length) return <p>No data</p>;
```

---

## List Rendering Rules

Must use:

* `.map()`
* `key` prop

✅ Correct

```jsx
items.map((item) => (
  <TaskCard key={item.id} task={item} />
))
```

---

# 6. Redux Toolkit Rules

## Store Setup Required

```js
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    auth: authReducer,
  },
});
```

---

## Minimum 2 Slices Required

Each slice must contain:

* initialState
* reducers
* actions

Example:

```js
import { createSlice } from "@reduxjs/toolkit";

const taskSlice = createSlice({
  name: "tasks",
  initialState: [],
  reducers: {
    addTask: (state, action) => {
      state.push(action.payload);
    },
  },
});

export const { addTask } = taskSlice.actions;
export default taskSlice.reducer;
```

---

## useSelector & useDispatch Required

✅ Correct

```jsx
const tasks = useSelector((state) => state.tasks.items);

const dispatch = useDispatch();

dispatch(addTask(task));
```

---

## createSelector Bonus (+3)

Use memoized selectors for derived data.

Example:

```js
import { createSelector } from "@reduxjs/toolkit";

export const selectCompletedTasks = createSelector(
  [(state) => state.tasks.items],
  (tasks) => tasks.filter((task) => task.completed)
);
```

---

# 7. API Integration Rules

## Real Mock REST API Required

Allowed services:

* mockapi.io
* json-server
* jsonplaceholder.typicode.com

---

## CRUD Operations Required

| Operation | Method      |
| --------- | ----------- |
| Create    | POST        |
| Read      | GET         |
| Update    | PUT / PATCH |
| Delete    | DELETE      |

---

## Async Fetching

Must use:

* createAsyncThunk
  OR
* RTK Query

---

## Loading & Error Handling

Must show UI feedback.

Example:

```jsx
{loading && <Spinner />}
{error && <ErrorMessage />}
```

---

# 8. React Router Rules

Minimum 3 routes required.

Example:

```jsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/tasks" element={<TasksPage />} />
  <Route path="/tasks/:id" element={<TaskDetail />} />
</Routes>
```

---

## Navigation Rules

Use ONLY:

* `<Link>`
* `useNavigate`

❌ Avoid:

```html
<a href="/tasks">
```

---

## Dynamic Route Required

Example:

```jsx
const { id } = useParams();
```

---

# 9. CSS Modules Rules

Global CSS-only styling is NOT allowed.

✅ Correct

```jsx
import styles from "./Button.module.css";

<button className={styles.button}>
```

❌ Incorrect

```jsx
import "./global.css";
```

---

# 10. Environment Variables Rules

API URLs MUST be stored in `.env`

Example:

```env
VITE_API_URL=https://api.example.com
```

❌ NEVER hard-code URLs

```js
fetch("https://api.example.com/tasks")
```

---

# 11. Deployment Rules

## Vercel Deployment Required

Requirements:

* Build without errors
* Public live URL
* Environment variables configured
* Auto-deploy enabled

---

# 12. README Requirements

README.md MUST include:

* Project name
* Project description
* Team member names
* Live URL
* Features list
* Tech stack
* Local setup instructions
* API information

---

# 13. Git Rules

## Minimum Commits

At least:

* 5 commits required

Penalty for fewer commits:

-5 points

---

# 14. Penalties

| Violation                             | Penalty             |
| ------------------------------------- | ------------------- |
| Hard-coded API URL/key                | -10                 |
| Less than 5 commits                   | -5                  |
| Missing README                        | -5                  |
| Using Class Components                | -5 per component    |
| Copying AI code without understanding | Up to 50% deduction |

---

# 15. Bonus Points

| Feature        | Bonus |
| -------------- | ----- |
| TypeScript     | +5    |
| RTK Query      | +3    |
| createSelector | +3    |

Maximum bonus: +11

---

# 16. Grading Rubric

| Category                       | Score |
| ------------------------------ | ----- |
| Project Setup & Architecture   | 10    |
| UI & React Components          | 15    |
| React Router & Navigation      | 10    |
| Redux Toolkit State Management | 25    |
| API Integration                | 20    |
| Forms & User Interaction       | 10    |
| Deployment                     | 10    |

Total: 100

---

# 17. Passing Criteria

| Grade     | Score |
| --------- | ----- |
| Pass      | ≥ 50  |
| Good      | ≥ 70  |
| Very Good | ≥ 85  |
| Excellent | ≥ 95  |

---

# 18. Key Exam Concepts

## React

* JSX rules
* useState
* useEffect
* Controlled components
* Props vs State
* Lifting state
* useContext
* React Router
* CSS Modules

---

## Redux Toolkit

* Redux principles
* createSlice
* Immer
* useSelector
* useDispatch
* createAsyncThunk
* extraReducers
* createSelector
* RTK Query
* Optimistic Updates

---

# 19. Recommended Tech Stack

* React
* Redux Toolkit
* React Router
* CSS Modules
* Axios or Fetch API
* Vite
* Vercel

---

# 20. Recommended Workflow

1. Setup project with Vite
2. Configure Redux store
3. Setup routing
4. Create feature folders
5. Connect API
6. Implement CRUD
7. Add loading/error handling
8. Add validation
9. Test production build
10. Deploy to Vercel

---

# 21. Final Checklist

## Before Submission

* [ ] Minimum 3 routes
* [ ] Minimum 2 Redux slices
* [ ] Full CRUD working
* [ ] API connected
* [ ] Loading & error UI implemented
* [ ] CSS Modules used
* [ ] `.env` configured
* [ ] No console errors
* [ ] README completed
* [ ] Live Vercel URL working
* [ ] Minimum 5 commits
* [ ] Production build successful

---

```
```
