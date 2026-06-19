/**
 * verifyRole - Verifies if the authenticated user has one of the allowed roles
 *
 * @param {object} user - Decoded user payload
 * @param {...string} roles - Allowed roles (e.g. 'student', 'faculty')
 * @returns {{ error?: string, status?: number } | null}
 */
export function verifyRole(user, ...roles) {
  if (!user) {
    return {
      error: 'Authentication required.',
      status: 401,
    };
  }

  if (!roles.includes(user.role)) {
    return {
      error: `Access denied. This route is restricted to: ${roles.join(', ')}.`,
      status: 403,
    };
  }

  return null;
}
