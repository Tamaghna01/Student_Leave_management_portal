/**
 * fix-passwords.js
 * Run this once to fix the seed user passwords in NeonDB.
 * Usage: node fix-passwords.js
 */
require('dotenv').config();
const { Pool }  = require('pg');
const bcrypt    = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function fixPasswords() {
  console.log('🔧 Fixing seed account passwords...\n');

  const accounts = [
    { email: 'faculty@college.edu', password: 'Faculty@123' },
    { email: 'alice@student.edu',   password: 'Student@123' },
    { email: 'bob@student.edu',     password: 'Student@123' },
  ];

  for (const account of accounts) {
    const hash = await bcrypt.hash(account.password, 10);
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING email, role',
      [hash, account.email]
    );
    if (result.rows.length > 0) {
      const { email, role } = result.rows[0];
      console.log(`✅ Updated: ${email} (${role})  →  password: ${account.password}`);
    } else {
      console.log(`⚠️  Not found: ${account.email} — run schema.sql first!`);
    }
  }

  await pool.end();
  console.log('\n✅ Done! You can now log in with the demo accounts.');
}

fixPasswords().catch((err) => {
  console.error('❌ Error:', err.message);
  pool.end();
  process.exit(1);
});
