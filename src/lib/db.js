import { readFile } from 'fs/promises';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
const INSERT_SCHEMA_FILE = './sql/insert.sql';

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    if (nodeEnv !== 'test') {
      console.error('unable to query', e);
    }
    return null;
  } finally {
    client.release();
  }
}

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return query(data.toString('utf-8'));
}

export async function insertSchema(insertFile = INSERT_SCHEMA_FILE) {
  const data = await readFile(insertFile);

  return query(data.toString('utf-8'));
}

export async function end() {
  await pool.end();
}

/* TODO útfæra aðgeðir á móti gagnagrunni */
export async function listEvents() {
  let result = [];

  try {
    const q = 'SELECT * FROM vidburdir';
    const queryResult = await query(q);

    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting events', e);
  }

  return result;
}

export async function listRegistrations(slug) {
  let result = [];

  try{
    const q = `
    SELECT skraningar.name AS name, skraningar.comment AS comment, vidburdir.name AS title, vidburdir.description AS description
    FROM skraningar
    JOIN vidburdir
    ON skraningar.event = vidburdir.id
    AND vidburdir.slug LIKE $1
    `;
    const queryResult = await query(q,[slug]);

    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }

  } catch (e) {
    console.error('Error selecting registrations', e)
  }
  return result;
}

export async function eventSlug(slug) {
  let result = [];

  try {
    const q = 'SELECT * FROM vidburdir WHERE vidburdir.slug LIKE $1';
    const queryResult = await query(q,[slug]);

    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting events', e);
  }

  return result;
}


export async function insertSkraning({
  name, comment, eventId,
} = {}) {
  let success = true;

  const q = `
    INSERT INTO skraningar
      (name, comment, event)
    VALUES
      ($1, $2, $3)
  `;

  const values = [name, comment, eventId];

  try {
    await query(q, values);
  } catch (e) {
    console.error('Error inserting registration', e);
    success = false;
  }

  return success;
}

export async function insertVidburdur({
  name, slug, description,
} = {})  {
  let success = true;

  const q = `
    INSERT INTO vidburdir
      (name, slug, description)
    VALUES
      ($1, $2, $3)
  `;

  const values = [name, slug, description];

  try {
    await query(q, values);
  } catch (e) {
    console.error('Error inserting event', e);
    success = false;
  }

  return success;
}

export async function updateVidburdur({
  name, newSlug, description, slug,
} = {}) {
  let success = true;

  const q = `
    UPDATE vidburdir SET name = '${name}', slug = '${newSlug}', description = '${description}'
    WHERE vidburdir.slug = '${slug}'
  `;

  try {
    await query(q);
  } catch (e) {
    console.error('Error inserting event', e);
    success = false;
  }

  return success;
}
