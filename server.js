import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import { fileURLToPath } from 'url';
import path from 'path';
import { testConnection } from './src/models/db.js';
import router from './src/routes.js';

const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-session-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use((req, res, next) => {
  if (NODE_ENV === 'development') {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

app.use((req, res, next) => {
  res.locals.user = null;
  res.locals.isLoggedIn = false;
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
    res.locals.isLoggedIn = true;
  }

  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  if (req.query.loggedOut === 'true') {
    res.locals.successMessages.push('You have logged out.');
  }

  res.locals.NODE_ENV = NODE_ENV;
  next();
});

app.use(router);

app.use((req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error('Error occurred:', err.message);
  if (NODE_ENV === 'development') {
    console.error('Stack trace:', err.stack);
  }

  const status = err.status || 500;
  const template = status === 404 ? '404' : '500';
  const context = {
    title: status === 404 ? 'Page Not Found' : 'Server Error',
    error: err.message,
    stack: err.stack
  };

  res.status(status).render(`errors/${template}`, context);
});

app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
});
