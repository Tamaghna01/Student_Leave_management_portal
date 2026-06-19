/**
 * roleMiddleware - Restricts access based on user role
 * Must be used AFTER authMiddleware (req.user must be set)
 */

/**
 * allowRoles - Returns middleware that only allows specified roles
 * @param {...string} roles - Allowed roles (e.g., 'student', 'faculty')
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is restricted to: ${roles.join(', ')}.`,
      });
    }

    next();
  };
};

// Convenience helpers
const allowStudent = () => allowRoles('student');
const allowFaculty = () => allowRoles('faculty');

module.exports = { allowRoles, allowStudent, allowFaculty };
