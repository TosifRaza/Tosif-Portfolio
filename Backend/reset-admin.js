import 'dotenv/config';
import { connectDB, closeDB } from './config/db.js';
import User from './models/User.js';

const EMAIL = process.env.ADMIN_EMAIL || 'admin@founderos.dev';
const PASSWORD = process.env.ADMIN_PASSWORD;

const run = async () => {
  if (!PASSWORD || PASSWORD.length < 12 || ['ChangeMe!2026', 'admin123'].includes(PASSWORD)) {
    throw new Error('Set ADMIN_PASSWORD to a unique password of at least 12 characters before running this script');
  }
  await connectDB();
  const admin = await User.findOne({ email: EMAIL });
  if (admin) {
    admin.password = PASSWORD;   // re-hashed by the User pre-save hook
    admin.role = 'admin';
    await admin.save();
    console.log(`[reset-admin] password updated for ${EMAIL}`);
  } else {
    await User.create({ name: 'Tosif Raza', email: EMAIL, password: PASSWORD, role: 'admin' });
    console.log(`[reset-admin] admin created for ${EMAIL}`);
  }
  await closeDB();
  process.exit(0);
};
run().catch((e) => { console.error(e); process.exit(1); });
