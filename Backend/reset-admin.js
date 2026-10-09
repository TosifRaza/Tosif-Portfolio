// Force-create or reset the admin account directly in the configured database.
// Usage:  node reset-admin.js [email] [password]
// Uses ADMIN_EMAIL / ADMIN_PASSWORD from .env when arguments are omitted.
// The password is hashed by the User model's pre-save hook.
import 'dotenv/config';
import { connectDB, closeDB } from './config/db.js';
import User from './models/User.js';

const EMAIL = (process.argv[2] || process.env.ADMIN_EMAIL || 'admin@founderos.dev').toLowerCase();
const PASSWORD = process.argv[3] || process.env.ADMIN_PASSWORD || 'admin123';

const run = async () => {
  await connectDB();
  const admin = await User.findOne({ email: EMAIL });
  if (admin) {
    admin.password = PASSWORD; // re-hashed on save
    admin.role = 'admin';
    await admin.save();
    console.log(`[reset-admin] existing admin updated → ${EMAIL} / ${PASSWORD}`);
  } else {
    await User.create({ name: 'Tosif Raza', email: EMAIL, password: PASSWORD, role: 'admin' });
    console.log(`[reset-admin] admin created → ${EMAIL} / ${PASSWORD}`);
  }
  await closeDB();
  process.exit(0);
};

run().catch((e) => {
  console.error('[reset-admin] failed:', e.message);
  process.exit(1);
});
