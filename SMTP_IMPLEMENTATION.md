# SMTP System Implementation Guide

## Overview

The SMTP system has been fully implemented with database-backed configuration, allowing administrators to manage email settings through API endpoints without modifying environment variables.

## Default Configuration

- **Host:** 
- **Port:** 587
- **Secure:** false (STARTTLS enabled)
- **User:** 
- **Password:** 
- **From Email:** 

## Components

### 1. Database Model (`models/smtpConfig.js`)

Stores SMTP configuration in MongoDB with the following fields:
- `host`: SMTP server hostname
- `port`: SMTP server port
- `secure`: Boolean for SSL/TLS (false = STARTTLS)
- `auth.user`: SMTP username
- `auth.pass`: SMTP password
- `from`: Sender email address
- `fromName`: Display name for sender
- `isActive`: Enable/disable email sending
- `createdAt`: Configuration creation timestamp
- `updatedAt`: Last modification timestamp

### 2. SMTP Manager (`utils/smtpManager.js`)

Utility class for managing SMTP configuration:
- `loadConfigFromDatabase()`: Load config from MongoDB
- `applyConfiguration(config)`: Apply config to environment and initialize emailSender
- `getCurrentConfig()`: Get current configuration
- `isConfigured()`: Check if SMTP is configured
- `verifyAndApply(config)`: Verify and apply configuration

### 3. Email Sender (`utils/emailSender.js`)

Enhanced with:
- Default SMTP configuration fallback
- STARTTLS support with TLS configuration
- Proper error handling and logging
- Connection verification
- Email sending with template support

### 4. API Endpoints (`routes/smtpConfig.js`)

All endpoints require authentication (JWT token in `x-auth-token` header) except `/status`:

#### GET `/api/smtp/config`
Get current SMTP configuration (without password)

**Response:**
```json
{
  "success": true,
  "config": {
    "host": "",
    "port": 587,
    "secure": false,
    "from": "",
    "fromName": "Siriza Agaria",
    "isActive": true,
    "auth": {
      "user": ""
    }
  }
}
```

#### PUT `/api/smtp/config` (Admin only)
Update SMTP configuration

**Request Body:**
```json
{
  "host": "",
  "port": 587,
  "secure": false,
  "auth": {
    "user": "",
    "pass": ""
  },
  "from": "",
  "fromName": "Siriza Agaria",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "SMTP configuration updated successfully",
  "config": { ... }
}
```

#### POST `/api/smtp/verify` (Admin only)
Verify SMTP connection

**Response:**
```json
{
  "success": true,
  "message": "SMTP connection verified successfully",
  "status": "connected"
}
```

#### POST `/api/smtp/test` (Admin only)
Send test email

**Request Body:**
```json
{
  "to": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "..."
}
```

#### POST `/api/smtp/reset` (Admin only)
Reset SMTP configuration to defaults

**Response:**
```json
{
  "success": true,
  "message": "SMTP configuration reset to defaults",
  "config": { ... }
}
```

#### GET `/api/smtp/status` (Public)
Get SMTP system status

**Response:**
```json
{
  "success": true,
  "status": {
    "configured": true,
    "active": true,
    "ready": true,
    "host": "",
    "port": 587,
    "from": ""
  }
}
```

## Initialization Flow

1. **Server Startup** (`server.js`):
   - MongoDB connection established
   - SMTP configuration loaded from database (2 second delay)
   - Default configuration created if none exists
   - Environment variables set from database config
   - Email service initialized with nodemailer

2. **Configuration Update**:
   - Admin updates config via PUT `/api/smtp/config`
   - Configuration saved to MongoDB
   - SMTP manager applies configuration
   - Environment variables updated
   - Email service re-initialized
   - Verification performed

## Email Sending

Once configured, emails can be sent using:

```javascript
const emailSender = require('./utils/emailSender');

// Send simple email
const result = await emailSender.sendEmail(
  'recipient@example.com',
  'Subject',
  '<html>...</html>'
);

// Send template email
const result = await emailSender.sendTemplateEmail(
  'recipient@example.com',
  'Subject',
  'template-name',
  { /* template data */ }
);

// Send order confirmation
const result = await emailSender.sendOrderConfirmationEmail(order);

// Send transfer confirmation
const result = await emailSender.sendTransferConfirmationEmail(order);

// Send shipping notification
const result = await emailSender.sendShippingNotificationEmail(order);
```

## Environment Variables

The following environment variables are set from the database configuration:

```
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=
```

These can be overridden in `.env` file, but database configuration takes precedence on server startup.

## Features

✅ **Database-backed configuration** - No need to restart server to change SMTP settings
✅ **Default configuration** - Automatically created on first startup
✅ **STARTTLS support** - Port 587 with TLS encryption
✅ **Connection verification** - Test SMTP connection before sending
✅ **Test emails** - Send test emails to verify configuration
✅ **Admin API** - Full control via REST endpoints
✅ **Error handling** - Comprehensive error messages and logging
✅ **Template support** - Integrated with email service for template rendering
✅ **Status monitoring** - Check SMTP system status anytime

## Testing

Run the SMTP test:
```bash
node test-smtp.js
```

This will:
1. Connect to MongoDB
2. Load/create SMTP configuration
3. Initialize email service
4. Verify SMTP connection
5. Test email service methods

## Security Notes

- SMTP password is stored in MongoDB (encrypted at rest recommended for production)
- Admin authentication required for configuration changes
- Password not returned in API responses
- STARTTLS provides encryption in transit
- TLS certificate validation disabled for compatibility (can be enabled if needed)

## Troubleshooting

### SMTP Connection Failed
- Verify host and port are correct
- Check firewall allows outbound connections to SMTP server
- Ensure credentials are valid
- Check SMTP server logs for authentication errors

### Emails Not Sending
- Verify SMTP is active: `GET /api/smtp/status`
- Test connection: `POST /api/smtp/verify`
- Send test email: `POST /api/smtp/test`
- Check server logs for error messages

### Configuration Not Applied
- Verify database connection is working
- Check MongoDB for SmtpConfig collection
- Restart server to reload configuration
- Check environment variables are set correctly

## Integration with Payment System

The SMTP system is automatically used by the payment system to send:
- Order confirmation emails
- Transfer confirmation emails
- Shipping notifications

These are sent via the payment controller using the configured SMTP settings.
