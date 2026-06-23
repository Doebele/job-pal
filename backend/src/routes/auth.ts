// ==============================================================================
// Auth Routes — /register, /login, /logout, /me
// ==============================================================================

import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { users, passwordResets } from '../models/schema';
import { createToken, hashRegistrationPassword, comparePassword } from '../services/auth-service';
import { generateResetToken } from '../services/auth-service';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email-service';
import { and, eq } from 'drizzle-orm';

const router = new Hono();

const TOKEN_PURPOSE = {
  emailVerification: 'email_verification',
  passwordReset: 'password_reset',
} as const;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['student', 'employer']),
});

// POST /api/auth/register
router.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }

    const { email, password, role } = parsed.data;

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    const passwordHash = await hashRegistrationPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        role,
        isActive: true,
        isEmailVerified: false,
      })
      .returning();

    // Store verification token in password_resets table (reuses the same schema)
    const verifyToken = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.insert(passwordResets).values({
      userId: user.id,
      token: verifyToken,
      purpose: TOKEN_PURPOSE.emailVerification,
      expiresAt,
    });

    try {
      await sendVerificationEmail(user.email, verifyToken);
    } catch (emailErr) {
      console.warn('[Auth] Verification email failed (registration still succeeds):', emailErr);
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return c.json({
      message: 'Registration successful. Please check your email for verification.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }, 201);
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/auth/login
router.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }

    const { email, password } = parsed.data;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    if (!user.isActive) {
      return c.json({ error: 'Account deactivated' }, 403);
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/auth/logout
router.post('/logout', async (c) => {
  // Stateless JWT — client-side invalidation
  return c.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', async (c) => {
  const user = (c as any).user;
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json({ user });
});

// ==============================================================================
// POST /api/auth/forgot-password — Request password reset email
// ==============================================================================

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

router.post('/forgot-password', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!user) {
      return c.json({ message: 'Falls die E-Mail registriert ist, erhalten Sie einen Link zum Zurücksetzen.' });
    }

    const token = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await db.insert(passwordResets).values({
      userId: user.id,
      token,
      purpose: TOKEN_PURPOSE.passwordReset,
      expiresAt,
    });

    await sendPasswordResetEmail(user.email, token);

    return c.json({ message: 'Falls die E-Mail registriert ist, erhalten Sie einen Link zum Zurücksetzen.' });
  } catch (error) {
    console.error('[Auth] Forgot password error:', error);
    return c.json({ error: 'Interner Fehler' }, 500);
  }
});

// ==============================================================================
// POST /api/auth/reset-password — Reset password with token
// ==============================================================================

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

router.post('/reset-password', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }

    const [reset] = await db
      .select()
      .from(passwordResets)
      .where(and(
        eq(passwordResets.token, parsed.data.token),
        eq(passwordResets.purpose, TOKEN_PURPOSE.passwordReset),
      ))
      .limit(1);

    if (!reset || new Date(reset.expiresAt) < new Date()) {
      return c.json({ error: 'Token ungültig oder abgelaufen' }, 400);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, reset.userId))
      .limit(1);

    if (!user) {
      return c.json({ error: 'Benutzer nicht gefunden' }, 404);
    }

    const passwordHash = await hashRegistrationPassword(parsed.data.newPassword);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    await db
      .delete(passwordResets)
      .where(eq(passwordResets.id, reset.id));

    return c.json({ message: 'Passwort erfolgreich zurückgesetzt' });
  } catch (error) {
    console.error('[Auth] Reset password error:', error);
    return c.json({ error: 'Interner Fehler' }, 500);
  }
});

// ==============================================================================
// POST /api/auth/verify-email — Verify email with token
// ==============================================================================

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

router.post('/verify-email', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = verifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }

    const [reset] = await db
      .select()
      .from(passwordResets)
      .where(and(
        eq(passwordResets.token, parsed.data.token),
        eq(passwordResets.purpose, TOKEN_PURPOSE.emailVerification),
      ))
      .limit(1);

    if (!reset || new Date(reset.expiresAt) < new Date()) {
      return c.json({ error: 'Token ungültig oder abgelaufen' }, 400);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, reset.userId))
      .limit(1);

    if (!user) {
      return c.json({ error: 'Benutzer nicht gefunden' }, 404);
    }

    await db
      .update(users)
      .set({ isEmailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    await db
      .delete(passwordResets)
      .where(eq(passwordResets.id, reset.id));

    return c.json({ message: 'E-Mail erfolgreich verifiziert' });
  } catch (error) {
    console.error('[Auth] Verify email error:', error);
    return c.json({ error: 'Interner Fehler' }, 500);
  }
});

export default router;
