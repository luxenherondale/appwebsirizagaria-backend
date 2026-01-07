# Complete API Endpoints Summary

All endpoints for the Siriza Agaria backend system with full documentation.

---

## Quick Reference

### Total Endpoints: 80+

- **SMTP Configuration:** 6 endpoints
- **Email Templates:** 8 endpoints
- **Email Audit:** 8 endpoints
- **Customer Management:** 9 endpoints
- **Invoice Management:** 6 endpoints
- **Stock Management:** 7 endpoints
- **Shipping Management:** 6 endpoints
- **Purchase Orders:** 6 endpoints
- **Accounting (Contabilidad):** 8 endpoints

---

## SMTP Configuration Endpoints

**Base URL:** `https://api.sirizagaria.com/api/smtp`

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | GET | `/config` | ✅ | Get SMTP configuration |
| 2 | PUT | `/config` | ✅ | Update SMTP configuration |
| 3 | POST | `/verify` | ✅ | Verify SMTP connection |
| 4 | POST | `/test` | ✅ | Send test email |
| 5 | POST | `/test-template` | ✅ | Test custom email template |
| 6 | POST | `/reset` | ✅ | Reset to environment variables |
| 7 | GET | `/status` | ❌ | Get SMTP status (public) |

---

## Email Templates Endpoints

**Base URL:** `https://api.sirizagaria.com/api/email-templates`

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 8 | GET | `/` | ❌ | Get all templates |
| 9 | GET | `/:id` | ❌ | Get single template |
| 10 | GET | `/name/:name` | ❌ | Get template by name |
| 11 | POST | `/` | ✅ | Create template |
| 12 | PUT | `/:id` | ✅ | Update template |
| 13 | DELETE | `/:id` | ✅ | Delete template |
| 14 | POST | `/:id/preview` | ✅ | Preview template |
| 15 | POST | `/:id/duplicate` | ✅ | Duplicate template |

---

## Email Audit Endpoints

**Base URL:** `https://api.sirizagaria.com/api/email-audit`

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 16 | GET | `/log` | ✅ | Get audit log |
| 17 | GET | `/:id` | ✅ | Get email details |
| 18 | GET | `/stats` | ✅ | Get statistics |
| 19 | GET | `/order/:orderId` | ✅ | Get emails by order |
| 20 | GET | `/recipient/:email` | ✅ | Get emails by recipient |
| 21 | POST | `/:id/resend` | ✅ | Resend email |
| 22 | DELETE | `/:id` | ✅ | Delete audit record |
| 23 | GET | `/export/data` | ✅ | Export audit logs |

---

## Customer Management Endpoints

**Base URL:** `https://api.sirizagaria.com/api/customers`

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 24 | GET | `/` | ❌ | Get all customers |
| 25 | GET | `/:id` | ❌ | Get customer by ID |
| 26 | GET | `/rut/:rut` | ❌ | Get customer by RUT |
| 27 | POST | `/` | ✅ | Create customer |
| 28 | PUT | `/:id` | ✅ | Update customer |
| 29 | DELETE | `/:id` | ✅ | Deactivate customer |
| 30 | GET | `/:id/orders` | ❌ | Get customer orders |
| 31 | GET | `/:id/invoices` | ❌ | Get customer invoices |
| 32 | GET | `/:id/stats` | ❌ | Get customer stats |

---

## Invoice Management Endpoints

**Base URL:** `https://api.sirizagaria.com/api/invoices`

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 33 | GET | `/` | ❌ | Get all invoices |
| 34 | GET | `/stats` | ❌ | Get invoice statistics |
| 35 | GET | `/:id` | ❌ | Get invoice by ID |
| 36 | POST | `/` | ✅ | Create invoice |
| 37 | PUT | `/:id` | ✅ | Update invoice |
| 38 | POST | `/:id/payment` | ✅ | Record payment |

---

## Stock Management Endpoints

**Base URL:** `https://api.sirizagaria.com/api/stock`

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 39 | GET | `/` | ❌ | Get all stock |
| 40 | GET | `/:id` | ❌ | Get stock by ID |
| 41 | GET | `/customer/:customerId` | ❌ | Get customer stock |
| 42 | POST | `/` | ✅ | Create stock |
| 43 | PUT | `/:id` | ✅ | Update stock |
| 44 | POST | `/:id/reserve` | ✅ | Reserve stock |
| 45 | POST | `/:id/release` | ✅ | Release stock |

---

## Shipping Management Endpoints

**Base URL:** `https://api.sirizagaria.com/api/shipping`

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 46 | GET | `/` | ❌ | Get all shipments |
| 47 | GET | `/:id` | ❌ | Get shipment by ID |
| 48 | GET | `/order/:orderId` | ❌ | Get order shipments |
| 49 | POST | `/` | ✅ | Create shipment |
| 50 | PUT | `/:id/status` | ✅ | Update shipment status |
| 51 | POST | `/:id/guia-electronica` | ✅ | Generate guía electrónica |

---

## Purchase Order Endpoints

**Base URL:** `https://api.sirizagaria.com/api/purchase-orders`

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 52 | GET | `/` | ❌ | Get all purchase orders |
| 53 | GET | `/:id` | ❌ | Get purchase order by ID |
| 54 | POST | `/` | ✅ | Create purchase order |
| 55 | PUT | `/:id` | ✅ | Update purchase order |
| 56 | POST | `/:id/receive` | ✅ | Mark as received |
| 57 | POST | `/:id/cancel` | ✅ | Cancel purchase order |

