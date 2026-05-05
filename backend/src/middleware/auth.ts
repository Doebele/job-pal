// ==============================================================================
// JWT Authentication Middleware
// ==============================================================================

import { MiddlewareHandler, Context } from 'hono';
import { verifyToken } from '../services/auth-service';
import type { JwtPayload } from '../services/auth-service';

export const authMiddleware: MiddlewareHandler = async (c: Context, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Attach user info to context
  (c as any).user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  await next();
};

export type AuthC = Context & { user: JwtPayload };
