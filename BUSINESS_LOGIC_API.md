# Business Logic API Documentation

Complete API reference for customer management, invoicing, stock, shipping, purchase orders, and accounting systems.

---

## Customer Management API

**Base URL:** `/api/customers`

### Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | ❌ | Get all customers with pagination and search |
| GET | `/:id` | ❌ | Get single customer by ID |
| GET | `/rut/:rut` | ❌ | Get customer by RUT |
| POST | `/` | ✅ | Create new customer |
| PUT | `/:id` | ✅ | Update customer |
| DELETE | `/:id` | ✅ | Deactivate customer |
| GET | `/:id/orders` | ❌ | Get customer's orders |
| GET | `/:id/invoices` | ❌ | Get customer's invoices |
| GET | `/:id/stats` | ❌ | Get customer financial stats |

### GET /api/customers
Get all customers with optional filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` - Search by RUT, email, name, or phone
- `isActive` - Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "rut": "12345678-9",
      "email": "customer@example.com",
      "name": "John Doe",
      "phone": "+56912345678",
      "address": "Calle Principal 123",
      "commune": "Santiago",
      "region": "Metropolitana",
      "businessName": "Doe Enterprises",
      "businessType": "business",
      "totalOrders": 5,
      "totalSpent": 250000,
      "totalOwed": 50000,
      "lastOrderDate": "2026-01-07T12:00:00Z",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z"
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

### POST /api/customers
Create a new customer.

**Request Body:**
```json
{
  "rut": "12345678-9",
  "email": "customer@example.com",
  "name": "John Doe",
  "phone": "+56912345678",
  "address": "Calle Principal 123",
  "commune": "Santiago",
  "region": "Metropolitana",
  "businessName": "Doe Enterprises",
  "businessType": "business"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": { /* full customer object */ }
}
```

### GET /api/customers/:id/stats
Get customer financial statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "totalOrders": 5,
    "totalSpent": 250000,
    "totalOwed": 50000,
    "totalInvoices": 5,
    "totalAmount": 250000,
    "totalPaid": 200000,
    "amountOwed": 50000,
    "lastOrderDate": "2026-01-07T12:00:00Z"
  }
}
```

---

## Invoice Management API

**Base URL:** `/api/invoices`

### Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | ❌ | Get all invoices with filters |
| GET | `/stats` | ❌ | Get invoice statistics |
| GET | `/:id` | ❌ | Get single invoice |
| POST | `/` | ✅ | Create invoice |
| PUT | `/:id` | ✅ | Update invoice |
| POST | `/:id/payment` | ✅ | Record payment |

### GET /api/invoices
Get all invoices with optional filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` - Filter by status (draft, issued, sent, viewed, paid, partially_paid, overdue, cancelled)
- `paymentStatus` - Filter by payment status (unpaid, partially_paid, paid)
- `customerId` - Filter by customer

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "invoiceNumber": "INV-2026-001",
      "customerId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "customer@example.com",
        "rut": "12345678-9"
      },
      "invoiceDate": "2026-01-07T00:00:00Z",
      "dueDate": "2026-02-07T00:00:00Z",
      "items": [
        {
          "description": "Book Title",
          "quantity": 2,
          "unitPrice": 50000,
          "total": 100000
        }
      ],
      "subtotal": 100000,
      "tax": 19000,
      "total": 119000,
      "status": "issued",
      "paymentStatus": "unpaid",
      "amountPaid": 0,
      "amountOwed": 119000,
      "payments": [],
      "createdAt": "2026-01-07T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### POST /api/invoices
Create a new invoice.

**Request Body:**
```json
{
  "invoiceNumber": "INV-2026-001",
  "customerId": "507f1f77bcf86cd799439011",
  "orderId": "507f1f77bcf86cd799439013",
  "items": [
    {
      "description": "Book Title",
      "quantity": 2,
      "unitPrice": 50000,
      "total": 100000,
      "bookId": "507f1f77bcf86cd799439014"
    }
  ],
  "taxRate": 19,
  "notes": "Invoice notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": { /* full invoice object */ }
}
```

### POST /api/invoices/:id/payment
Record a payment for an invoice.

**Request Body:**
```json
{
  "amount": 50000,
  "paymentDate": "2026-01-07T12:00:00Z",
  "paymentMethod": "transfer",
  "reference": "TRANSFER-12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": { /* updated invoice object */ }
}
```

### GET /api/invoices/stats
Get invoice statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInvoices": 50,
    "totalAmount": 5950000,
    "totalPaid": 4750000,
    "totalOwed": 1200000,
    "byStatus": {
      "issued": 20,
      "paid": 25,
      "partially_paid": 5
    },
    "byPaymentStatus": {
      "unpaid": 10,
      "partially_paid": 5,
      "paid": 35
    }
  }
}
```

