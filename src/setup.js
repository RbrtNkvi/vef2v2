import { createUser } from './lib/users.js';

async function create() {
  // TODO setja upp gagnagrun + gögn
  createUser('admin', '123');
}

create().catch((err) => {
  console.error('Error creating running setup', err);
});
