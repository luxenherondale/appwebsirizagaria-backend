# SMTP Configuration - Environment Variables Only

## Overview

All SMTP credentials are now configured exclusively through environment variables. No hardcoded defaults are present in the codebase for security reasons.

## Required Environment Variables

The following environment variables **MUST** be set for email functionality:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SMTP_HOST` | ✅ Yes | SMTP server hostname | `ns11.srtv.cl` |
| `SMTP_PORT` | ✅ Yes | SMTP server port | `587` |
| `SMTP_USER` | ✅ Yes | SMTP username/email | `editorial@sirizagaria.com` |
| `SMTP_PASSWORD` | ✅ Yes | SMTP password | `your-secure-password` |
| `EMAIL_FROM` | ✅ Yes | Sender email address | `editorial@sirizagaria.com` |
| `SMTP_SECURE` | ❌ No | Use SSL/TLS (default: false) | `false` or `true` |
| `EMAIL_FROM_NAME` | ❌ No | Sender display name (default: Siriza Agaria) | `Siriza Agaria` |

## Configuration Methods

### 1. Development (.env file)

Create or update `.env` file in project root:

```env
# SMTP Configuration for Email Sending
SMTP_HOST=ns11.srtv.cl
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=editorial@sirizagaria.com
SMTP_PASSWORD=your-secure-password
EMAIL_FROM=editorial@sirizagaria.com
EMAIL_FROM_NAME=Siriza Agaria
```

### 2. Production (Environment Variables)

Set environment variables in your deployment platform:

**Docker:**
```dockerfile
ENV SMTP_HOST=ns11.srtv.cl
ENV SMTP_PORT=587
ENV SMTP_SECURE=false
ENV SMTP_USER=editorial@sirizagaria.com
ENV SMTP_PASSWORD=your-secure-password
ENV EMAIL_FROM=editorial@sirizagaria.com
ENV EMAIL_FROM_NAME=Siriza Agaria
```

**Docker Compose:**
```yaml
environment:
  SMTP_HOST: ns11.srtv.cl
  SMTP_PORT: 587
  SMTP_SECURE: false
  SMTP_USER: editorial@sirizagaria.com
  SMTP_PASSWORD: your-secure-password
  EMAIL_FROM: editorial@sirizagaria.com
  EMAIL_FROM_NAME: Siriza Agaria
```

**Kubernetes:**
```yaml
env:
  - name: SMTP_HOST
    value: "ns11.srtv.cl"
  - name: SMTP_PORT
    value: "587"
  - name: SMTP_SECURE
    value: "false"
  - name: SMTP_USER
    valueFrom:
      secretKeyRef:
        name: smtp-credentials
        key: user
  - name: SMTP_PASSWORD
    valueFrom:
      secretKeyRef:
        name: smtp-credentials
        key: password
  - name: EMAIL_FROM
    value: "editorial@sirizagaria.com"
  - name: EMAIL_FROM_NAME
    value: "Siriza Agaria"
```

**Heroku:**
```bash
heroku config:set SMTP_HOST=ns11.srtv.cl
heroku config:set SMTP_PORT=587
heroku config:set SMTP_SECURE=false
heroku config:set SMTP_USER=editorial@sirizagaria.com
heroku config:set SMTP_PASSWORD=your-secure-password
heroku config:set EMAIL_FROM=editorial@sirizagaria.com
heroku config:set EMAIL_FROM_NAME=Siriza Agaria
```

**AWS Lambda / Environment Variables:**
```bash
export SMTP_HOST=ns11.srtv.cl
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=editorial@sirizagaria.com
export SMTP_PASSWORD=your-secure-password
export EMAIL_FROM=editorial@sirizagaria.com
export EMAIL_FROM_NAME=Siriza Agaria
```

## Startup Behavior

### With Complete Configuration
If all required environment variables are set:
1. Server starts normally
2. SMTP configuration is loaded from environment variables
3. Configuration is saved to MongoDB (if not already present)
4. Email service is initialized
5. Emails can be sent immediately

**Console Output:**
```
✅ SMTP configuration created from environment variables
✅ Email service initialized with SMTP configuration
   SMTP Server: ns11.srtv.cl:587
   Secure: false
   User: editorial@sirizagaria.com
