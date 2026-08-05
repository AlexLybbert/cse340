import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { createUser, authenticateUser, getAllUsers } from '../models/users.js';
import { getVolunteerProjectsByUserId } from '../models/projects.js';

const SALT_ROUNDS = 10;

const userRegistrationValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .isLength({ max: 100 }).withMessage('Email cannot exceed 100 characters.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 7, max: 72 }).withMessage('Password must be between 7 and 72 characters.')
];

const showUserRegistrationForm = (req, res) => {
  res.render('register', {
    title: 'Register',
    user: {},
    errors: []
  });
};

const processUserRegistrationForm = async (req, res, next) => {
  const errors = validationResult(req).array();
  const user = {
    name: req.body.name,
    email: req.body.email
  };

  if (errors.length > 0) {
    return res.status(400).render('register', {
      title: 'Register',
      user,
      errors
    });
  }

  try {
    const passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    await createUser(req.body.name, req.body.email, passwordHash);
    return res.redirect('/');
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).render('register', {
        title: 'Register',
        user,
        errors: [{ msg: 'An account with that email already exists.' }]
      });
    }

    return next(error);
  }
};

const showLoginForm = (req, res) => {
  res.render('login', {
    title: 'Login',
    email: ''
  });
};

const processLoginForm = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await authenticateUser(email, password);

    if (!user) {
      req.flash('error', 'Login failed. Please check your email and password.');
      return res.redirect('/login');
    }

    req.session.user = user;
    req.flash('success', 'Login successful.');
    console.log('Logged in user:', user);
    return res.redirect('/dashboard');
  } catch (error) {
    return next(error);
  }
};

const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.flash('error', 'Please log in to access that page.');
    return res.redirect('/login');
  }

  return next();
};

const requireRole = (role, redirectTo = '/') => (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role_name === role) {
    return next();
  }

  req.flash('error', 'You do not have permission to access that page.');
  return res.redirect(redirectTo);
};

const showDashboard = async (req, res) => {
  const { name, email } = req.session.user;
  const volunteeredProjects = await getVolunteerProjectsByUserId(req.session.user.user_id);

  res.render('dashboard', {
    title: 'Dashboard',
    name,
    email,
    volunteeredProjects
  });
};

const showUsersPage = async (req, res) => {
  const users = await getAllUsers();

  res.render('users', {
    title: 'Registered Users',
    users
  });
};

const processLogout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie('connect.sid');
    return res.redirect('/login?loggedOut=true');
  });
};

export {
  showUserRegistrationForm,
  processUserRegistrationForm,
  userRegistrationValidation,
  showLoginForm,
  processLoginForm,
  processLogout,
  requireLogin,
  requireRole,
  showDashboard,
  showUsersPage
};
