# Backend Endpoints and Implementations Summary

## Overview
Complete list of all API endpoints and new implementations added to the Siriza Agaria backend for payment processing, order management, email templating, and invoice handling.

---

## API Endpoints

### Payment & Transaction Endpoints

#### 1. **Create Payment Transaction**
- **Route:** `POST /api/payment/create`
- **Authentication:** None (public)
- **Description:** Creates a new payment order and initiates payment process
- **Request Body:**
  ```json
  {
    "nombre": "string",
    "email": "string",
    "telefono": "string",
    "region": "string",
    "comuna": "string",
    "direccion": "string",
    "notas": "string (optional)",
    "cantidad": "number",
    "payment_method": "webpay | transferencia",
    "subtotal": "number",
    "shipping_cost": "number",
    "total": "number",
    "return_url": "string (optional)"
  }
  ```
- **Response:**
  - **Webpay:** Returns redirect URL to Transbank payment page
  - **Transferencia:** Returns order ID for manual transfer
- **Status Codes:** 200 (success), 400 (validation error), 500 (server error)

#### 2. **Confirm Transaction (Transbank Callback)**
- **Route:** `POST /api/payment/return` or `GET /api/payment/return`
- **Authentication:** None (Transbank callback)
- **Description:** Handles Transbank payment confirmation and redirects user
- **Parameters:** `token_ws`, `TBK_TOKEN`, `TBK_ORDEN_COMPRA`, `TBK_ID_SESION`
- **Response:** Redirects to frontend with payment status
- **Status Codes:** 200 (redirect), 400 (missing token), 404 (order not found)

#### 3. **Get Transaction Status**
- **Route:** `GET /api/payment/status/:order_id`
- **Authentication:** None (public)
- **Description:** Retrieves current status of an order/transaction
- **Parameters:** `order_id` (buy_order)
- **Response:**
  ```json
  {
    "success": true,
    "order": {
      "order_id": "string",
      "status": "string",
      "total": "number",
      "customer_email": "string",
      "created_at": "date",
      "confirmed_at": "date (optional)",
      "transaction_data": {
        "authorization_code": "string",
        "card_last4": "string"
      }
    },
    "transbank_status": "object (optional)"
  }
  ```
- **Status Codes:** 200 (success), 404 (order not found), 500 (error)

#### 4. **Refund Transaction**
- **Route:** `POST /api/payment/refund/:order_id`
- **Authentication:** Required (JWT token in `x-auth-token` header)
- **Description:** Processes refund for a confirmed order
- **Parameters:** `order_id` (buy_order)
- **Request Body:**
  ```json
  {
    "amount": "number (optional, defaults to full amount)"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Reembolso procesado exitosamente",
    "data": "object"
  }
  ```
- **Status Codes:** 200 (success), 400 (invalid status), 404 (order not found), 500 (error)

#### 5. **Retry Failed Payment**
- **Route:** `POST /api/payment/retry/:order_id`
- **Authentication:** None (public)
- **Description:** Allows customer to retry a failed or cancelled payment
- **Parameters:** `order_id` (buy_order)
- **Request Body:**
  ```json
  {
    "return_url": "string (optional)"
  }
  ```
- **Response:** Returns new Transbank redirect URL
- **Status Codes:** 200 (success), 400 (invalid status), 404 (order not found), 500 (error)

---

### Order Management Endpoints (Admin Only)

#### 6. **Get All Orders**
- **Route:** `GET /api/payment/orders`
- **Authentication:** Required (JWT token)
- **Description:** Retrieves paginated list of all orders with optional filtering
- **Query Parameters:**
  - `status` (optional): Filter by order status
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 20): Items per page
- **Response:**
  ```json
  {
    "success": true,
    "orders": [
      {
        "buy_order": "string",
        "status": "string",
        "total": "number",
        "customer": "object",
        "created_at": "date"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "pages": "number"
    }
  }
  ```
- **Status Codes:** 200 (success), 500 (error)