---

## Stock Management API

**Base URL:** `/api/stock`

### Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | ❌ | Get all stock records |
| GET | `/:id` | ❌ | Get single stock record |
| GET | `/customer/:customerId` | ❌ | Get customer's stock |
| POST | `/` | ✅ | Create stock record |
| PUT | `/:id` | ✅ | Update stock |
| POST | `/:id/reserve` | ✅ | Reserve stock |
| POST | `/:id/release` | ✅ | Release reserved stock |

### GET /api/stock
Get all stock records with optional filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `customerId` - Filter by customer
- `bookId` - Filter by book

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "customerId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "customer@example.com"
      },
      "bookId": {
        "_id": "507f1f77bcf86cd799439014",
        "title": "Book Title",
        "isbn": "978-3-16-148410-0"
      },
      "quantity": 100,
      "reservedQuantity": 20,
      "availableQuantity": 80,
      "location": "Warehouse A - Shelf 5",
      "condition": "new",
      "costPerUnit": 25000,
      "totalCost": 2500000,
      "movements": [
        {
          "type": "in",
          "quantity": 100,
          "reason": "Initial stock",
          "date": "2026-01-01T00:00:00Z"
        }
      ],
      "createdAt": "2026-01-01T00:00:00Z"
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

### POST /api/stock
Create a new stock record.

**Request Body:**
```json
{
  "customerId": "507f1f77bcf86cd799439011",
  "bookId": "507f1f77bcf86cd799439014",
  "quantity": 100,
  "location": "Warehouse A - Shelf 5",
  "costPerUnit": 25000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock created successfully",
  "data": { /* full stock object */ }
}
```

### POST /api/stock/:id/reserve
Reserve stock for an order.

**Request Body:**
```json
{
  "quantity": 20,
  "reason": "Order SA-2026-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock reserved successfully",
  "data": { /* updated stock object */ }
}
```

### POST /api/stock/:id/release
Release reserved stock.

**Request Body:**
```json
{
  "quantity": 10,
  "reason": "Order cancelled"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock released successfully",
  "data": { /* updated stock object */ }
}
```

---

## Shipping Management API

**Base URL:** `/api/shipping`

### Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | ❌ | Get all shipments |
| GET | `/:id` | ❌ | Get single shipment |
| GET | `/order/:orderId` | ❌ | Get order shipments |
| POST | `/` | ✅ | Create shipment |
| PUT | `/:id/status` | ✅ | Update shipment status |
| POST | `/:id/guia-electronica` | ✅ | Generate guía electrónica |

### GET /api/shipping
Get all shipments with optional filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` - Filter by status (pending, prepared, shipped, in_transit, delivered, returned, cancelled)
- `customerId` - Filter by customer
- `orderId` - Filter by order

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "guiaNumber": "GDE-2026-001",
      "orderId": {
        "_id": "507f1f77bcf86cd799439013",
        "orderNumber": "SA-2026-001"
      },
      "customerId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "customer@example.com"
      },
      "shippingDate": "2026-01-07T00:00:00Z",
      "expectedDeliveryDate": "2026-01-10T00:00:00Z",
      "actualDeliveryDate": null,
      "shippingMethod": "courier",
      "carrier": "DHL",
      "trackingNumber": "1234567890",
      "trackingUrl": "https://tracking.dhl.com/1234567890",
      "items": [
        {
          "bookId": "507f1f77bcf86cd799439014",
          "description": "Book Title",
          "quantity": 2,
          "weight": 1.5
        }
      ],
      "totalWeight": 1.5,
      "shippingCost": 15000,
      "shippingAddress": {
        "name": "John Doe",
        "email": "customer@example.com",
        "phone": "+56912345678",
        "address": "Calle Principal 123",
        "commune": "Santiago",
        "region": "Metropolitana",
        "country": "Chile"
      },
      "status": "shipped",
      "guiaElectronica": "generated",
      "guiaElectronicaNumber": "GDE-2026-001",
      "guiaElectronicaUrl": "https://api.sirizagaria.com/guia/GDE-2026-001",
      "createdAt": "2026-01-07T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### POST /api/shipping
Create a new shipment.

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439013",
  "customerId": "507f1f77bcf86cd799439011",
  "invoiceId": "507f1f77bcf86cd799439012",
  "items": [
    {
      "bookId": "507f1f77bcf86cd799439014",
      "description": "Book Title",
      "quantity": 2,
      "weight": 1.5
    }
  ],
  "shippingMethod": "courier",
  "shippingAddress": {
    "name": "John Doe",
    "email": "customer@example.com",
    "phone": "+56912345678",
    "address": "Calle Principal 123",
    "commune": "Santiago",
    "region": "Metropolitana"
  },
  "shippingCost": 15000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shipment created successfully",
  "data": { /* full shipment object */ }
}
```

