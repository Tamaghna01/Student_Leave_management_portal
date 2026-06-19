const pool = require('../config/db');

const LeaveModel = {
  /**
   * Create a new leave request
   */
  async create({ studentId, leaveType, startDate, endDate, reason }) {
    const result = await pool.query(
      `INSERT INTO leave_requests (student_id, leave_type, start_date, end_date, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [studentId, leaveType, startDate, endDate, reason]
    );
    return result.rows[0];
  },

  /**
   * Get all leave requests for a specific student
   */
  async findByStudentId(studentId) {
    const result = await pool.query(
      `SELECT * FROM leave_requests
       WHERE student_id = $1
       ORDER BY applied_at DESC`,
      [studentId]
    );
    return result.rows;
  },

  /**
   * Get all pending leave requests with student info (for faculty)
   */
  async findAllPending() {
    const result = await pool.query(
      `SELECT
         lr.*,
         u.name   AS student_name,
         u.email  AS student_email
       FROM leave_requests lr
       JOIN users u ON lr.student_id = u.id
       WHERE lr.status = 'pending'
       ORDER BY lr.applied_at ASC`
    );
    return result.rows;
  },

  /**
   * Get a single leave request by ID
   */
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM leave_requests WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Update status and faculty remark for a leave request
   */
  async updateStatus(id, status, facultyRemark) {
    const result = await pool.query(
      `UPDATE leave_requests
       SET status = $1, faculty_remark = $2
       WHERE id = $3
       RETURNING *`,
      [status, facultyRemark || null, id]
    );
    return result.rows[0];
  },

  /**
   * Get aggregate statistics for faculty dashboard
   */
  async getStats() {
    const result = await pool.query(
      `SELECT
         COUNT(*)                                            AS total,
         COUNT(*) FILTER (WHERE status = 'pending')         AS pending,
         COUNT(*) FILTER (WHERE status = 'approved')        AS approved,
         COUNT(*) FILTER (WHERE status = 'rejected')        AS rejected
       FROM leave_requests`
    );
    return result.rows[0];
  },

  /**
   * Get aggregate statistics for a specific student
   */
  async getStatsByStudentId(studentId) {
    const result = await pool.query(
      `SELECT
         COUNT(*)                                            AS total,
         COUNT(*) FILTER (WHERE status = 'pending')         AS pending,
         COUNT(*) FILTER (WHERE status = 'approved')        AS approved,
         COUNT(*) FILTER (WHERE status = 'rejected')        AS rejected
       FROM leave_requests
       WHERE student_id = $1`,
      [studentId]
    );
    return result.rows[0];
  },
};

module.exports = LeaveModel;