#### 7. **Confirm Bank Transfer Payment**
- **Route:** `POST /api/payment/confirm-transfer/:order_id`
- **Authentication:** Required (JWT token)
- **Description:** Confirms a bank transfer payment and updates order status
- **Parameters:** `order_id` (buy_order)
- **Request Body:**
  ```json
  {
    "confirmation_notes": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Pago por transferencia confirmado",
    "order": {
      "order_id": "string",
      "status": "confirmed",
      "confirmed_at": "date"
    }
  }
  ```
- **Status Codes:** 200 (success), 400 (invalid payment method), 404 (order not found), 500 (error)

#### 8. **Update Order Status**
- **Route:** `PUT /api/payment/status/:order_id`
- **Authentication:** Required (JWT token)
- **Description:** Updates order status and optionally adds tracking number
- **Parameters:** `order_id` (buy_order)
- **Request Body:**
  ```json
  {
    "status": "initiated | pending_payment | confirmed | cancelled | refunded | failed | shipped | delivered",
    "notes": "string (optional)",
    "tracking_number": "string (optional, for shipped status)"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Estado actualizado a: {status}",
    "order": {
      "order_id": "string",
      "status": "string",
      "previous_status": "string",
      "tracking_number": "string (optional)"
    }
  }
  ```
- **Status Codes:** 200 (success), 400 (invalid status), 404 (order not found), 500 (error)

---

### Email Endpoints (Admin Only)

#### 9. **Send Confirmation Email**
- **Route:** `POST /api/payment/send-confirmation/:order_id`
- **Authentication:** Required (JWT token)
- **Description:** Sends templated confirmation email to customer
- **Parameters:** `order_id` (buy_order)
- **Request Body:**
  ```json
  {
    "email": "string (optional, uses order customer email if not provided)",
    "template": "order-confirmation | transfer-confirmation | shipping-notification (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Email sent successfully",
    "email_sent_to": "string",
    "order_id": "string",
    "status": "string",
    "template": "string",
    "messageId": "string"
  }
  ```
- **Status Codes:** 200 (success), 503 (email service not configured), 500 (error)
- **Auto Template Selection:**
  - Bank transfer + confirmed → `transfer-confirmation`
  - Status = shipped → `shipping-notification`
  - Default → `order-confirmation`

---

### Invoice Endpoints (Admin Only)

#### 10. **Upload Invoice**
- **Route:** `POST /api/payment/invoice/:buyOrder`
- **Authentication:** Required (JWT token)
- **Description:** Uploads PDF invoice for an order
- **Parameters:** `buyOrder` (buy_order)
- **Request:** Multipart form data with file field `invoice`
- **File Requirements:**
  - Type: PDF only
  - Max size: 10MB
- **Response:**
  ```json
  {
    "success": true,
    "message": "Invoice uploaded successfully",
    "invoice_url": "string",
    "order_id": "string"
  }
  ```
- **Status Codes:** 200 (success), 400 (invalid file), 404 (order not found), 500 (error)

#### 11. **Download Invoice**
- **Route:** `GET /api/payment/invoice/:buyOrder`
- **Authentication:** Required (JWT token)
- **Description:** Retrieves invoice URL for download
- **Parameters:** `buyOrder` (buy_order)
- **Response:**
  ```json
  {
    "success": true,
    "invoice_url": "string",
    "order_id": "string"
  }
  ```
- **Status Codes:** 200 (success), 404 (order not found or no invoice), 500 (error)

---

## New Modules and Implementations

### 1. Email Service Module (`utils/emailService.js`)

**Purpose:** Template rendering engine for email generation

**Key Methods:**

- **`renderTemplate(templateName, data)`**
  - Loads HTML template and replaces placeholders
  - Handles conditional blocks `{{#key}}...{{/key}}`
  - Generates dynamic table rows from data
  - Returns: Fully rendered HTML string

- **`prepareOrderConfirmationData(order)`**
  - Converts order document to template data
  - Formats currency (CLP) and dates (Spanish locale)
  - Generates item table rows
  - Returns: Data object for template

