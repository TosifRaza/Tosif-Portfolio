import 'dotenv/config';
import { connectDB, closeDB } from './config/db.js';
import User from './models/User.js';

const EMAIL = process.env.ADMIN_EMAIL || 'admin@founderos.dev';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const run = async () => {
  await connectDB();
  const admin = await User.findOne({ email: EMAIL });
  if (admin) {
    admin.password = PASSWORD;   // re-hashed by the User pre-save hook
    admin.role = 'admin';
    await admin.save();
    console.log(`[reset-admin] updated → ${EMAIL} / ${PASSWORD}`);
  } else {
    await User.create({ name: 'Tosif Raza', email: EMAIL, password: PASSWORD, role: 'admin' });
    console.log(`[reset-admin] created → ${EMAIL} / ${PASSWORD}`);
  }
  await closeDB();
  process.exit(0);
};
run().catch((e) => { console.error(e); process.exit(1); });