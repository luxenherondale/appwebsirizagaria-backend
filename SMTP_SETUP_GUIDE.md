# SMTP Email Setup Guide

## Overview

The backend is now configured to send emails directly to users' mailboxes using nodemailer with SMTP. This guide explains how to configure your SMTP provider and get emails working.

---

## Installation

Nodemailer has been added to `package.json`. Install it with:

```bash
npm install
```

Or install directly:

```bash
npm install nodemailer@6.9.7
```

---

## Configuration

### Step 1: Choose Your SMTP Provider

Select one of the providers below and follow its configuration steps.

#### Option A: Gmail (Recommended for Testing)

**Requirements:**
- Google account
- 2-Factor Authentication enabled
- App Password generated

**Setup Steps:**

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
3. Update `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM=your-email@gmail.com
   ```

#### Option B: Outlook/Hotmail

**Setup:**

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
```

#### Option C: SendGrid

**Requirements:**
- SendGrid account (free tier available)
- API Key

**Setup:**

1. Create account at https://sendgrid.com
2. Generate API Key in Settings > API Keys
3. Update `.env`:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASSWORD=SG.your-api-key-here
   EMAIL_FROM=your-verified-email@example.com
   ```

#### Option D: AWS SES

**Requirements:**
- AWS account
- SES verified email address
- SMTP credentials

**Setup:**

1. Go to AWS SES console
2. Verify your email address
3. Create SMTP credentials
4. Update `.env`:
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-smtp-username
   SMTP_PASSWORD=your-smtp-password
   EMAIL_FROM=your-verified-email@example.com
   ```

#### Option E: Custom SMTP Server

For any other SMTP provider, update `.env` with their credentials:

```env
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
EMAIL_FROM=sender@example.com
```

**Note:** 
- `SMTP_SECURE=true` for port 465 (SSL)
- `SMTP_SECURE=false` for port 587 (TLS)

---

## Step 2: Update Environment Variables

Edit `.env` file with your SMTP credentials:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com          # Your SMTP server
SMTP_PORT=587                     # Usually 587 (TLS) or 465 (SSL)
SMTP_SECURE=false                 # true for 465, false for 587
SMTP_USER=your-email@gmail.com    # SMTP username
SMTP_PASSWORD=your-app-password   # SMTP password or API key
EMAIL_FROM=noreply@sirizagaria.com # Sender email address
```

---

## Step 3: Test the Configuration

### Test SMTP Connection

Create a test file `test-email.js`:

```javascript
const emailSender = require('./utils/emailSender');

async function testEmail() {
  // Initialize email service
  emailSender.initialize();

  // Verify connection
  const verification = await emailSender.verifyConnection();
  console.log('Connection verification:', verification);

  // Send test email
  const result = await emailSender.sendEmail(
    'test@example.com',
    'Test Email from Siriza Agaria',
    '<h1>Test Email</h1><p>This is a test email.</p>'
  );

  console.log('Send result:', result);
}

testEmail().catch(console.error);
```

Run the test:

```bash
node test-email.js
```

### Test with Template

```javascript
const emailSender = require('./utils/emailSender');
const Order = require('./models/order');

async function testTemplateEmail() {
  emailSender.initialize();

  // Get a test order from database
  const order = await Order.findOne();

  if (!order) {
    console.log('No orders found. Create one first.');
    return;
  }

  // Send confirmation email
  const result = await emailSender.sendOrderConfirmationEmail(
    order,
    'test@example.com'
  );

  console.log('Template email result:', result);
}

testTemplateEmail().catch(console.error);
```

---

## Step 4: Integration with API

The email system is already integrated into the payment endpoints. When you call:

```bash
POST /api/payment/send-confirmation/{order_id}
```

With proper authentication, emails will be sent using your configured SMTP provider.

---

## Troubleshooting

### Email Service Not Initialized

**Error:** `Email service not configured. Check SMTP settings.`

**Solution:**
1. Verify `.env` file has all required variables:
   - `SMTP_HOST`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
2. Restart the server after updating `.env`
3. Check console logs for initialization messages

### SMTP Connection Failed

**Error:** `Error: connect ECONNREFUSED`

**Solution:**
1. Verify SMTP host is correct
2. Check SMTP port (usually 587 or 465)
3. Ensure firewall allows outbound connections
4. For Gmail: Verify App Password is correct (not regular password)