- **`prepareTransferConfirmationData(order)`**
  - Prepares data for bank transfer confirmation emails
  - Includes confirmation date and notes
  - Returns: Data object for template

- **`prepareShippingNotificationData(order)`**
  - Prepares data for shipping notification emails
  - Includes tracking number and shipping date
  - Returns: Data object for template

- **`formatCurrency(value)`**
  - Formats numbers as Chilean CLP currency
  - Example: 50000 → "50.000"

- **`formatDate(date)`**
  - Formats dates to Spanish locale
  - Example: "6 de enero de 2024 20:30"

- **`generateItemRows(items)`**
  - Converts order items array to HTML table rows
  - Returns: HTML string

- **`getAvailableTemplates()`**
  - Lists all available email templates
  - Returns: Array of template names

### 2. Email Sender Module (`utils/emailSender.js`)

**Purpose:** Handles email sending with pluggable SMTP adapters

**Key Methods:**

- **`initialize(customAdapter)`**
  - Initializes email service with optional custom SMTP adapter
  - Falls back to nodemailer if available
  - Returns: Boolean (success/failure)

- **`setAdapter(adapter)`**
  - Registers custom SMTP adapter
  - Validates adapter implements required interface
  - Throws error if invalid

- **`sendEmail(to, subject, html, options)`**
  - Sends raw HTML email via SMTP adapter
  - Options: cc, bcc, replyTo, etc.
  - Returns: `{ success: true, messageId: string }`

- **`sendTemplateEmail(to, subject, templateName, templateData, options)`**
  - Renders template and sends email
  - Combines rendering and sending
  - Returns: Result object

- **`sendOrderConfirmationEmail(order, to)`**
  - Convenience method for order confirmation emails
  - Auto-prepares data and renders template
  - Returns: Result object

- **`sendTransferConfirmationEmail(order, to)`**
  - Convenience method for transfer confirmation emails
  - Returns: Result object

- **`sendShippingNotificationEmail(order, to)`**
  - Convenience method for shipping notification emails
  - Returns: Result object

- **`verifyConnection()`**
  - Tests SMTP connection
  - Returns: `{ success: true/false, error?: string }`

- **`isReady()`**
  - Checks if email service is initialized
  - Returns: Boolean

### 3. Email Templates (`/templates/`)

#### **order-confirmation.html**
- Professional order confirmation email
- Displays order number, date, status
- Itemized product table with pricing
- Customer shipping information
- Conditional tracking number section
- Special notes section

#### **transfer-confirmation.html**
- Bank transfer payment confirmation
- Shows order details and confirmation date
- Displays shipping information
- Admin notes section
- Next steps guidance

#### **shipping-notification.html**
- Shipping notification email
- Prominent tracking number display
- Order and delivery details
- Tracking URL for customer follow-up
- Estimated delivery timeframe

**Template Features:**
- Responsive design (desktop & mobile)
- Professional styling with gradients
- Placeholder system: `{{key}}`
- Conditional blocks: `{{#key}}...{{/key}}`
- Dynamic table rows: `{{itemsRows}}`
- Spanish language with proper localization

---

## Order Model Updates (`models/order.js`)

### New Fields Added

- **`invoice_url`** (String, optional)
  - Stores path to uploaded invoice PDF
  - Used for transfer and manual payment orders

- **`tracking_number`** (String, optional)
  - Stores shipping tracking number
  - Added when order status changes to "shipped"

### Updated Status Enum

Added two new statuses:
- **`shipped`** - Order has been dispatched
- **`delivered`** - Order has been delivered

**Complete Status List:**
```
['initiated', 'pending_payment', 'confirmed', 'cancelled', 'refunded', 'failed', 'shipped', 'delivered']
```

### Static Methods

- **`generateBuyOrder()`**
  - Generates unique order ID (format: SA...)
  - Uses timestamp + random string
  - Max length: 26 characters

- **`generateSessionId()`**
  - Generates unique session ID for Transbank
  - Format: session_TIMESTAMP_RANDOM
  - Max length: 61 characters

