import { createSchema, dropSchema} from './lib/db.js';
import { createUser } from './lib/users.js';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';

async function create() {
  dropSchema(DROP_SCHEMA_FILE);
  createSchema(SCHEMA_FILE);
  createSchema('./sql/schemaN.sql');
  createSchema('./sql/schemaS.sql');
  createUser('admin', '123');
}

create().catch((err) => {
  console.error('Error creating running setup', err);
});
