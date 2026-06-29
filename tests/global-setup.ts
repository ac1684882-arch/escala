import { ensureTestUsers } from './helpers/auth';

export default async function globalSetup() {
  await ensureTestUsers();
}