---

## Route Configuration (`routes/payment.js`)

### Multer Configuration for Invoice Uploads

**Storage Settings:**
- Destination: `/uploads/invoices/`
- Filename: `invoice_TIMESTAMP_RANDOM.pdf`
- Max file size: 10MB
- Accepted types: PDF only

### Route Summary

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/create` | No | Create transaction |
| POST/GET | `/return` | No | Transbank callback |
| GET | `/status/:order_id` | No | Get order status |
| POST | `/refund/:order_id` | Yes | Refund payment |
| POST | `/retry/:order_id` | No | Retry payment |
| GET | `/orders` | Yes | List all orders |
| POST | `/confirm-transfer/:order_id` | Yes | Confirm transfer |
| PUT | `/status/:order_id` | Yes | Update status |
| POST | `/send-confirmation/:order_id` | Yes | Send email |
| POST | `/invoice/:buyOrder` | Yes | Upload invoice |
| GET | `/invoice/:buyOrder` | Yes | Download invoice |

---

## Environment Configuration

### SMTP Settings (`.env`)

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@sirizagaria.com
```

### Existing Settings Used

```env
# Transbank Configuration
TBK_COMMERCE_CODE=597052958374
TBK_API_KEY=c5d59ef5-514c-4792-8f30-b2b0089bf0ea
TBK_BASE_URL=https://webpay3g.transbank.cl

# Frontend URL
FRONTEND_URL=https://sirizagaria.com
```

---

## Authentication

### JWT Token Authentication

**Header:** `x-auth-token`

**Protected Endpoints:**
- `POST /api/payment/refund/:order_id`
- `GET /api/payment/orders`
- `POST /api/payment/confirm-transfer/:order_id`
- `PUT /api/payment/status/:order_id`
- `POST /api/payment/send-confirmation/:order_id`
- `POST /api/payment/invoice/:buyOrder`
- `GET /api/payment/invoice/:buyOrder`

**Middleware:** `middleware/auth.js`

---

## Order Status Flow

```
initiated
    ↓
pending_payment ← (webpay or transferencia)
    ↓
confirmed ← (payment successful or transfer confirmed)
    ↓
shipped ← (admin updates status)
    ↓
delivered ← (admin updates status)

Alternative paths:
pending_payment → failed → (retry) → pending_payment
pending_payment → cancelled
confirmed → refunded
```

---

## File Structure

```
/home/sebastian/projects/appwebsirizagaria-backend/
├── controllers/
│   └── payment.js (11 exported functions)
├── routes/
│   └── payment.js (11 endpoints)
├── models/
│   └── order.js (updated schema)
├── utils/
│   ├── emailService.js (template rendering)
│   └── emailSender.js (email sending)
├── templates/
│   ├── order-confirmation.html
│   ├── transfer-confirmation.html
│   └── shipping-notification.html
├── uploads/
│   └── invoices/ (invoice storage)
├── middleware/
│   └── auth.js (JWT authentication)
└── .env (SMTP configuration)
```

---

## Summary Statistics

- **Total Endpoints:** 11
- **Admin-Only Endpoints:** 6
- **Public Endpoints:** 5
- **New Modules:** 2 (emailService, emailSender)
- **Email Templates:** 3
- **Order Statuses:** 8
- **New Model Fields:** 2

---

## Integration Notes

### Email Sending
- System is ready to render emails
- Requires custom SMTP adapter or nodemailer installation
- See `CUSTOM_SMTP_GUIDE.md` for implementation details

### Invoice Handling
- Invoices stored in `/uploads/invoices/`
- Only PDF files accepted
- Max 10MB per file
- Associated with orders via `invoice_url` field

### Payment Methods
- **Webpay:** Integrated with Transbank API
- **Transferencia:** Manual confirmation by admin

### Order Tracking
- Tracking numbers stored in `tracking_number` field
- Shipping notification emails include tracking URL
- Frontend can display tracking info to customers
