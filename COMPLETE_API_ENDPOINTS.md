# Complete API Endpoints - Siriza Agaria Backend

## Overview

This document lists all implemented API endpoints for the Siriza Agaria backend email management system. All endpoints are fully functional and ready for frontend integration.

---

## SMTP Configuration Endpoints

**Base URL:** `/api/smtp`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/smtp/config` | ✅ Admin | Get current SMTP configuration (password hidden) |
| PUT | `/api/smtp/config` | ✅ Admin | Update SMTP configuration |
| POST | `/api/smtp/verify` | ✅ Admin | Verify SMTP connection works |
| POST | `/api/smtp/test` | ✅ Admin | Send test email to verify setup |
| POST | `/api/smtp/reset` | ✅ Admin | Reset to environment variable configuration |
| GET | `/api/smtp/status` | ❌ Public | Get SMTP system status (no auth needed) |

**Status Codes:**
- 200: Success
- 400: Bad request or connection failed
- 404: Configuration not found
- 500: Server error

---

## Email Templates Endpoints

**Base URL:** `/api/email-templates`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/email-templates` | ❌ Public | Get all email templates with optional filters |
| GET | `/api/email-templates/:id` | ❌ Public | Get single template by ID |
| GET | `/api/email-templates/name/:name` | ❌ Public | Get template by name (e.g., "order-confirmation") |
| POST | `/api/email-templates` | ✅ Admin | Create new email template |
| PUT | `/api/email-templates/:id` | ✅ Admin | Update existing template |
| DELETE | `/api/email-templates/:id` | ✅ Admin | Delete template (cannot delete defaults) |
| POST | `/api/email-templates/:id/preview` | ✅ Admin | Preview template with sample data |
| POST | `/api/email-templates/:id/duplicate` | ✅ Admin | Duplicate template with new name |

**Query Parameters:**
- `type` - Filter by template type (order-confirmation, transfer-confirmation, shipping-notification, custom)
- `isActive` - Filter by active status (true/false)

**Status Codes:**
- 200: Success
- 201: Created
- 400: Bad request or validation error
- 404: Template not found
- 500: Server error

---

## Email Audit Endpoints

**Base URL:** `/api/email-audit`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/email-audit/log` | ✅ Admin | Get email audit log with filters and pagination |
| GET | `/api/email-audit/:id` | ✅ Admin | Get detailed email information |
| GET | `/api/email-audit/stats` | ✅ Admin | Get email statistics (sent, failed, pending counts) |
| GET | `/api/email-audit/order/:orderId` | ✅ Admin | Get all emails for specific order |
| GET | `/api/email-audit/recipient/:email` | ✅ Admin | Get all emails sent to specific recipient |
| POST | `/api/email-audit/:id/resend` | ✅ Admin | Resend a failed email |
| DELETE | `/api/email-audit/:id` | ✅ Admin | Delete audit record |
| GET | `/api/email-audit/export/data` | ✅ Admin | Export audit logs (JSON or CSV format) |

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `status` - Filter by status (sent, failed, pending)
- `to` - Filter by recipient email (partial match)
- `relatedOrderId` - Filter by order ID
- `emailType` - Filter by email type
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)
- `format` - Export format (json, csv) for export endpoint

**Status Codes:**
- 200: Success
- 400: Bad request
- 404: Record not found
- 500: Server error

---

## Default Email Templates

The system comes with three pre-configured templates:

### 1. Order Confirmation
- **Name:** `order-confirmation`
- **Type:** order-confirmation
- **Subject:** Confirmación de Orden - Siriza Agaria
- **Placeholders:** customerName, orderNumber, orderDate, status, items, subtotal, shippingCost, total, address, commune, region, phone, trackingNumber, trackingUrl, notes

### 2. Transfer Confirmation
- **Name:** `transfer-confirmation`
- **Type:** transfer-confirmation
- **Subject:** Transferencia Confirmada - Siriza Agaria
- **Placeholders:** customerName, orderNumber, total, confirmationDate, address, commune, region, phone, notes

### 3. Shipping Notification
- **Name:** `shipping-notification`
- **Type:** shipping-notification
- **Subject:** Tu Orden ha sido Enviada - Siriza Agaria
- **Placeholders:** customerName, orderNumber, trackingNumber, shippingDate, address, commune, region, trackingUrl

---

## Authentication

### Required for Admin Endpoints
Include JWT token in request header:
```
x-auth-token: YOUR_JWT_TOKEN
```

### Public Endpoints
No authentication required:
- `GET /api/email-templates` - Get all templates
- `GET /api/email-templates/:id` - Get single template
- `GET /api/email-templates/name/:name` - Get template by name
- `GET /api/smtp/status` - Get SMTP status

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| Missing required SMTP environment variables | SMTP not configured | Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD in .env |
| Email template not found | Invalid template ID | Verify template ID exists |
| Template with name already exists | Duplicate template name | Use unique template name |
| Cannot delete default email templates | Attempting to delete default | Only custom templates can be deleted |
| SMTP connection failed | SMTP server unreachable | Verify SMTP credentials and server connectivity |
| Email audit record not found | Invalid audit ID | Verify audit record ID exists |

---

## Setup Instructions

### 1. Environment Configuration
Set required environment variables in `.env`:
```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=your-email@example.com
EMAIL_FROM_NAME=Siriza Agaria
```

### 2. Seed Default Templates
```bash
node seed-email-templates.js
```

### 3. Start Server
```bash
npm start
# or for development
npm run dev
```

### 4. Verify Setup
```bash
# Check SMTP status
curl http://localhost:5000/api/smtp/status

