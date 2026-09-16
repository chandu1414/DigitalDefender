import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = os.environ.get('SMTP_HOST', '').strip()
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', '').strip()
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '').strip()
SMTP_FROM = os.environ.get('SMTP_FROM', '').strip() or SMTP_USER or 'noreply@digitaldefender.io'

def is_smtp_configured():
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASSWORD)

def send_otp_email(to_email, to_name, otp_code):
    """
    Sends a 6-digit verification OTP email to the user.
    If SMTP is configured via environment variables, dispatches a real email.
    If SMTP is not configured, logs to console in simulation mode for local testing.
    """
    subject = f"{otp_code} is your DigitalDefender verification code"
    
    plain_text = f"""Hello {to_name},

Thank you for joining DigitalDefender.

Your verification code is: {otp_code}

This code will expire in 10 minutes. Please enter it on the signup screen to verify your email address and activate your account.

If you did not request this code, please safely ignore this email.

Stay Smarter. Stay Safer.
— DigitalDefender Security Team
"""

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070B14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070B14; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #0F172A; border: 1px solid #1E293B; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #1E293B;">
              <div style="display: inline-block; width: 44px; height: 44px; background: linear-gradient(135deg, #1FA8A0, #0f5b57); border-radius: 12px; line-height: 44px; text-align: center; font-size: 22px; color: #ffffff;">
                🛡️
              </div>
              <h1 style="margin: 12px 0 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Digital<span style="color: #1FA8A0;">Defender</span>
              </h1>
              <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8;">
                Cybersecurity &amp; Digital Safety
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #ffffff;">
                Confirm your email address
              </h2>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #CBD5E1;">
                Hello <strong style="color: #ffffff;">{to_name}</strong>, thank you for joining DigitalDefender. Please use the verification code below to complete your registration and activate access to all cybersecurity study notes:
              </p>

              <!-- OTP Code Display Box -->
              <div style="background-color: #070B14; border: 1px solid #1FA8A0; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #1FA8A0; margin-bottom: 6px;">
                  Your 6-Digit One-Time Code
                </div>
                <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', Courier, monospace;">
                  {otp_code}
                </div>
                <div style="font-size: 12px; color: #64748B; margin-top: 6px;">
                  Expires in 10 minutes (single-use)
                </div>
              </div>

              <p style="margin: 0 0 12px; font-size: 13px; line-height: 1.5; color: #94A3B8;">
                Never share this code with anyone. DigitalDefender administrators will never ask for your verification code or password.
              </p>
              <p style="margin: 0; font-size: 12px; color: #64748B;">
                If you did not sign up for an account on DigitalDefender, you can safely disregard this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px 28px; background-color: #090E1A; border-top: 1px solid #1E293B; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748B;">
                © 2026 DigitalDefender • Zero Tracking &amp; Plain Text Privacy
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    if is_smtp_configured():
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"DigitalDefender <{SMTP_FROM}>"
            msg['To'] = to_email
            
            msg.attach(MIMEText(plain_text, 'plain', 'utf-8'))
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))

            if SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=12)
            else:
                server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=12)
                server.starttls()

            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, [to_email], msg.as_string())
            server.quit()
            print(f"[EmailService] Real OTP email dispatched successfully to {to_email}")
            return {'success': True, 'mode': 'smtp'}
        except Exception as e:
            print(f"[EmailService ERROR] Failed to send email via SMTP ({e}). Falling back to simulation mode.")
            # Fallback to simulation mode if SMTP server is temporarily unreachable
            return {'success': True, 'mode': 'simulated', 'code': otp_code, 'smtp_error': str(e)}

    # Simulation / Dev mode when SMTP is not configured yet
    print(f"[EmailService - SIMULATION MODE] Destination: {to_email} | Name: {to_name} | OTP Code: {otp_code}")
    return {'success': True, 'mode': 'simulated', 'code': otp_code}
