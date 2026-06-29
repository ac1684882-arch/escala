import { cleanupTestUsers } from './helpers/auth';

export default async function globalTeardown() {
  await cleanupTestUsers();
}
