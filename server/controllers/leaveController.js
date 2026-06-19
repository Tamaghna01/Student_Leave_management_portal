const LeaveModel = require('../models/leaveModel');

// ─────────────────────────────────────────────────────────────
// POST /api/leaves   (Student only)
// Apply for a new leave
// ─────────────────────────────────────────────────────────────
const applyLeave = async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;
    const studentId = req.user.id;

    // Validate required fields
    if (!leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields (leave_type, start_date, end_date, reason) are required.',
      });
    }

    const start = new Date(start_date);
    const end   = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format.' });
    }

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past.',
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be on or after the start date.',
      });
    }

    const leave = await LeaveModel.create({
      studentId,
      leaveType: leave_type,
      startDate: start_date,
      endDate:   end_date,
      reason,
    });

    return res.status(201).json({
      success: true,
      message:  'Leave application submitted successfully.',
      leave,
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/leaves/my   (Student only)
// Get logged-in student's leave history
// ─────────────────────────────────────────────────────────────
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveModel.findByStudentId(req.user.id);
    const stats  = await LeaveModel.getStatsByStudentId(req.user.id);

    return res.status(200).json({
      success: true,
      stats: {
        total:    parseInt(stats.total),
        pending:  parseInt(stats.pending),
        approved: parseInt(stats.approved),
        rejected: parseInt(stats.rejected),
      },
      leaves,
    });
  } catch (error) {
    console.error('Get my leaves error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/leaves/pending   (Faculty only)
// Get all pending leave requests with student info
// ─────────────────────────────────────────────────────────────
const getPendingLeaves = async (req, res) => {
  try {
    const leaves = await LeaveModel.findAllPending();
    return res.status(200).json({ success: true, leaves });
  } catch (error) {
    console.error('Get pending leaves error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/leaves/:id/approve   (Faculty only)
// ─────────────────────────────────────────────────────────────
const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_remark } = req.body;

    const leave = await LeaveModel.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Leave is already ${leave.status}. Only pending requests can be reviewed.`,
      });
    }

    const updated = await LeaveModel.updateStatus(id, 'approved', faculty_remark);

    return res.status(200).json({
      success: true,
      message: 'Leave request approved.',
      leave:   updated,
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/leaves/:id/reject   (Faculty only)
// ─────────────────────────────────────────────────────────────
const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_remark } = req.body;

    const leave = await LeaveModel.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Leave is already ${leave.status}. Only pending requests can be reviewed.`,
      });
    }

    const updated = await LeaveModel.updateStatus(id, 'rejected', faculty_remark);

    return res.status(200).json({
      success: true,
      message: 'Leave request rejected.',
      leave:   updated,
    });
  } catch (error) {
    console.error('Reject leave error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/leaves/stats   (Faculty only)
// Get aggregate leave statistics
// ─────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const stats = await LeaveModel.getStats();

    const total    = parseInt(stats.total);
    const pending  = parseInt(stats.pending);
    const approved = parseInt(stats.approved);
    const rejected = parseInt(stats.rejected);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        approvalPercentage:  total > 0 ? Math.round((approved / total) * 100) : 0,
        rejectionPercentage: total > 0 ? Math.round((rejected / total) * 100) : 0,
        pendingPercentage:   total > 0 ? Math.round((pending  / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getStats,
};
