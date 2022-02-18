import { createSchema, dropSchema, insertSchema } from './lib/db.js';
import { createUser } from './lib/users.js';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
const INSERT_SCHEMA_FILE = './sql/insert.sql';

async function create() {

  insertSchema(INSERT_SCHEMA_FILE);
  dropSchema(DROP_SCHEMA_FILE);
  createSchema(SCHEMA_FILE);
  createUser('admin', '123');
}

create().catch((err) => {
  console.error('Error creating running setup', err);
});
