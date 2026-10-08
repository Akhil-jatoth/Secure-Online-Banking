import { logger } from '../config/logger.js';
import nodemailer from 'nodemailer';

export class EmailService {
  /**
   * Sends a formal Indian Banking OTP Email via Brevo (REST API or SMTP Relay)
   */
  static async sendOTPEmail({ email, fullName = 'Customer', otpCode, purpose = 'LOGIN', expiryMinutes = 5 }) {
    const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
    const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'akhiljt1166@gmail.com').trim();
    const senderName = process.env.BREVO_SENDER_NAME || 'Suraksha Bank Alerts';

    const purposeTitle = {
      LOGIN: 'Login & Session Verification',
      TRANSFER: 'Fund Transfer Authorization',
      ADD_BENEFICIARY: 'Add New Beneficiary Verification',
      DELETE_BENEFICIARY: 'Remove Beneficiary Authorization',
      CHANGE_PASSWORD: 'Password Modification Verification',
      RESET_PASSWORD: 'Password Reset Request',
    }[purpose] || 'Security Verification';

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Suraksha Bank Security Verification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0f9ff; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #bae6fd; box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.15); }
        .header { background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); padding: 30px 25px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 12px; opacity: 0.9; font-weight: 500; }
        .content { padding: 30px 25px; }
        .greeting { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .message { font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #0369a1; letter-spacing: 1px; margin-bottom: 8px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #0284c7; }
        .expiry { font-size: 11px; color: #64748b; margin-top: 8px; }
        .warning-card { background: #fff1f2; border-left: 4px solid #f43f5e; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-top: 24px; font-size: 12px; color: #9f1239; line-height: 1.5; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
        .footer p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SURAKSHA BANK</h1>
          <p>सुरक्षा आपकी, विश्वास हमारा • India's Trusted Digital Bank</p>
        </div>
        <div class="content">
          <div class="greeting">Namaste ${fullName},</div>
          <div class="message">
            We received a request for <strong>${purposeTitle}</strong> on your Suraksha NetBanking Account. Please use the One Time Password (OTP) below to authenticate your request.
          </div>
          
          <div class="otp-box">
            <div class="otp-label">Your One Time Password (OTP)</div>
            <div class="otp-code">${otpCode}</div>
            <div class="expiry">Valid for <strong>${expiryMinutes} minutes</strong> • Do not share with anyone</div>
          </div>

          <div class="warning-card">
            <strong>🔒 Security Advisory:</strong> Suraksha Bank never asks for your OTP, password, PIN, or CVV over phone call, SMS, or email. If you did not initiate this request, please contact our 24x7 helpline immediately.
          </div>
        </div>
        <div class="footer">
          <p><strong>Suraksha Bank of India</strong> • Nariman Point Main Branch, Mumbai - 400021</p>
          <p>This is an automated system notification. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // 1. If key starts with xsmtpsib- -> Send via Brevo SMTP Relay
    if (brevoApiKey.startsWith('xsmtpsib-')) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp-relay.brevo.com',
          port: 587,
          secure: false,
          auth: {
            user: senderEmail,
            pass: brevoApiKey,
          },
        });

        const info = await transporter.sendMail({
          from: `"${senderName}" <${senderEmail}>`,
          to: email,
          subject: `Suraksha Bank - OTP: ${otpCode} for ${purposeTitle}`,
          html: htmlContent,
        });

        logger.info(`[BREVO SMTP EMAIL SENT] Real OTP email sent to ${email} (MessageId: ${info.messageId})`);
        return {
          success: true,
          provider: 'BREVO_SMTP',
          messageId: info.messageId,
        };
      } catch (err) {
        logger.error(`[BREVO SMTP ERROR] Failed to send via SMTP relay: ${err.message}`);
      }
    }

    // 2. If key starts with xkeysib- -> Send via Brevo REST HTTP API
    if (brevoApiKey && brevoApiKey.startsWith('xkeysib-')) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: {
              name: senderName,
              email: senderEmail,
            },
            to: [
              {
                email: email,
                name: fullName || 'Customer',
              },
            ],
            subject: `Suraksha Bank - OTP: ${otpCode} for ${purposeTitle}`,
            htmlContent: htmlContent,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          logger.info(`[BREVO HTTP EMAIL SENT] Real OTP email sent to ${email} (MessageId: ${data.messageId})`);
          return {
            success: true,
            provider: 'BREVO_HTTP',
            messageId: data.messageId,
          };
        } else {
          const errorText = await response.text();
          logger.warn(`[BREVO HTTP WARNING] Brevo rejected request (${response.status}): ${errorText}`);
        }
      } catch (err) {
        logger.error(`[BREVO HTTP ERROR] Failed to connect to Brevo API: ${err.message}`);
      }
    }

    logger.info(`[OTP SIMULATION] Brevo delivery fallback for ${email}.`);
    return {
      success: true,
      provider: 'SIMULATION',
    };
  }
}
