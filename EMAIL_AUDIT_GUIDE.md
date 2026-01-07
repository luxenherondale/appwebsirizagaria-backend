# Email Audit System Guide

## Overview

The email audit system provides complete tracking and management of all emails sent through the Siriza Agaria backend. Every email is logged with detailed information including status, content, recipient, and SMTP response data.

## Features

✅ **Complete Email Logging** - Every email sent is automatically logged
✅ **Status Tracking** - Track sent, failed, and pending emails
✅ **Search & Filter** - Find emails by recipient, order, type, or date range
✅ **Email Resend** - Resend failed or previous emails
✅ **Statistics** - View email sending statistics and success rates
✅ **Export** - Export audit logs in JSON or CSV format
✅ **Order Tracking** - View all emails related to a specific order
✅ **Recipient History** - See all emails sent to a specific recipient

## Database Model

### EmailAudit Schema

```javascript
{
  messageId: String,              // SMTP message ID (unique)
  to: String,                     // Recipient email (indexed)
  cc: [String],                   // CC recipients
  bcc: [String],                  // BCC recipients
  subject: String,                // Email subject
  templateName: String,           // Template used (indexed)
  from: String,                   // Sender email
  status: String,                 // 'sent', 'failed', 'pending' (indexed)
  statusCode: Number,             // HTTP/SMTP status code
  errorMessage: String,           // Error details if failed
  relatedOrderId: String,         // Associated order (indexed)
  relatedUserId: String,          // Associated user (indexed)
  emailType: String,              // Type: order-confirmation, transfer-confirmation, shipping-notification, test, custom (indexed)
  htmlContent: String,            // Full HTML content (not returned by default)
  textContent: String,            // Plain text version (not returned by default)
  templateData: Object,           // Template variables (not returned by default)
  smtpResponse: Object,           // SMTP server response (not returned by default)
  metadata: {
    userAgent: String,            // Client user agent
    ipAddress: String,            // Client IP address
    initiatedBy: String,          // User ID who triggered the email
    initiatedByEmail: String      // User email who triggered the email
  },
  sentAt: Date,                   // When email was sent (indexed)
  createdAt: Date,                // Record creation time (indexed)
  updatedAt: Date                 // Last update time
}
```

## API Endpoints

All endpoints require JWT authentication via `x-auth-token` header (Admin only).

### 1. Get Email Audit Log
**Endpoint:** `GET /api/email-audit/log`

**Query Parameters:**
- `page` (default: 1) - Page number for pagination
- `limit` (default: 20) - Records per page
- `status` - Filter by status: 'sent', 'failed', 'pending'
- `to` - Filter by recipient email (partial match)
- `relatedOrderId` - Filter by order ID
- `emailType` - Filter by email type
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "to": "customer@example.com",
      "subject": "Order Confirmation",
      "status": "sent",
      "emailType": "order-confirmation",
      "relatedOrderId": "SA1234567890",
      "sentAt": "2026-01-07T12:00:00Z",
      "createdAt": "2026-01-07T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### 2. Get Email Detail
**Endpoint:** `GET /api/email-audit/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "messageId": "msg-12345@smtp.server",
    "to": "customer@example.com",
    "cc": [],
    "bcc": [],
    "subject": "Order Confirmation",
    "templateName": "order-confirmation",
    "from": "",
    "status": "sent",
    "relatedOrderId": "SA1234567890",
    "relatedUserId": "user-123",
    "emailType": "order-confirmation",
    "htmlContent": "<html>...</html>",
    "textContent": "Order confirmation text...",
    "templateData": { /* template variables */ },
    "smtpResponse": { /* SMTP server response */ },
    "metadata": {
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "initiatedBy": "admin-user-id",
      "initiatedByEmail": "admin@sirizagaria.com"
    },
    "sentAt": "2026-01-07T12:00:00Z",
    "createdAt": "2026-01-07T12:00:00Z"
  }
}
```

### 3. Get Email Statistics
**Endpoint:** `GET /api/email-audit/stats`

