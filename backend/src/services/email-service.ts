// ==============================================================================
// Email Service — Verification & Reset Emails
// ==============================================================================

import { config } from '../config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (config.RESEND_API_KEY) {
    return sendViaResend(options);
  }

  if (config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS) {
    return sendViaSmtp(options);
  }

  console.warn(`[Email] No email config, would send to ${options.to}: ${options.subject}`);
}

async function sendViaResend(options: EmailOptions): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.EMAIL_FROM,
      to: [options.to],
      subject: options.subject,
      html: options.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[Email] Resend error (${res.status}): ${body}`);
  }

  const data = await res.json();
  console.log(`[Email] Sent via Resend (id=${data.id})`);
}

async function sendViaSmtp(options: EmailOptions): Promise<void> {
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT ?? 587,
    secure: config.SMTP_PORT === 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: config.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  console.log(`[Email] Sent via SMTP to ${options.to}`);
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${config.CORS_ORIGIN}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Email verifizieren — Job-Pal',
    html: `
      <h1>Willkommen bei Job-Pal!</h1>
      <p>Bitte verifizieren Sie Ihre E-Mail-Adresse:</p>
      <a href="${verifyUrl}" style="padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:4px;">
        Verifizieren
      </a>
      <p>oder klicken Sie auf: ${verifyUrl}</p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${config.CORS_ORIGIN}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Passwort zurücksetzen — Job-Pal',
    html: `
      <h1>Passwort zurücksetzen</h1>
      <p>Klicken Sie auf den Link, um Ihr Passwort zurückzusetzen:</p>
      <a href="${resetUrl}" style="padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:4px;">
        Zurücksetzen
      </a>
      <p>oder öffnen Sie: ${resetUrl}</p>
    `,
  });
}
