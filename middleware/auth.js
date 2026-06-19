import jwt from 'jsonwebtoken';

/**
 * verifyAuth - Helper to authenticate API requests under Next.js App Router.
 * Extracts the Bearer token, verifies it, and returns the decoded payload.
 *
 * @param {Request} req - Next.js request object
 * @returns {Promise<{ user?: object, error?: string, status?: number }>}
 */
export async function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: 'Access denied. No token provided.',
      status: 401,
    };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: decoded }; // { id, name, email, role }
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return {
        error: 'Token has expired. Please log in again.',
        status: 401,
      };
    }
    return {
      error: 'Invalid token.',
      status: 401,
    };
  }
}