**Query Parameters:**
- `startDate` - From date (ISO format)
- `endDate` - To date (ISO format)

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 1250,
    "byStatus": {
      "sent": 1200,
      "failed": 45,
      "pending": 5,
      "successRate": "96.00%"
    },
    "byEmailType": {
      "order-confirmation": 800,
      "transfer-confirmation": 300,
      "shipping-notification": 100,
      "test": 50
    }
  }
}
```

### 4. Get Emails by Order
**Endpoint:** `GET /api/email-audit/order/:orderId`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "to": "customer@example.com",
      "subject": "Order Confirmation",
      "status": "sent",
      "emailType": "order-confirmation",
      "sentAt": "2026-01-07T12:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "to": "customer@example.com",
      "subject": "Your Order Has Shipped",
      "status": "sent",
      "emailType": "shipping-notification",
      "sentAt": "2026-01-08T14:30:00Z"
    }
  ]
}
```

### 5. Get Emails by Recipient
**Endpoint:** `GET /api/email-audit/recipient/:email`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [ /* array of email records */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### 6. Resend Email
**Endpoint:** `POST /api/email-audit/:id/resend`

**Response:**
```json
{
  "success": true,
  "message": "Email resent successfully",
  "newAuditId": "507f1f77bcf86cd799439013",
  "messageId": "msg-12346@smtp.server"
}
```

### 7. Delete Email Audit Record
**Endpoint:** `DELETE /api/email-audit/:id`

**Response:**
```json
{
  "success": true,
  "message": "Email audit record deleted"
}
```

### 8. Export Email Audit
**Endpoint:** `GET /api/email-audit/export/data`

**Query Parameters:**
- `format` - 'json' (default) or 'csv'
- `status` - Filter by status
- `emailType` - Filter by email type
- `startDate` - From date
- `endDate` - To date

**Response:**
- JSON format: Returns JSON file with all matching records
- CSV format: Returns CSV file with columns: ID, To, Subject, Status, Email Type, Order ID, Sent At, Created At

## Automatic Logging

All emails sent through the system are automatically logged with the following information:

### Logged on Success
- Message ID from SMTP server
- Recipient email
- Subject and content
- Template name and data
- SMTP response
- Timestamp

### Logged on Failure
- Recipient email
- Subject
- Error message
- Error code
- Timestamp

## Integration with Email Sender

The email audit logger is automatically integrated with the email sender. When sending emails:

```javascript
const result = await emailSender.sendEmail(
  'customer@example.com',
  'Order Confirmation',
  '<html>...</html>',
  {
    relatedOrderId: 'SA1234567890',
    relatedUserId: 'user-123',
    emailType: 'order-confirmation',
    templateName: 'order-confirmation',
    templateData: { /* data */ },
    metadata: {
      initiatedBy: 'admin-id',
      initiatedByEmail: 'admin@sirizagaria.com'
    }
  }
);
```

The email is automatically logged to the audit trail.

## Frontend Implementation

### React Hook for Email Audit
```javascript
import { useState, useEffect } from 'react';

export function useEmailAudit(token) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchEmails = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(
        `http://localhost:5000/api/email-audit/log?${params}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      if (data.success) {
        setEmails(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(
        `http://localhost:5000/api/email-audit/stats?${params}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      return data.stats;
    } catch (err) {
      console.error('Error fetching stats:', err);
      return null;
    }
  };

  const getEmailsByOrder = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/email-audit/order/${orderId}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error('Error fetching order emails:', err);
      return [];
    }
  };

  const resendEmail = async (emailId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/email-audit/${emailId}/resend`,
        {
          method: 'POST',
          headers: { 'x-auth-token': token }
        }
      );
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const exportAudit = async (format = 'json', filters = {}) => {
    try {
      const params = new URLSearchParams({ format, ...filters });
      const response = await fetch(
        `http://localhost:5000/api/email-audit/export/data?${params}`,
        { headers: { 'x-auth-token': token } }
      );
      
      const filename = format === 'csv' ? 'email-audit.csv' : 'email-audit.json';
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    } catch (err) {
      console.error('Error exporting audit:', err);
    }
  };

  return {
    emails,
    loading,
    error,
    pagination,
    fetchEmails,
    getStats,
    getEmailsByOrder,
    resendEmail,
    exportAudit
  };
}
```

### Email Audit Dashboard Component
```javascript
import React, { useState, useEffect } from 'react';
import { useEmailAudit } from './hooks/useEmailAudit';

export function EmailAuditDashboard({ token }) {
  const { emails, loading, error, pagination, fetchEmails, getStats, resendEmail } = useEmailAudit(token);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    emailType: ''
  });

  useEffect(() => {
    fetchEmails(filters);
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await getStats();
    setStats(data);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
    fetchEmails({ ...filters, ...newFilters, page: 1 });
  };

  const handleResend = async (emailId) => {
    const result = await resendEmail(emailId);
    if (result.success) {
      alert('Email resent successfully');
      fetchEmails(filters);
    } else {
      alert('Failed to resend email: ' + result.error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="email-audit-dashboard">
      <h1>Email Audit Trail</h1>

      {stats && (
        <div className="stats-section">
          <div className="stat-card">
            <h3>Total Emails</h3>
            <p>{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Sent</h3>
            <p>{stats.byStatus.sent}</p>
          </div>
          <div className="stat-card">
            <h3>Failed</h3>
            <p>{stats.byStatus.failed}</p>
          </div>
          <div className="stat-card">
            <h3>Success Rate</h3>
            <p>{stats.byStatus.successRate}</p>
          </div>
        </div>
      )}

      <div className="filters-section">
        <select 
          value={filters.status} 
          onChange={(e) => handleFilterChange({ status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>

        <select 
          value={filters.emailType} 
          onChange={(e) => handleFilterChange({ emailType: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="order-confirmation">Order Confirmation</option>
          <option value="transfer-confirmation">Transfer Confirmation</option>
          <option value="shipping-notification">Shipping Notification</option>
          <option value="test">Test</option>
        </select>
      </div>

      <table className="emails-table">
        <thead>
          <tr>
            <th>To</th>
            <th>Subject</th>
            <th>Type</th>
            <th>Status</th>
            <th>Order ID</th>
            <th>Sent At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {emails.map(email => (
            <tr key={email._id}>
              <td>{email.to}</td>
              <td>{email.subject}</td>
              <td>{email.emailType}</td>
              <td>
                <span className={`status ${email.status}`}>
                  {email.status}
                </span>
              </td>
              <td>{email.relatedOrderId || '-'}</td>
              <td>{new Date(email.sentAt).toLocaleString()}</td>
              <td>
                <button onClick={() => handleResend(email._id)}>Resend</button>
                <button onClick={() => window.location.href = `/email/${email._id}`}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div className="pagination">
          {/* Pagination controls */}
        </div>
      )}
    </div>
  );
}
```

## Use Cases

### 1. Monitor Email Delivery
- Check email status in real-time
- Identify failed emails
- View success rates

### 2. Troubleshoot Issues
- View detailed error messages
- Check SMTP responses
- Review email content

### 3. Resend Failed Emails
- Automatically resend failed emails
- Maintain audit trail of resends
- Track resend success

### 4. Compliance & Auditing
- Complete email history
- Track who sent what email
- Export for compliance reports

### 5. Customer Support
- View all emails sent to a customer
- Check order-related emails
- Resend confirmation emails

### 6. Analytics
- Email sending statistics
- Success rate tracking
- Email type distribution

## Best Practices

1. **Regular Cleanup** - Archive or delete old audit records periodically
2. **Monitor Success Rate** - Set alerts for high failure rates
3. **Review Failed Emails** - Investigate and resend failed emails
4. **Track Metadata** - Include user and IP information for security
5. **Export Reports** - Generate monthly reports for compliance
6. **Check SMTP Logs** - Cross-reference with SMTP server logs

## Performance Considerations

- Indexes are created on frequently queried fields
- HTML content and template data are not returned by default (use detail endpoint)
- Pagination is recommended for large result sets
- Consider archiving old records after 90 days

## Security

- All endpoints require admin authentication
- Password information is never logged
- Email content can be viewed only by authenticated admins
- Metadata tracks who initiated each email
- Audit trail is immutable (delete only, no updates)

## Troubleshooting

### Emails Not Being Logged
- Verify MongoDB connection is working
- Check email sender is using audit logger
- Review server logs for audit errors

### Missing Email Details
- Detail endpoint shows full content
- List endpoint shows summary only
- Use `GET /api/email-audit/:id` for full details

### Resend Not Working
- Verify original email has HTML content
- Check SMTP is still configured
- Review error message in response
