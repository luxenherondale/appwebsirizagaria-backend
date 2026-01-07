# Frontend Email Configuration Guide

## Overview

This document provides frontend developers with all necessary information to implement email template management and SMTP configuration in the Siriza Agaria application.

## SMTP Configuration API

### Base URL
```
http://localhost:5000/api/smtp
```

### Authentication
All endpoints except `/status` require JWT authentication via header:
```
x-auth-token: YOUR_JWT_TOKEN
```

---

## API Endpoints

### 1. Get SMTP Status (Public)
**Endpoint:** `GET /api/smtp/status`

**No authentication required**

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

**Use Case:** Check if email system is ready before showing email-related UI

---

### 2. Get Current Configuration
**Endpoint:** `GET /api/smtp/config`

**Authentication:** Required (Admin)

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

**Note:** Password is never returned for security

---

### 3. Update SMTP Configuration
**Endpoint:** `PUT /api/smtp/config`

**Authentication:** Required (Admin)

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

---

### 4. Verify SMTP Connection
**Endpoint:** `POST /api/smtp/verify`

**Authentication:** Required (Admin)

**Request Body:** (empty)

**Response on Success:**
```json
{
  "success": true,
  "message": "SMTP connection verified successfully",
  "status": "connected"
}
```

**Response on Failure:**
```json
{
  "success": false,
  "error": "Error message describing the issue",
  "status": "failed"
}
```

---

### 5. Send Test Email
**Endpoint:** `POST /api/smtp/test`

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "to": "test@example.com"
}
```

**Response on Success:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "message-id-from-smtp-server"
}
```

**Response on Failure:**
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

---

### 6. Reset to Default Configuration
**Endpoint:** `POST /api/smtp/reset`

**Authentication:** Required (Admin)

**Request Body:** (empty)

**Response:**
```json
{
  "success": true,
  "message": "SMTP configuration reset to defaults",
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

---

## Default Configuration

The system comes with default SMTP configuration:

```javascript
const defaultSmtpConfig = {
  host: "",
  port: 587,
  secure: false,
  auth: {
    user: "",
    pass: ""
  },
  from: "",
  fromName: "Siriza Agaria",
  isActive: true
}
```

---

## Frontend Implementation Examples

### React Hook for SMTP Status
```javascript
import { useState, useEffect } from 'react';

export function useSmtpStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/smtp/status');
        const data = await response.json();
        setStatus(data.status);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return { status, loading, error };
}
```

### React Hook for SMTP Configuration
```javascript
import { useState } from 'react';

export function useSmtpConfig(token) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/smtp/config', {
        headers: { 'x-auth-token': token }
      });
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/smtp/config', {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConfig)
      });
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
        return { success: true };
      } else {
        setError(data.error);
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/smtp/verify', {
        method: 'POST',
        headers: { 'x-auth-token': token }
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const testEmail = async (to) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/smtp/test', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const resetConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/smtp/reset', {
        method: 'POST',
        headers: { 'x-auth-token': token }
      });
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig,
    verifyConnection,
    testEmail,
    resetConfig
  };
}
```

### SMTP Configuration Form Component
```javascript
import React, { useState, useEffect } from 'react';
import { useSmtpConfig } from './hooks/useSmtpConfig';