### Authentication Failed

**Error:** `Error: Invalid login: 535 5.7.8 Username and password not accepted`

**Solution:**
1. For Gmail: Use App Password, not regular password
2. For other providers: Verify username/password are correct
3. Check if account has SMTP access enabled
4. For SendGrid: Username must be `apikey` (literal text)

### Email Not Received

**Possible causes:**
1. Check spam/junk folder
2. Verify recipient email is correct
3. Check SMTP provider's sending limits
4. Review provider's email logs for bounce/rejection
5. Verify sender email is verified with provider

### Port Issues

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:587`

**Solution:**
1. For TLS (recommended): Use port 587, set `SMTP_SECURE=false`
2. For SSL: Use port 465, set `SMTP_SECURE=true`
3. Check firewall allows outbound on chosen port

---

## Email Sending Flow

```
POST /api/payment/send-confirmation/{order_id}
    ↓
Payment Controller
    ↓
Email Sender (emailSender.js)
    ↓
Nodemailer SMTP Transport
    ↓
SMTP Server (Gmail, SendGrid, etc.)
    ↓
User's Mailbox
```

---

## API Endpoint Usage

### Send Confirmation Email

```bash
curl -X POST http://localhost:5000/api/payment/send-confirmation/SA123ABC \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_JWT_TOKEN" \
  -d '{
    "email": "customer@example.com",
    "template": "order-confirmation"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "email_sent_to": "customer@example.com",
  "order_id": "SA123ABC",
  "status": "confirmed",
  "template": "order-confirmation",
  "messageId": "<message-id@smtp-server>"
}
```

### Available Templates

- `order-confirmation` - Order confirmation email
- `transfer-confirmation` - Bank transfer confirmation
- `shipping-notification` - Shipping notification with tracking

---

## Email Templates

Three professional HTML email templates are included:

1. **order-confirmation.html** - Sent when order is confirmed
   - Order details and items
   - Pricing breakdown
   - Shipping address
   - Customer notes

2. **transfer-confirmation.html** - Sent when bank transfer is confirmed
   - Transfer confirmation details
   - Order information
   - Admin notes

3. **shipping-notification.html** - Sent when order is shipped
   - Tracking number (prominent)
   - Order details
   - Estimated delivery
   - Tracking URL

All templates are:
- Responsive (mobile-friendly)
- Professionally styled
- Localized in Spanish
- Support dynamic data interpolation

---

## Security Best Practices

1. **Never commit credentials** - Keep `.env` out of version control
2. **Use environment variables** - All SMTP config from `.env`
3. **Use App Passwords** - For Gmail, use App Password not regular password
4. **Verify sender email** - Most providers require sender email verification
5. **Limit sending rate** - Check provider's rate limits
6. **Monitor logs** - Review email sending logs for issues
7. **Validate input** - Email addresses are validated before sending

---

## Production Deployment

### Before Going Live

1. ✅ Test with real SMTP provider
2. ✅ Verify sender email address with provider
3. ✅ Check sending limits and quotas
4. ✅ Set up email bounce/complaint handling
5. ✅ Configure proper `EMAIL_FROM` address
6. ✅ Test all email templates
7. ✅ Monitor email delivery rates

### Recommended Providers for Production

- **SendGrid** - Reliable, good free tier, excellent documentation
- **AWS SES** - Scalable, cost-effective, integrates with AWS
- **Mailgun** - Developer-friendly, good API
- **Postmark** - Transactional email specialist

---

## Monitoring and Logs

Check server logs for email sending status:

```bash
# Watch logs in real-time
tail -f server.log

# Look for email-related messages
grep -i "email\|smtp" server.log
```

Successful email sending shows:
```
✅ Email sent to customer@example.com. Message ID: <message-id>
```

---

## Support

For issues with:
- **Nodemailer**: https://nodemailer.com/
- **Gmail SMTP**: https://support.google.com/mail/answer/7126229
- **SendGrid**: https://sendgrid.com/docs/
- **AWS SES**: https://docs.aws.amazon.com/ses/

---

## Summary

Your email system is now ready to:
- ✅ Send order confirmation emails
- ✅ Send transfer confirmation emails
- ✅ Send shipping notifications
- ✅ Support multiple SMTP providers
- ✅ Use professional HTML templates
- ✅ Deliver directly to user mailboxes

Configure your SMTP provider in `.env` and start sending emails!