```

### With Missing Configuration
If required environment variables are missing:
1. Server starts normally
2. SMTP initialization is skipped
3. Email service is NOT initialized
4. Emails cannot be sent until SMTP is configured

**Console Output:**
```
⚠️  Missing required SMTP environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
⚠️  Email service will not be initialized until SMTP is configured
```

## Updating Configuration at Runtime

### Via API Endpoint
Administrators can update SMTP configuration via the API:

```bash
curl -X PUT http://localhost:5000/api/smtp/config \
  -H "x-auth-token: YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "new-smtp-host.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "new-user@example.com",
      "pass": "new-password"
    },
    "from": "new-user@example.com",
    "fromName": "New Company Name",
    "isActive": true
  }'
```

This updates the database configuration and reinitializes the email service.

### Via Reset Endpoint
Reset to environment variable configuration:

```bash
curl -X POST http://localhost:5000/api/smtp/reset \
  -H "x-auth-token: YOUR_JWT_TOKEN"
```

This:
1. Validates all required environment variables are set
2. Deletes current database configuration
3. Creates new configuration from environment variables
4. Reinitializes email service

## Security Best Practices

### 1. Never Commit Credentials
- ✅ `.env` file is in `.gitignore`
- ✅ Use environment variables in production
- ✅ Use secret management tools (Vault, AWS Secrets Manager, etc.)

### 2. Use Strong Passwords
- Generate strong, unique passwords
- Use app-specific passwords for email providers
- Rotate passwords regularly

### 3. Secure Storage
- Use encrypted environment variable storage
- Use secret management services in production
- Restrict access to configuration

### 4. Audit Trail
- All email sends are logged to audit trail
- Configuration changes are tracked
- Access is restricted to authenticated admins

## Common SMTP Providers

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Note:** Use [App Password](https://support.google.com/accounts/answer/185833), not your regular Gmail password.

### Outlook / Office 365
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-api-key
EMAIL_FROM=your-verified-email@example.com
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=your-verified-email@example.com
```

### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-password
EMAIL_FROM=your-email@yourdomain.com
```

## Validation

### Check Environment Variables
```bash
# Check if variables are set
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER
echo $SMTP_PASSWORD
echo $EMAIL_FROM
```

### Test SMTP Connection
```bash
curl -X POST http://localhost:5000/api/smtp/verify \
  -H "x-auth-token: YOUR_JWT_TOKEN"
```

### Send Test Email
```bash
curl -X POST http://localhost:5000/api/smtp/test \
  -H "x-auth-token: YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'
```

### Check SMTP Status
```bash
curl -X GET http://localhost:5000/api/smtp/status
```

## Troubleshooting

### Email Service Not Initialized
**Problem:** Console shows "Email service will not be initialized"

**Solution:**
1. Check all required environment variables are set
2. Verify values are correct (no extra spaces)
3. Restart the server
4. Check server logs for specific missing variables

### SMTP Connection Failed
**Problem:** "SMTP connection failed" error

**Solution:**
1. Verify SMTP host and port are correct
2. Check firewall allows outbound connections
3. Verify credentials are correct
4. Test with telnet: `telnet smtp-host port`
5. Check SMTP server logs

### Emails Not Sending
**Problem:** Email sending fails silently

**Solution:**
1. Check SMTP status: `GET /api/smtp/status`
2. Verify connection: `POST /api/smtp/verify`
3. Send test email: `POST /api/smtp/test`
4. Check audit logs: `GET /api/email-audit/log`
5. Review server logs for errors

## Environment Variable Validation

The system validates required environment variables at:

1. **Server Startup** - Checks for required vars, warns if missing
2. **Email Initialization** - Validates before creating transporter
3. **Configuration Reset** - Requires all vars to be present
4. **Email Send** - Checks transporter is initialized

## Migration from Hardcoded Credentials

If upgrading from a version with hardcoded credentials:

1. **Set Environment Variables**
   ```bash
   export SMTP_HOST=your-host
   export SMTP_PORT=your-port
   export SMTP_USER=your-user
   export SMTP_PASSWORD=your-password
   export EMAIL_FROM=your-email
   ```

2. **Restart Server**
   - Server will load config from environment variables
   - Configuration will be saved to MongoDB

3. **Verify Configuration**
   ```bash
   curl -X GET http://localhost:5000/api/smtp/status
   ```

## Summary

- ✅ All SMTP credentials configured via environment variables only
- ✅ No hardcoded defaults in codebase
- ✅ Secure configuration management
- ✅ Runtime configuration updates via API
- ✅ Complete validation and error handling
- ✅ Audit trail for all configuration changes