export function SmtpConfigForm({ token }) {
  const { config, loading, error, fetchConfig, updateConfig, verifyConnection, testEmail } = useSmtpConfig(token);
  const [formData, setFormData] = useState({
    host: '',
    port: 587,
    secure: false,
    auth: { user: '', pass: '' },
    from: '',
    fromName: 'Siriza Agaria',
    isActive: true
  });
  const [testEmail, setTestEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (config) {
      setFormData({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: { user: config.auth.user, pass: '' },
        from: config.from,
        fromName: config.fromName,
        isActive: config.isActive
      });
    }
  }, [config]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('auth.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        auth: { ...prev.auth, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateConfig(formData);
    if (result.success) {
      setMessage('Configuration updated successfully');
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  const handleVerify = async () => {
    const result = await verifyConnection();
    if (result.success) {
      setMessage('SMTP connection verified successfully');
    } else {
      setMessage(`Connection failed: ${result.error}`);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setMessage('Please enter an email address');
      return;
    }
    const result = await testEmail(testEmail);
    if (result.success) {
      setMessage(`Test email sent to ${testEmail}`);
    } else {
      setMessage(`Failed to send test email: ${result.error}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>SMTP Configuration</h2>
      
      {message && <div className="message">{message}</div>}

      <div className="form-group">
        <label>Host:</label>
        <input
          type="text"
          name="host"
          value={formData.host}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Port:</label>
        <input
          type="number"
          name="port"
          value={formData.port}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="secure"
            checked={formData.secure}
            onChange={handleChange}
          />
          Secure (SSL/TLS)
        </label>
      </div>

      <div className="form-group">
        <label>Username:</label>
        <input
          type="email"
          name="auth.user"
          value={formData.auth.user}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          name="auth.pass"
          value={formData.auth.pass}
          onChange={handleChange}
          placeholder="Leave empty to keep current password"
        />
      </div>

      <div className="form-group">
        <label>From Email:</label>
        <input
          type="email"
          name="from"
          value={formData.from}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>From Name:</label>
        <input
          type="text"
          name="fromName"
          value={formData.fromName}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          Active
        </label>
      </div>

      <button type="submit">Save Configuration</button>
      <button type="button" onClick={handleVerify}>Verify Connection</button>

      <div className="test-email">
        <h3>Test Email</h3>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Enter test email address"
        />
        <button type="button" onClick={handleTestEmail}>Send Test Email</button>
      </div>
    </form>
  );
}
```

---

## Email Templates

The backend provides the following email templates:

### Available Templates
1. **order-confirmation** - Order confirmation email
2. **transfer-confirmation** - Bank transfer confirmation
3. **shipping-notification** - Shipping notification with tracking

### Template Data Structure

#### Order Confirmation
```javascript
{
  orderNumber: "SA1234567890",
  orderDate: "7 de enero de 2026, 12:00",
  status: "Confirmado",
  statusClass: "confirmed",
  subtotal: "19.000",
  shippingCost: "5.000",
  total: "24.000",
  items: [
    {
      product: "La Nueva Violencia Moderna",
      quantity: 1,
      unit_price: 19000
    }
  ],
  itemsRows: "<tr>...</tr>",
  customerName: "John Doe",
  email: "john@example.com",
  phone: "+56912345678",
  address: "Calle Principal 123",
  commune: "Santiago",
  region: "Región Metropolitana",
  trackingNumber: "TRK123456789",
  trackingUrl: "https://sirizagaria.com/rastrear/SA1234567890",
  notes: "Additional notes"
}
```

#### Transfer Confirmation
```javascript
{
  orderNumber: "SA1234567890",
  total: "24.000",
  confirmationDate: "7 de enero de 2026, 12:00",
  customerName: "John Doe",
  phone: "+56912345678",
  address: "Calle Principal 123",
  commune: "Santiago",
  region: "Región Metropolitana",
  notes: "Confirmation notes"
}
```

#### Shipping Notification
```javascript
{
  orderNumber: "SA1234567890",
  trackingNumber: "TRK123456789",
  shippingDate: "7 de enero de 2026, 12:00",
  customerName: "John Doe",
  address: "Calle Principal 123",
  commune: "Santiago",
  region: "Región Metropolitana",
  trackingUrl: "https://sirizagaria.com/rastrear/SA1234567890"
}
```

---

## Email Template Placeholders

Templates use the following placeholder syntax:

### Simple Placeholders
```html
<p>Order Number: {{orderNumber}}</p>
<p>Customer: {{customerName}}</p>
```

### Conditional Blocks
```html
{{#trackingNumber}}
  <p>Tracking Number: {{trackingNumber}}</p>
{{/trackingNumber}}
```

### Item Rows
```html
<table>
  <tbody>
    {{itemsRows}}
  </tbody>
</table>
```

---

## Integration with Payment System

The email system is automatically integrated with the payment system:

### Order Confirmation Email
Sent automatically when order is confirmed:
```javascript
POST /api/payment/send-confirmation/:order_id
```

### Transfer Confirmation Email
Sent when bank transfer is confirmed:
```javascript
POST /api/payment/confirm-transfer/:order_id
```

### Shipping Notification Email
Sent when order status is updated to "shipped":
```javascript
PUT /api/payment/status/:order_id
```

---

## Admin Panel Features

### SMTP Configuration Panel
- View current SMTP configuration
- Update SMTP settings
- Verify SMTP connection
- Send test emails
- Reset to default configuration

### Email Status Monitoring
- Check if email system is active
- Monitor SMTP connection status
- View email configuration details

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

Common errors:
- `Missing required SMTP configuration fields` - Required fields not provided
- `SMTP connection failed` - Cannot connect to SMTP server
- `Invalid email address` - Email format is invalid
- `Configuration saved but failed to initialize email service` - Config saved but service failed

---

## Security Notes

1. **Authentication Required** - All configuration endpoints require JWT token
2. **Password Not Returned** - API never returns SMTP password
3. **STARTTLS Encryption** - Port 587 uses TLS encryption
4. **Admin Only** - Configuration changes restricted to authenticated admins
5. **Status Public** - SMTP status endpoint is public for health checks

---

## Testing Checklist

- [ ] Check SMTP status endpoint
- [ ] Fetch current configuration
- [ ] Update configuration with new values
- [ ] Verify SMTP connection
- [ ] Send test email
- [ ] Reset to default configuration
- [ ] Verify email templates are available
- [ ] Test order confirmation email
- [ ] Test transfer confirmation email
- [ ] Test shipping notification email

---

## Troubleshooting

### Configuration Not Saving
- Verify JWT token is valid
- Check user has admin privileges
- Ensure all required fields are provided

### SMTP Connection Failed
- Verify host and port are correct
- Check firewall allows outbound connections
- Ensure credentials are valid
- Check SMTP server is running

### Test Email Not Received
- Verify recipient email is correct
- Check SMTP server logs
- Verify email is not in spam folder
- Check email configuration is active

---

## Additional Resources

- Backend SMTP Implementation: `SMTP_IMPLEMENTATION.md`
- Setup Summary: `SMTP_SETUP_SUMMARY.md`
- Email Service: `utils/emailSender.js`
- Email Templates: `templates/` directory
