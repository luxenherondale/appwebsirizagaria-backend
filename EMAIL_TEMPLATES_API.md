# Email Templates API Documentation

## Overview

The Email Templates API allows administrators to manage email templates for the Siriza Agaria system. Templates can be created, updated, deleted, and previewed.

## Base URL

```
http://localhost:5000/api/email-templates
```

## Authentication

Most endpoints require JWT authentication via header:
```
x-auth-token: YOUR_JWT_TOKEN
```

## Endpoints

### 1. Get All Templates
**Endpoint:** `GET /api/email-templates`

**Authentication:** Not required

**Query Parameters:**
- `type` - Filter by template type
- `isActive` - Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "order-confirmation",
      "displayName": "Order Confirmation",
      "description": "Email sent to customer when order is confirmed",
      "subject": "Confirmación de Orden - Siriza Agaria",
      "type": "order-confirmation",
      "isActive": true,
      "isDefault": true,
      "version": 1,
      "createdAt": "2026-01-07T12:00:00Z"
    }
  ]
}
```

### 2. Get Single Template
**Endpoint:** `GET /api/email-templates/:id`

**Authentication:** Not required

**Response:** Full template with htmlContent and placeholders

### 3. Get Template by Name
**Endpoint:** `GET /api/email-templates/name/:name`

**Authentication:** Not required

**Parameters:**
- `name` - Template name (e.g., "order-confirmation")

### 4. Create Template
**Endpoint:** `POST /api/email-templates`

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "custom-template",
  "displayName": "Custom Template",
  "description": "My custom email template",
  "subject": "Custom Email Subject",
  "htmlContent": "<html>...</html>",
  "textContent": "Plain text version",
  "type": "custom",
  "placeholders": [
    {
      "name": "customerName",
      "description": "Customer full name",
      "required": true
    }
  ],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email template created successfully",
  "data": { /* full template */ }
}
```

### 5. Update Template
**Endpoint:** `PUT /api/email-templates/:id`

**Authentication:** Required (Admin)

**Request Body:** Same fields as create (all optional)

**Response:**
```json
{
  "success": true,
  "message": "Email template updated successfully",
  "data": { /* updated template */ }
}
```

### 6. Delete Template
**Endpoint:** `DELETE /api/email-templates/:id`

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Email template deleted successfully"
}
```

**Note:** Cannot delete default templates

### 7. Preview Template
**Endpoint:** `POST /api/email-templates/:id/preview`

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "data": {
    "customerName": "John Doe",
    "orderNumber": "SA1234567890",
    "total": "24000"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": "Confirmación de Orden - Siriza Agaria",
    "htmlContent": "<html>Rendered HTML with data...</html>",
    "textContent": "Rendered plain text..."
  }
}
```

### 8. Duplicate Template
**Endpoint:** `POST /api/email-templates/:id/duplicate`

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "newName": "order-confirmation-v2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email template duplicated successfully",
  "data": { /* new template */ }
}
```

## Default Templates

The system comes with three default templates:

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

## Template Placeholders

Templates use the following placeholder syntax:

### Simple Placeholders
```html
<p>Customer: {{customerName}}</p>
<p>Order: {{orderNumber}}</p>
```

### Conditional Blocks
```html
{{#trackingNumber}}
  <p>Tracking: {{trackingNumber}}</p>
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

## Seeding Default Templates

To seed the default templates into the database:

```bash
node seed-email-templates.js
```

This will create the three default templates if they don't already exist.

## Template Versioning

Each template has a version number that increments on update. This allows tracking template changes over time.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

Common errors:
- `Missing required fields` - Required fields not provided
- `Email template not found` - Template ID doesn't exist
- `Template with name already exists` - Duplicate template name
- `Cannot delete default email templates` - Attempting to delete default template

## Frontend Integration

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

export function useEmailTemplates(token) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(
        `http://localhost:5000/api/email-templates?${params}`
      );
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData) => {
    const response = await fetch(
      'http://localhost:5000/api/email-templates',
      {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      }
    );
    return response.json();
  };

  const updateTemplate = async (id, templateData) => {
    const response = await fetch(
      `http://localhost:5000/api/email-templates/${id}`,
      {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      }
    );
    return response.json();
  };

  const deleteTemplate = async (id) => {
    const response = await fetch(
      `http://localhost:5000/api/email-templates/${id}`,
      {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      }
    );
    return response.json();
  };

  const previewTemplate = async (id, data) => {
    const response = await fetch(
      `http://localhost:5000/api/email-templates/${id}/preview`,
      {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      }
    );
    return response.json();
  };

  return {
    templates,
    loading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    previewTemplate
  };
}
```

## Best Practices

1. **Use Default Templates** - Start with default templates and customize as needed
2. **Test Before Deploy** - Use preview endpoint to test templates
3. **Version Control** - Keep track of template versions
4. **Placeholder Validation** - Ensure all required placeholders are provided
5. **Mobile Responsive** - Design templates to be mobile-friendly
6. **Spanish Localization** - Use Spanish text for Chilean market
