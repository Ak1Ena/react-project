import { Router } from 'express';
import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: Express.User, done) => {
  done(null, obj);
});

passport.use(new SteamStrategy({
  returnURL: `http://localhost:3001/api/auth/steam/return`,
  realm: 'http://localhost:3001/',
  apiKey: process.env.STEAM_API_KEY || ''
}, (identifier: string, profile: Express.User, done: (err: Error | null, user?: Express.User) => void) => {
  // identifier is the OpenID 2.0 identifier
  // profile contains the user's Steam profile info
  process.nextTick(() => {
    (profile as any).identifier = identifier;
    return done(null, profile);
  });
}));

// Route to initiate Steam login
router.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }));

// Route to handle Steam return
router.get('/steam/return', 
  passport.authenticate('steam', { failureRedirect: `${FRONTEND_URL}/login?error=steam_failed` }),
  (_req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(`${FRONTEND_URL}/steam-success`);
  }
);

// Route to get the current authenticated user profile
router.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
});

export default router;
