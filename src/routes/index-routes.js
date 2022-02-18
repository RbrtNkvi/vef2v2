import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { catchErrors } from '../lib/catch-errors.js';
import { eventSlug, listEvents, listRegistrations, insertSkraning } from '../lib/db.js';

export const indexRouter = express.Router();

async function indexRoute(req, res) {
  const events = await listEvents();

  res.render('index', {
    title: 'Viðburðasíðan',
    events,
    admin: false,
  });
}

indexRouter.get('/', catchErrors(indexRoute));

async function slugRoute(req, res) {

  const errors = [];
  const formData = {
    name: '',
    comment: '',
  };
  const { slug } = req.params;
  const registrations = await listRegistrations(slug)
  let slugEvent = [];

  slugEvent = await eventSlug(slug);
  const { title }= slugEvent[0].name;
  const { description } = slugEvent[0].description;

  res.render('slug', {
    errors,
    formData,
    title,
    description,
    slug,
    slugEvent,
    registrations,
  });
}

indexRouter.get('/:slug', catchErrors(slugRoute));

const validationMiddleware = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 64 })
    .withMessage('Nafn má að hámarki vera 64 stafir'),
  body('comment')
    .isLength({ max: 128 })
    .withMessage('Athugasemd má að hámarki vera 128 stafir'),
];

const xssSanitizationMiddleware = [
  body('name').customSanitizer((v) => xss(v)),
  body('comment').customSanitizer((v) => xss(v)),
];

async function validationCheck(req, res, next) {
  const {
    name, comment,
  } = req.body;

  const formData = {
    name, comment,
  };
  const { slug } = req.params;
  const registrations = await listRegistrations(slug);
  const slugEvent = await eventSlug(slug);
  const validation = validationResult(req);

  const { title }= slugEvent[0].name;
  const { description } = slugEvent[0].description;

  if (!validation.isEmpty()) {
    return res.render('slug', {
      slug,
      slugEvent,
      title,
      description,
      formData,
      errors: validation.errors,
      registrations
    });
  }

  return next();
}


async function register(req, res) {

  const { slug } = req.params;
  const event = await eventSlug(slug);
  const eventId = parseInt(event[0].id,10);

  const {
    name, comment,
  } = req.body;

  let success = true;

  try {
    success = await insertSkraning({
      name, comment, eventId,
    });
  } catch (e) {
    console.error(e);
  }

  if (success) {
    return res.redirect(slug);
  }

  return res.render('error', { title: 'Gat ekki skráð!', text: 'Hefurðu skráð þig áður?'});
}

indexRouter.post(
  '/:slug',
  validationMiddleware,
  xssSanitizationMiddleware,
  catchErrors(validationCheck),
  catchErrors(register),
)
