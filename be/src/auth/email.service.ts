import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string, userName?: string): Promise<void> {
    const appName = 'GlobeNomad';
    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const supportEmail = 'shreylakhtaria@gmail.com';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@globenomad.com',
      to: email,
      subject: 'Password Reset Request',
      html: `<!-- Password Reset Email -->
<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Password reset</title>
  <style>
    @media (prefers-color-scheme: dark) {
      body, .bg { background: #0b0f17 !important; }
      .card { background: #111827 !important; }
      .text, a, p, h1, h2 { color: #e5e7eb !important; }
      .btn { background: #22c55e !important; color: #0b0f17 !important; }
    }
    @media only screen and (max-width: 600px) {
      .btn { display:block!important; width:100%!important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Use this link to reset your password. It expires in 1 hour.
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="bg" style="background:#f3f4f6;">
    <tr>
      <td align="center" style="padding:24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;">
          <tr>
            <td align="center" style="padding:8px 0 16px 0;">
              <a href="${appUrl}" style="text-decoration:none;color:#111827;font:600 18px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial;">
                ${appName}
              </a>
            </td>
          </tr>
          <tr>
            <td class="card" style="background:#ffffff;border-radius:14px;padding:28px 24px;border:1px solid #e5e7eb;">
              <h2 class="text" style="margin:0 0 12px 0;color:#111827;font:700 22px/1.2 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;">
                Password Reset Request
              </h2>
              <p class="text" style="margin:0 0 16px 0;color:#374151;font:400 15px/1.6 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;">
                Hi${userName ? ' ' + userName : ''}, we received a request to reset your <strong>${appName}</strong> password.
                Click the button below to choose a new one.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 10px 0;">
                <tr>
                  <td>
                    <a href="${resetUrl}" class="btn"
                       style="background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font:600 15px/1 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;display:inline-block;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p class="text" style="margin:12px 0 16px 0;color:#6b7280;font:400 13px/1.6 ui-sans-serif,system-ui;">
                If the button doesn’t work, copy and paste this URL into your browser:
                <br>
                <a href="${resetUrl}" style="color:#2563eb;word-break:break-all;text-decoration:underline;">
                  ${resetUrl}
                </a>
              </p>
              <p class="text" style="margin:0 0 12px 0;color:#374151;font:400 14px/1.6 ui-sans-serif,system-ui;">
                This link will expire in <strong>1 hour</strong> and can be used once. If you didn't request this, you can safely ignore this email.
              </p>
              <p class="text" style="margin:0;color:#6b7280;font:400 12px/1.6 ui-sans-serif,system-ui;">
                For help, contact us at <a href="mailto:${supportEmail}" style="color:#2563eb;">${supportEmail}</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 8px;color:#9ca3af;font:400 12px/1.6 ui-sans-serif,system-ui;">
              © ${new Date().getFullYear()} ${appName}. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`,
    };
    await this.transporter.sendMail(mailOptions);
  }
}