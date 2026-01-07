# DTE (Documentos Tributarios Electrónicos) API Documentation

Complete API reference for creating and managing electronic tax documents (invoices, boletas, and shipping guides) in Chile.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Document Types](#document-types)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [Integration Guide](#integration-guide)

---

## Introduction

This API enables the creation and management of Chilean Electronic Tax Documents (DTE - Documentos Tributarios Electrónicos) including:
- Facturas Electrónicas (Invoices with IVA)
- Facturas Exentas (Exempt Invoices)
- Boletas Electrónicas (Receipts with IVA)
- Boletas Exentas (Exempt Receipts)
- Guías de Despacho (Shipping Guides)
- Notas de Crédito (Credit Notes)
- Notas de Débito (Debit Notes)

**Base URL:** `https://api.sirizagaria.com/api/documents`

---

## Authentication

All endpoints require JWT authentication via the `x-auth-token` header:

```
x-auth-token: YOUR_JWT_TOKEN
```

---

## Endpoints

### List Documents

**Endpoint:** `GET /api/documents`

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 50) - Documents per page
- `tipoDTE` - Filter by document type (33, 34, 39, 41, 52, 56, 61)
- `status` - Filter by status (pending, completed, rejected, cancelled)
- `customerId` - Filter by customer ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "tipoDTE": 33,
      "folio": 123,
      "status": "completed",
      "rutEmisor": "77226199",
      "rutReceptor": "12345678",
      "customerId": "507f1f77bcf86cd799439011",
      "fechaEmision": "2026-01-07T00:00:00Z",
      "mntNeto": 100000,
      "tasaIVA": 19,
      "iva": 19000,
      "mntTotal": 119000,
      "createdAt": "2026-01-07T12:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "perPage": 50,
    "currentPage": 1,
    "lastPage": 3
  }
}
```

---

### Get Document by UUID

**Endpoint:** `GET /api/documents/uuid/:uuid`

**Path Parameters:**
- `uuid` - Document UUID (returned when creating)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "tipoDTE": 33,
    "folio": 123,
    "status": "completed",
    "rutEmisor": "77226199",
    "rutReceptor": "12345678",
    "mntTotal": 119000,
    "dteJson": { /* Full DTE structure */ }
  },
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "completed"
}
```

---

### Get Document by Folio

**Endpoint:** `GET /api/documents/:rutEmisor/:tipoDTE/:folio`

**Path Parameters:**
- `rutEmisor` - Issuer RUT (with or without dash)
- `tipoDTE` - Document type (33, 34, 39, 41, 52, 56, 61)
- `folio` - Document folio number

**Response:**
```json
{
  "success": true,
  "data": { /* Document object */ }
}
```

---

### Get Pending Document Status

**Endpoint:** `GET /api/documents/pending/:uuid`

**Response:**
```json
{
  "success": true,
  "data": { /* Document object */ },
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "pending",
  "folio": null
}
```

**Status Values:**
- `pending` - Document queued for processing (folio = null)
- `completed` - Document processed and issued (folio assigned)
- `rejected` - Document rejected by SII
- `cancelled` - Document cancelled

---

### Create Generic Document

**Endpoint:** `POST /api/documents`

**Request Body:**
```json
{
  "DTE": {
    "Encabezado": {
      "IdDoc": {
        "TipoDTE": 33,
        "Folio": 0,
        "FchEmis": "2026-01-15",
        "FmaPago": 1
      },
      "Emisor": {
        "RUTEmisor": "77226199-3",
        "RznSoc": "Mi Empresa S.A.",
        "GiroEmis": "Comercio",
        "Acteco": [620200],
        "DirOrigen": "Av. Principal 123",
        "CmnaOrigen": "Santiago",
        "CorreoEmisor": "contacto@empresa.cl"
      },
      "Receptor": {
        "RUTRecep": "12345678-9",
        "RznSocRecep": "Cliente S.A.",
        "GiroRecep": "Servicios",
        "DirRecep": "Calle Cliente 456",
        "CmnaRecep": "Providencia"
      },
      "Totales": {
        "MntNeto": 100000,
        "TasaIVA": 19,
        "IVA": 19000,
        "MntTotal": 119000
      }
    },
    "Detalle": [
      {
        "NroLinDet": 1,
        "NmbItem": "Producto",
        "QtyItem": 2,
        "UnmdItem": "UN",
        "PrcItem": 50000,
        "MontoItem": 100000
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document created successfully",
  "data": { /* Document object */ },
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "pending"
}
```

