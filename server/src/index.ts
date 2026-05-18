import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import steamRoutes from './steamRoutes';
import authRoutes from './authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true, // Allow cookies for sessions
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'steam-project-secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false, // Set to true if using HTTPS
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/steam', steamRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', authenticated: req.isAuthenticated() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
