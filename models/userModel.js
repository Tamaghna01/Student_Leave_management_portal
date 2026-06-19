import pool from '@/db';

const UserModel = {
  /**
   * Find a user by their email address
   */
  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by their ID
   */
  async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new user
   */
  async create({ name, email, password, role = 'student' }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, password, role]
    );
    return result.rows[0];
  },

  /**
   * Update user details (e.g. name, password)
   */
  async update(id, { name, password }) {
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           password = COALESCE($2, password)
       WHERE id = $3
       RETURNING id, name, email, role, created_at`,
      [name, password, id]
    );
    return result.rows[0];
  },

  /**
   * Check if an email already exists
   */
  async emailExists(email) {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0;
  },
};

export default UserModel;