---

### Create Factura Electrónica

**Endpoint:** `POST /api/documents/factura/create`

**Request Body:**
```json
{
  "rutReceptor": "12345678-9",
  "razonSocialReceptor": "Cliente S.A.",
  "giroReceptor": "Servicios",
  "dirReceptor": "Calle Cliente 456",
  "cmnaReceptor": "Providencia",
  "correoReceptor": "cliente@example.com",
  "mntNeto": 100000,
  "tasaIVA": 19,
  "iva": 19000,
  "mntTotal": 119000,
  "formaPago": 1,
  "items": [
    {
      "nmbItem": "Producto A",
      "qtyItem": 2,
      "prcItem": 50000,
      "montoItem": 100000
    }
  ],
  "invoiceId": "507f1f77bcf86cd799439012"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Factura Electrónica created successfully",
  "data": { /* Document object */ },
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "pending"
}
```

---

### Create Boleta Electrónica

**Endpoint:** `POST /api/documents/boleta/create`

**Request Body:**
```json
{
  "rutReceptor": "12345678-9",
  "razonSocialReceptor": "Cliente Particular",
  "giroReceptor": "Consumidor Final",
  "dirReceptor": "Calle Cliente 456",
  "cmnaReceptor": "Providencia",
  "mntNeto": 50000,
  "tasaIVA": 19,
  "iva": 9500,
  "mntTotal": 59500,
  "items": [
    {
      "nmbItem": "Producto B",
      "qtyItem": 1,
      "prcItem": 50000,
      "montoItem": 50000
    }
  ],
  "invoiceId": "507f1f77bcf86cd799439012"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Boleta Electrónica created successfully",
  "data": { /* Document object */ },
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "pending"
}
```

---

### Create Guía de Despacho

**Endpoint:** `POST /api/documents/guia/create`

**Request Body:**
```json
{
  "rutReceptor": "12345678-9",
  "razonSocialReceptor": "Cliente S.A.",
  "giroReceptor": "Servicios",
  "dirReceptor": "Calle Cliente 456",
  "cmnaReceptor": "Providencia",
  "dirDestino": "Av. Destino 789",
  "cmnaDestino": "Las Condes",
  "patente": "ABCD12",
  "rutChofer": "11111111-1",
  "nombreChofer": "Juan Pérez",
  "mntTotal": 0,
  "items": [
    {
      "nmbItem": "Producto para envío",
      "qtyItem": 1,
      "prcItem": 0,
      "montoItem": 0
    }
  ],
  "shippingId": "507f1f77bcf86cd799439016"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Guía de Despacho created successfully",
  "data": { /* Document object */ },
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "pending"
}
```

---

### Create Nota de Crédito

**Endpoint:** `POST /api/documents/nota-credito/create`

**Request Body:**
```json
{
  "rutReceptor": "12345678-9",
  "razonSocialReceptor": "Cliente S.A.",
  "giroReceptor": "Servicios",
  "dirReceptor": "Calle Cliente 456",
  "cmnaReceptor": "Providencia",
  "mntNeto": 50000,
  "tasaIVA": 19,
  "iva": 9500,
  "mntTotal": 59500,
  "tpoDocRef": "33",
  "folioRef": 123,
  "fchRef": "2026-01-15",
  "codRef": 1,
  "razonRef": "Devolución de productos",
  "items": [
    {
      "nmbItem": "Producto devuelto",
      "qtyItem": 1,
      "prcItem": 50000,
      "montoItem": 50000
    }
  ],
  "invoiceId": "507f1f77bcf86cd799439012"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nota de Crédito created successfully",
  "data": { /* Document object */ },
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "pending"
}
```