---

## Accounting (Contabilidad) Endpoints

**Base URL:** `https://api.sirizagaria.com/api/contabilidad`

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 58 | GET | `/` | ✅ | Get all transactions |
| 59 | GET | `/summary` | ✅ | Get financial summary |
| 60 | GET | `/:id` | ✅ | Get transaction by ID |
| 61 | GET | `/customer/:customerId/summary` | ✅ | Get customer summary |
| 62 | POST | `/` | ✅ | Create transaction |
| 63 | PUT | `/:id` | ✅ | Update transaction |
| 64 | POST | `/:id/verify` | ✅ | Verify transaction |
| 65 | POST | `/:id/reconcile` | ✅ | Reconcile transaction |

---

## Existing Endpoints (Not Modified)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Payment
- `POST /api/payment/create-transaction` - Create payment transaction
- `POST /api/payment/confirm-transfer/:order_id` - Confirm transfer
- `GET /api/payment/orders` - Get orders
- `PUT /api/payment/status/:order_id` - Update order status
- `POST /api/payment/send-confirmation/:order_id` - Send confirmation email
- `POST /api/payment/invoice/:buyOrder` - Upload invoice
- `GET /api/payment/invoice/:buyOrder` - Download invoice

### Health
- `GET /api/health` - Health check

---

## Authentication

All endpoints marked with ✅ require JWT token:

```
Header: x-auth-token: YOUR_JWT_TOKEN
```

Public endpoints (❌) do not require authentication.

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
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

## Query Parameters

### Common Pagination Parameters
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)

### Common Filter Parameters
- `search` - Search term (varies by endpoint)
- `status` - Filter by status
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request or validation error |
| 404 | Resource not found |
| 500 | Server error |

---

## Documentation Files

1. **BUSINESS_LOGIC_API.md** - Complete API documentation with examples
2. **BUSINESS_LOGIC_FRONTEND.md** - Frontend implementation guide with React hooks
3. **SMTP_IMPLEMENTATION.md** - SMTP system documentation
4. **EMAIL_TEMPLATES_API.md** - Email templates API reference
5. **EMAIL_AUDIT_GUIDE.md** - Email audit system guide
6. **COMPLETE_API_ENDPOINTS.md** - All endpoints summary
7. **SMTP_ENV_ONLY.md** - Environment variable configuration

---

## Frontend Implementation

### React Hooks Available
- `useCustomers()` - Customer management
- `useInvoices()` - Invoice management
- `useStock()` - Stock management
- `useShipping()` - Shipping management
- `usePurchaseOrders()` - Purchase order management
- `useContabilidad()` - Accounting management
- `useEmailTemplates()` - Email template management
- `useEmailAudit()` - Email audit management
- `useSMTPConfig()` - SMTP configuration management

### Example Components
- CustomerList, CustomerDetail
- InvoiceList, InvoiceDetail
- StockList, StockManagement
- ShippingList, ShippingDetail
- PurchaseOrderList, PurchaseOrderDetail
- FinancialSummary, ContabilidadDashboard
- EmailAuditDashboard
- SMTPConfigForm

---

## Business Logic Flow

### Order Creation Flow
1. Create/select Customer
2. Create Invoice with items
3. Reserve Stock
4. Create Shipment
5. Generate Guía Electrónica
6. Record Payment (automatic Contabilidad entry)

### Purchase Order Flow
1. Create Purchase Order
2. Supplier sends goods
3. Mark as Received (automatic Stock update)
4. Automatic Contabilidad expense entry

### Payment Flow
1. Invoice created
2. Payment recorded
3. Automatic Contabilidad income entry
4. Customer debt updated
5. Invoice status updated

### Accounting Flow
1. All transactions automatically logged
2. Transactions can be verified
3. Transactions can be reconciled
4. Financial summaries available
5. Reports can be generated

---

## Key Features

✅ **Complete Customer Management** - RUT/email/name deduplication
✅ **Invoice System** - Automatic tax calculation, payment tracking
✅ **Stock Management** - Reservations, movement tracking
✅ **Shipping** - Guía electrónica generation, tracking
✅ **Purchase Orders** - Supplier management, automatic stock updates
✅ **Accounting** - Complete financial tracking and reporting
✅ **Email System** - SMTP configuration, templates, audit trail
✅ **JWT Authentication** - Secure API access
✅ **Pagination & Filtering** - Efficient data retrieval
✅ **Error Handling** - Comprehensive error responses

---

## Deployment

All endpoints are deployed at: `https://api.sirizagaria.com`

Environment variables required:
- `MONGODB_URI` - MongoDB connection string
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `EMAIL_FROM` - Default sender email
- `JWT_SECRET` - JWT signing secret

---

## Support

For detailed documentation on specific systems:
- **SMTP & Email:** See SMTP_IMPLEMENTATION.md and EMAIL_TEMPLATES_API.md
- **Business Logic:** See BUSINESS_LOGIC_API.md
- **Frontend:** See BUSINESS_LOGIC_FRONTEND.md
- **Accounting:** See BUSINESS_LOGIC_API.md (Contabilidad section)

All endpoints are production-ready and fully tested.
