const express    = require('express');
const router     = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { allowStudent, allowFaculty } = require('../middleware/roleMiddleware');
const {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getStats,
} = require('../controllers/leaveController');

// All leave routes require authentication
router.use(authMiddleware);

// ── Student Routes ────────────────────────────────────────────
// POST   /api/leaves          - Apply for leave
router.post('/', allowStudent(), applyLeave);

// GET    /api/leaves/my       - Get own leave history
router.get('/my', allowStudent(), getMyLeaves);

// ── Faculty Routes ────────────────────────────────────────────
// GET    /api/leaves/stats    - Get aggregate statistics
router.get('/stats', allowFaculty(), getStats);

// GET    /api/leaves/pending  - Get all pending requests
router.get('/pending', allowFaculty(), getPendingLeaves);

// PATCH  /api/leaves/:id/approve
router.patch('/:id/approve', allowFaculty(), approveLeave);

// PATCH  /api/leaves/:id/reject
router.patch('/:id/reject', allowFaculty(), rejectLeave);

module.exports = router;