---

### Create Nota de Débito

**Endpoint:** `POST /api/documents/nota-debito/create`

**Request Body:**
```json
{
  "rutReceptor": "12345678-9",
  "razonSocialReceptor": "Cliente S.A.",
  "giroReceptor": "Servicios",
  "dirReceptor": "Calle Cliente 456",
  "cmnaReceptor": "Providencia",
  "mntNeto": 10000,
  "tasaIVA": 19,
  "iva": 1900,
  "mntTotal": 11900,
  "tpoDocRef": "33",
  "folioRef": 123,
  "fchRef": "2026-01-15",
  "codRef": 1,
  "razonRef": "Ajuste por diferencia de precio",
  "items": [
    {
      "nmbItem": "Ajuste adicional",
      "qtyItem": 1,
      "prcItem": 10000,
      "montoItem": 10000
    }
  ],
  "invoiceId": "507f1f77bcf86cd799439012"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nota de Débito created successfully",
  "data": { /* Document object */ },
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "pending"
}
```

---

### Create DTE from Invoice

**Endpoint:** `POST /api/documents/from-invoice`

**Request Body:**
```json
{
  "invoiceId": "507f1f77bcf86cd799439012",
  "documentType": "factura"
}
```

**Parameters:**
- `invoiceId` - Invoice ID from the invoices system
- `documentType` - "factura" or "boleta"

**Response:**
```json
{
  "success": true,
  "message": "Factura Electrónica created from invoice",
  "data": { /* Document object */ },
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "pending"
}
```

---

### Create DTE from Shipping

**Endpoint:** `POST /api/documents/from-shipping`

**Request Body:**
```json
{
  "shippingId": "507f1f77bcf86cd799439016"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Guía de Despacho created from shipping",
  "data": { /* Document object */ },
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "pending"
}
```

---

### Update Document Status

**Endpoint:** `PUT /api/documents/:id/status`

**Request Body:**
```json
{
  "status": "completed",
  "folio": 123,
  "siiResponse": { /* SII response data */ },
  "siiError": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document status updated successfully",
  "data": { /* Updated document object */ }
}
```

---

### Get Document Statistics

**Endpoint:** `GET /api/documents/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDocuments": 150,
    "totalAmount": 17850000,
    "totalIVA": 2850000,
    "byTipoDTE": {
      "33": 50,
      "39": 30,
      "52": 40,
      "61": 20,
      "56": 10
    },
    "byStatus": {
      "pending": 20,
      "completed": 120,
      "rejected": 5,
      "cancelled": 5
    }
  }
}
```

---

## Document Types

| Code | Type | Description |
|------|------|-------------|
| 33 | Factura Electrónica | Invoice with IVA |
| 34 | Factura Exenta | Exempt Invoice |
| 39 | Boleta Electrónica | Receipt with IVA |
| 41 | Boleta Exenta | Exempt Receipt |
| 52 | Guía de Despacho | Shipping Guide |
| 56 | Nota de Débito | Debit Note |
| 61 | Nota de Crédito | Credit Note |

---

## Request/Response Examples

### Example 1: Create Invoice from Existing Invoice

```javascript
const response = await fetch('https://api.sirizagaria.com/api/documents/from-invoice', {
  method: 'POST',
  headers: {
    'x-auth-token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    invoiceId: '507f1f77bcf86cd799439012',
    documentType: 'factura'
  })
});

const result = await response.json();
console.log('Document UUID:', result.data.uuid);
console.log('Status:', result.data.status);
```

### Example 2: Create Shipping Guide from Shipping

```javascript
const response = await fetch('https://api.sirizagaria.com/api/documents/from-shipping', {
  method: 'POST',
  headers: {
    'x-auth-token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    shippingId: '507f1f77bcf86cd799439016'
  })
});

const result = await response.json();
console.log('Guía UUID:', result.data.uuid);
console.log('Folio:', result.data.folio);
```