# Get all templates
curl http://localhost:5000/api/email-templates

# Verify SMTP connection (requires auth)
curl -X POST http://localhost:5000/api/smtp/verify \
  -H "x-auth-token: YOUR_JWT_TOKEN"
```

---

## Frontend Integration Examples

### Get All Templates
```javascript
const response = await fetch('http://localhost:5000/api/email-templates');
const data = await response.json();
console.log(data.data); // Array of templates
```

### Get Single Template
```javascript
const response = await fetch('http://localhost:5000/api/email-templates/507f1f77bcf86cd799439011');
const data = await response.json();
console.log(data.data); // Full template with HTML content
```

### Update SMTP Configuration
```javascript
const response = await fetch('http://localhost:5000/api/smtp/config', {
  method: 'PUT',
  headers: {
    'x-auth-token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    host: 'new-smtp-host.com',
    port: 587,
    secure: false,
    auth: { user: 'email@example.com', pass: 'password' },
    from: 'email@example.com',
    fromName: 'Company Name',
    isActive: true
  })
});
const data = await response.json();
```

### Get Email Audit Log
```javascript
const response = await fetch(
  'http://localhost:5000/api/email-audit/log?page=1&limit=20&status=sent',
  { headers: { 'x-auth-token': token } }
);
const data = await response.json();
console.log(data.data); // Array of emails
console.log(data.pagination); // Pagination info
```

### Preview Template
```javascript
const response = await fetch(
  'http://localhost:5000/api/email-templates/507f1f77bcf86cd799439011/preview',
  {
    method: 'POST',
    headers: {
      'x-auth-token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        customerName: 'John Doe',
        orderNumber: 'SA1234567890',
        total: '24000'
      }
    })
  }
);
const data = await response.json();
console.log(data.data.htmlContent); // Rendered HTML
```

---

## Files Created

### Models
- `models/smtpConfig.js` - SMTP configuration storage
- `models/emailTemplate.js` - Email template storage
- `models/emailAudit.js` - Email audit trail storage

### Controllers
- `controllers/smtpConfig.js` - SMTP configuration handlers
- `controllers/emailTemplate.js` - Email template handlers
- `controllers/emailAudit.js` - Email audit handlers

### Routes
- `routes/smtpConfig.js` - SMTP configuration routes
- `routes/emailTemplate.js` - Email template routes
- `routes/emailAudit.js` - Email audit routes

### Utilities
- `utils/emailSender.js` - Email sending with audit logging
- `utils/emailService.js` - Email template rendering
- `utils/emailAuditLogger.js` - Audit trail logging
- `utils/smtpManager.js` - SMTP configuration management

### Seeds
- `seed-email-templates.js` - Default template seeding

### Documentation
- `SMTP_IMPLEMENTATION.md` - SMTP system guide
- `SMTP_ENV_ONLY.md` - Environment variable configuration
- `EMAIL_TEMPLATES_API.md` - Email templates API reference
- `EMAIL_AUDIT_GUIDE.md` - Email audit system guide
- `FRONTEND_EMAIL_CONFIG.md` - Frontend integration guide

---

## Testing Checklist

- [ ] SMTP Configuration
  - [ ] GET /api/smtp/config
  - [ ] PUT /api/smtp/config
  - [ ] POST /api/smtp/verify
  - [ ] POST /api/smtp/test
  - [ ] POST /api/smtp/reset
  - [ ] GET /api/smtp/status

- [ ] Email Templates
  - [ ] GET /api/email-templates
  - [ ] GET /api/email-templates/:id
  - [ ] GET /api/email-templates/name/:name
  - [ ] POST /api/email-templates
  - [ ] PUT /api/email-templates/:id
  - [ ] DELETE /api/email-templates/:id
  - [ ] POST /api/email-templates/:id/preview
  - [ ] POST /api/email-templates/:id/duplicate

- [ ] Email Audit
  - [ ] GET /api/email-audit/log
  - [ ] GET /api/email-audit/:id
  - [ ] GET /api/email-audit/stats
  - [ ] GET /api/email-audit/order/:orderId
  - [ ] GET /api/email-audit/recipient/:email
  - [ ] POST /api/email-audit/:id/resend
  - [ ] DELETE /api/email-audit/:id
  - [ ] GET /api/email-audit/export/data

---

## Support & Documentation

For detailed information on each system:
- **SMTP Configuration:** See `SMTP_IMPLEMENTATION.md` and `SMTP_ENV_ONLY.md`
- **Email Templates:** See `EMAIL_TEMPLATES_API.md`
- **Email Audit:** See `EMAIL_AUDIT_GUIDE.md`
- **Frontend Integration:** See `FRONTEND_EMAIL_CONFIG.md`

All endpoints are production-ready and fully integrated with the Siriza Agaria backend.
