import express from 'express';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { ensureLoggedIn } from '../lib/login.js';
import { catchErrors } from '../lib/catch-errors.js';
import { listEvents, insertVidburdur, eventSlug, updateVidburdur } from '../lib/db.js';
import { slugify } from '../lib/slug.js';

export const adminRouter = express.Router();

async function index(req, res) {
  const events = await listEvents();

  const { user } = req;
  const errors = [];
  const vidburdurData = {
    name: '',
    description: '',
  }

  return res.render('index', {
    user,
    events,
    title: 'Viðburða umsjón',
    admin: true,
    errors,
    vidburdurData,
  });
}

function login(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er birtum þau
  // og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', { message, title: 'Innskráning' });
}

const validationMiddleware = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 64 })
    .withMessage('Nafn má að hámarki vera 64 stafir'),
  body('description')
    .isLength({ max: 128 })
    .withMessage('Athugasemd má að hámarki vera 128 stafir'),
];

const xssSanitizationMiddleware = [
  body('name').customSanitizer((v) => xss(v)),
  body('description').customSanitizer((v) => xss(v)),
];

async function validationCheck(req, res, next) {
  const {
    name, description,
  } = req.body;

  const vidburdurData = {
    name, description,
  };

  const { user } = req;
  const events = await listEvents();
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.render('index', {
      user,
      events,
      title: 'Viðburða umsjón',
      admin: true,
      errors: validation.errors,
      vidburdurData,
    });
  }

  return next();
}

async function addEvent(req, res) {
  const {
    name, description,
  } = req.body;

  const slug = slugify(name)

  let success = true;

  try {
    success = await insertVidburdur({
      name, slug, description,
    });
  } catch (e) {
    console.error(e);
  }

  if (success) {
    return res.redirect('/admin');
  }

  return res.render('index', {
    title: 'Gat ekki skráð!',
    text: 'Hefurðu skráð þig áður?',
    admin: true
  });
}

async function adminSlugRoute(req, res) {
  const { user } = req;
  const errors = [];
  const vidburdurData = {
    name: '',
    description: '',
  };
  const { slug } = req.params;

  let slugEvent = [];

  slugEvent = await eventSlug(slug);
  const { title }= slugEvent[0].name;
  const { description } = slugEvent[0].description;

  res.render('adminslug', {
    user,
    errors,
    vidburdurData,
    title,
    description,
    slug,
    slugEvent,
    admin: true,
  });
}


async function validationUpdateCheck(req, res, next) {
  const {
    name, description,
  } = req.body;

  const vidburdurData = {
    name, description,
  };

  const { user } = req;
  const { slug } = req.params;
  const events = await eventSlug(slug);
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.render('adminslug', {
      user,
      events,
      title: 'Viðburða umsjón',
      admin: true,
      errors: validation.errors,
      vidburdurData,
    });
  }

  return next();
}
async function updateEvent(req, res) {
  const {
    name, description,
  } = req.body;

  const { slug } = req.params;
  const newSlug = slugify(name)

  let success = true;

  try {
    success = await updateVidburdur({
      name, newSlug, description, slug,
    });
  } catch (e) {
    console.error(e);
  }

  if (success) {
    return res.redirect(`/admin/${newSlug}`);
  }

  return res.render('adminslug', {
    title: 'Gat ekki skráð!',
    text: 'Hefurðu skráð þig áður?',
    admin: true
  });
}


adminRouter.get('/', ensureLoggedIn, catchErrors(index));
adminRouter.get('/login', login);

adminRouter.post(
  '/login',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.redirect('/admin');
  },
);

adminRouter.post(
  '/',
  validationMiddleware,
  xssSanitizationMiddleware,
  catchErrors(validationCheck),
  catchErrors(addEvent),
)

adminRouter.get('/logout', (req, res) => {
  // logout hendir session cookie og session
  req.logout();
  res.redirect('/');
});

adminRouter.get('/:slug', ensureLoggedIn, catchErrors(adminSlugRoute));

adminRouter.post(
  '/:slug',
  validationMiddleware,
  xssSanitizationMiddleware,
  catchErrors(validationUpdateCheck),
  catchErrors(updateEvent),
)