### Example 3: Check Document Status

```javascript
const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const response = await fetch(`https://api.sirizagaria.com/api/documents/uuid/${uuid}`, {
  headers: { 'x-auth-token': token }
});

const result = await response.json();
if (result.data.status === 'completed') {
  console.log('Document folio:', result.data.folio);
} else {
  console.log('Document still pending...');
}
```

---

## Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "success": false,
  "error": "Folio must be 0 (system generates it)"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Document not found"
}
```

**422 Validation Error**
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    "MntTotal must equal MntNeto + IVA",
    "RUTRecep is required"
  ]
}
```

**500 Server Error**
```json
{
  "success": false,
  "error": "Internal server error message"
}
```

---

## Integration Guide

### React Hook for DTE Management

```javascript
import { useState, useCallback } from 'react';

export function useDTE(token) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(
        `https://api.sirizagaria.com/api/documents?${params}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createFromInvoice = useCallback(async (invoiceId, documentType) => {
    try {
      const response = await fetch(
        'https://api.sirizagaria.com/api/documents/from-invoice',
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ invoiceId, documentType })
        }
      );
      const data = await response.json();
      if (data.success) {
        setDocuments([data.data, ...documents]);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, documents]);

  const createFromShipping = useCallback(async (shippingId) => {
    try {
      const response = await fetch(
        'https://api.sirizagaria.com/api/documents/from-shipping',
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ shippingId })
        }
      );
      const data = await response.json();
      if (data.success) {
        setDocuments([data.data, ...documents]);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [token, documents]);

  const getDocumentStatus = useCallback(async (uuid) => {
    try {
      const response = await fetch(
        `https://api.sirizagaria.com/api/documents/uuid/${uuid}`,
        { headers: { 'x-auth-token': token } }
      );
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching document:', err);
      return null;
    }
  }, [token]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    createFromInvoice,
    createFromShipping,
    getDocumentStatus
  };
}
```

### React Component Example

```javascript
import React, { useEffect } from 'react';
import { useDTE } from '../hooks/useDTE';

export function DTEManager({ token, invoiceId }) {
  const { createFromInvoice, getDocumentStatus } = useDTE(token);
  const [documentUUID, setDocumentUUID] = React.useState(null);
  const [status, setStatus] = React.useState(null);

  const handleCreateInvoice = async () => {
    const result = await createFromInvoice(invoiceId, 'factura');
    if (result.success) {
      setDocumentUUID(result.uuid);
      setStatus(result.status);
    }
  };

  const checkStatus = async () => {
    if (!documentUUID) return;
    const doc = await getDocumentStatus(documentUUID);
    if (doc) {
      setStatus(doc.status);
      if (doc.folio) {
        console.log('Document folio:', doc.folio);
      }
    }
  };

  return (
    <div className="dte-manager">
      <button onClick={handleCreateInvoice}>
        Create Factura Electrónica
      </button>

      {documentUUID && (
        <div>
          <p>Document UUID: {documentUUID}</p>
          <p>Status: {status}</p>
          <button onClick={checkStatus}>Check Status</button>
        </div>
      )}
    </div>
  );
}
```

---

## Important Notes

1. **Folio Generation**: The `Folio` field must always be 0 when creating documents. The system automatically generates the folio.

2. **RUT Format**: RUTs can be sent with or without dashes. The system normalizes them automatically.

3. **Date Format**: All dates must be in ISO format (YYYY-MM-DD).

4. **Amounts**: All amounts must be numbers (not strings). The system validates calculations.

5. **IVA Calculation**: For invoices with IVA, ensure `MntTotal = MntNeto + IVA`.

6. **Automatic Integration**: Documents created from invoices or shipments automatically link to those records.

7. **Status Tracking**: Use the UUID to track document status. Status changes from `pending` to `completed` when the SII processes the document.

8. **Customer Linking**: Documents automatically link to customers based on RUT or email matching.

---

## Support

For issues or questions, contact the development team or refer to the SII documentation at https://www.sii.cl.
