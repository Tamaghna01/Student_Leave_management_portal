const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// 1. Manually load environment variables from the root .env file
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.slice(0, equalIndex).trim();
        let val = trimmed.slice(equalIndex + 1).trim();
        // Remove surrounding quotes if any
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
}

// Check database URL
if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL not found in .env file.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Usage:\n  node scripts/add-faculty.js <email> \"<Faculty Name>\"\n");
    console.log("Example:\n  node scripts/add-faculty.js prof.jones@college.edu \"Prof. Indiana Jones\"\n");
    process.exit(1);
  }

  const [email, name] = args;

  try {
    // Insert with a placeholder password which will be updated when the faculty member registers on the website
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, 'PRE_SEEDED_PLACEHOLDER_PASS', 'faculty')
       RETURNING id, name, email, role`,
      [name, email]
    );

    console.log("\n✅ Successfully pre-seeded Faculty member!");
    console.log("--------------------------------------------");
    console.log(`ID:        ${result.rows[0].id}`);
    console.log(`Name:      ${result.rows[0].name}`);
    console.log(`Email:     ${result.rows[0].email}`);
    console.log(`Role:      ${result.rows[0].role}`);
    console.log("--------------------------------------------");
    console.log("This faculty member can now register on the portal using this email to set their own password.\n");

  } catch (err) {
    if (err.code === '23505') {
      console.error(`\n❌ Error: An account with the email "${email}" already exists in the database.\n`);
    } else {
      console.error("\n❌ Database error:", err.message, "\n");
    }
  } finally {
    await pool.end();
  }
}

main();