### PUT /api/shipping/:id/status
Update shipment status.

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "1234567890",
  "trackingUrl": "https://tracking.dhl.com/1234567890",
  "actualDeliveryDate": "2026-01-10T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shipment updated successfully",
  "data": { /* updated shipment object */ }
}
```

### POST /api/shipping/:id/guia-electronica
Generate electronic shipping guide.

**Response:**
```json
{
  "success": true,
  "message": "Guía electrónica generated successfully",
  "data": { /* updated shipment object with guía details */ }
}
```

---

## Purchase Order API

**Base URL:** `/api/purchase-orders`

### Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | ❌ | Get all purchase orders |
| GET | `/:id` | ❌ | Get single purchase order |
| POST | `/` | ✅ | Create purchase order |
| PUT | `/:id` | ✅ | Update purchase order |
| POST | `/:id/receive` | ✅ | Mark as received |
| POST | `/:id/cancel` | ✅ | Cancel purchase order |

### GET /api/purchase-orders
Get all purchase orders with optional filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` - Filter by status (draft, sent, acknowledged, in_progress, partially_received, received, cancelled)
- `customerId` - Filter by customer

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "purchaseOrderNumber": "PO-2026-001",
      "customerId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "customer@example.com"
      },
      "supplierId": "507f1f77bcf86cd799439018",
      "supplierName": "Book Supplier Inc",
      "supplierEmail": "supplier@example.com",
      "supplierPhone": "+56912345678",
      "poDate": "2026-01-07T00:00:00Z",
      "requiredDeliveryDate": "2026-02-07T00:00:00Z",
      "actualDeliveryDate": null,
      "items": [
        {
          "description": "Book Title",
          "quantity": 50,
          "unitPrice": 25000,
          "total": 1250000,
          "sku": "BOOK-001"
        }
      ],
      "subtotal": 1250000,
      "tax": 237500,
      "total": 1487500,
      "status": "sent",
      "paymentTerms": "Net 30",
      "shippingTerms": "FOB",
      "createdAt": "2026-01-07T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 30,
    "pages": 2
  }
}
```

### POST /api/purchase-orders
Create a new purchase order.

**Request Body:**
```json
{
  "purchaseOrderNumber": "PO-2026-001",
  "customerId": "507f1f77bcf86cd799439011",
  "supplierId": "507f1f77bcf86cd799439018",
  "supplierName": "Book Supplier Inc",
  "supplierEmail": "supplier@example.com",
  "supplierPhone": "+56912345678",
  "items": [
    {
      "description": "Book Title",
      "quantity": 50,
      "unitPrice": 25000,
      "total": 1250000,
      "sku": "BOOK-001"
    }
  ],
  "paymentTerms": "Net 30",
  "shippingTerms": "FOB",
  "notes": "PO notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase order created successfully",
  "data": { /* full purchase order object */ }
}
```

### POST /api/purchase-orders/:id/receive
Mark purchase order as received and update stock.

**Request Body:**
```json
{
  "actualDeliveryDate": "2026-02-07T12:00:00Z",
  "receivedItems": [
    {
      "bookId": "507f1f77bcf86cd799439014",
      "quantity": 50,
      "unitPrice": 25000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase order received successfully",
  "data": { /* updated purchase order object */ }
}
```

### POST /api/purchase-orders/:id/cancel
Cancel a purchase order.

**Request Body:**
```json
{
  "reason": "Supplier unable to fulfill"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase order cancelled successfully",
  "data": { /* updated purchase order object */ }
}
```

---

## Accounting (Contabilidad) API

**Base URL:** `/api/contabilidad`

### Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | ✅ | Get all transactions |
| GET | `/summary` | ✅ | Get financial summary |
| GET | `/:id` | ✅ | Get single transaction |
| GET | `/customer/:customerId/summary` | ✅ | Get customer financial summary |
| POST | `/` | ✅ | Create transaction |
| PUT | `/:id` | ✅ | Update transaction |
| POST | `/:id/verify` | ✅ | Verify transaction |
| POST | `/:id/reconcile` | ✅ | Reconcile transaction |

### GET /api/contabilidad
Get all accounting transactions with optional filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `type` - Filter by type (income, expense, adjustment)
- `category` - Filter by category (payment, invoice, purchase_order, refund, adjustment, other)
- `status` - Filter by status (pending, verified, recorded, reconciled)
- `customerId` - Filter by customer
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439019",
      "transactionNumber": "PAY-1704618000000",
      "customerId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "customer@example.com",
        "rut": "12345678-9"
      },
      "transactionDate": "2026-01-07T12:00:00Z",
      "type": "income",
      "category": "payment",
      "description": "Payment for invoice INV-2026-001",
      "amount": 119000,
      "currency": "CLP",
      "relatedInvoiceId": {
        "_id": "507f1f77bcf86cd799439012",
        "invoiceNumber": "INV-2026-001"
      },
      "paymentMethod": "transfer",
      "reference": "TRANSFER-12345",
      "status": "recorded",
      "verifiedBy": "admin-user-id",
      "verifiedDate": "2026-01-07T13:00:00Z",
      "recordedBy": "admin-user-id",
      "recordedDate": "2026-01-07T12:00:00Z",
      "reconciliationStatus": "reconciled",
      "reconciliationDate": "2026-01-08T10:00:00Z",
      "createdAt": "2026-01-07T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "pages": 25
  }
}
```

### GET /api/contabilidad/summary
Get financial summary.

**Query Parameters:**
- `startDate` - From date (ISO format)
- `endDate` - To date (ISO format)
- `customerId` - Filter by customer

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 500,
    "totalIncome": 5950000,
    "totalExpenses": 2500000,
    "netIncome": 3450000,
    "byCategory": {
      "payment": { "income": 5950000, "expense": 0 },
      "invoice": { "income": 0, "expense": 0 },
      "purchase_order": { "income": 0, "expense": 2500000 },
      "refund": { "income": 0, "expense": 0 }
    },
    "byStatus": {
      "pending": 50,
      "verified": 100,
      "recorded": 200,
      "reconciled": 150
    },
    "period": {
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": "2026-01-31T23:59:59Z"
    }
  }
}
```

### GET /api/contabilidad/customer/:customerId/summary
Get customer-specific financial summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "507f1f77bcf86cd799439011",
    "totalIncome": 595000,
    "totalExpenses": 250000,
    "netIncome": 345000,
    "totalInvoiced": 595000,
    "totalPaid": 475000,
    "totalOwed": 120000,
    "invoiceCount": 5,
    "transactionCount": 50
  }
}
```

### POST /api/contabilidad
Create a new accounting transaction.

**Request Body:**
```json
{
  "transactionNumber": "EXP-2026-001",
  "customerId": "507f1f77bcf86cd799439011",
  "type": "expense",
  "category": "other",
  "description": "Office supplies",
  "amount": 50000,
  "paymentMethod": "cash",
  "reference": "RECEIPT-12345",
  "invoiceAttachment": "expense-receipt.pdf",
  "notes": "Monthly office supplies"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": { /* full transaction object */ }
}
```

### POST /api/contabilidad/:id/verify
Verify an accounting transaction.

**Request Body:**
```json
{
  "notes": "Verified against invoice"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction verified successfully",
  "data": { /* updated transaction object */ }
}
```

### POST /api/contabilidad/:id/reconcile
Reconcile an accounting transaction.

**Request Body:**
```json
{
  "reconciliationStatus": "reconciled",
  "notes": "Matched with bank statement"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction reconciled successfully",
  "data": { /* updated transaction object */ }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad request or validation error
- `404` - Resource not found
- `500` - Server error

---

## Authentication

All endpoints marked with ✅ require JWT authentication:

```
x-auth-token: YOUR_JWT_TOKEN
```

---

## Rate Limiting & Pagination

- Default page size: 20 records
- Maximum page size: 100 records
- All list endpoints support pagination with `page` and `limit` parameters

---

## Data Types & Formats

### Currency
- Default: CLP (Chilean Peso)
- All amounts in integers (no decimals)

### Dates
- Format: ISO 8601 (2026-01-07T12:00:00Z)
- Timezone: UTC

### RUT Format
- Format: XX.XXX.XXX-K (e.g., 12.345.678-9)
- Validation required on frontend

---

## Deduplication Strategy

Customers are deduplicated by:
1. RUT (primary identifier)
2. Email (secondary identifier)
3. Name (tertiary identifier)

If a customer with the same RUT or email exists, the system will return an error.

---

## Business Rules

### Invoice Payment
- Payments are automatically recorded in Contabilidad
- Customer debt is automatically updated
- Payment status changes based on amount paid vs total

### Stock Management
- Reserved stock is deducted from available quantity
- Stock movements are tracked for audit trail
- Shipments automatically deduct from stock

### Purchase Orders
- Receiving automatically creates/updates stock
- Accounting entries are automatically created
- Stock movements are tracked

### Accounting
- All payments automatically create income entries
- All purchase orders automatically create expense entries
- Transactions can be verified and reconciled
- Financial summaries available by period and customer
