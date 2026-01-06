# Custom SMTP Implementation Guide

The email sender now supports custom SMTP implementations. You can provide your own SMTP adapter instead of using nodemailer.

## SMTP Adapter Interface

Your custom SMTP adapter must implement this interface:

```javascript
{
  send: async (mailOptions) => {
    // mailOptions object contains:
    // {
    //   from: string,
    //   to: string,
    //   subject: string,
    //   html: string,
    //   cc?: string,
    //   bcc?: string,
    //   replyTo?: string
    // }
    
    // Must return:
    // {
    //   success: true,
    //   messageId: string,
    //   response?: string
    // }
    // OR
    // {
    //   success: false,
    //   error: string
    // }
  },
  
  verify?: async () => {
    // Optional: Verify connection
    // Must return: { success: true } or { success: false, error: string }
  }
}
```

## Implementation Examples

### Example 1: Custom SMTP Implementation

Create a file `utils/customSmtpAdapter.js`:

```javascript
class CustomSmtpAdapter {
  constructor(config) {
    this.config = config;
    // Initialize your SMTP client here
    // this.client = new YourSMTPClient(config);
  }

  async send(mailOptions) {
    try {
      // Your custom SMTP sending logic
      const result = await this.sendViaYourSMTP(mailOptions);
      
      return {
        success: true,
        messageId: result.id,
        response: result.response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verify() {
    try {
      // Your connection verification logic
      await this.client.verify();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendViaYourSMTP(mailOptions) {
    // Implement your SMTP sending logic here
    // This is where you call your SMTP service
    // Return { id: messageId, response: responseString }
  }
}

module.exports = CustomSmtpAdapter;
```

### Example 2: Using Custom Adapter in Server

Update `server.js`:

```javascript
const emailSender = require('./utils/emailSender');
const CustomSmtpAdapter = require('./utils/customSmtpAdapter');

// ... other code ...

connectMongoDB();

// Initialize email service with custom adapter
const customSmtpConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  // Add any other config your SMTP needs
};

const customAdapter = new CustomSmtpAdapter(customSmtpConfig);
const emailInitialized = emailSender.initialize(customAdapter);

if (emailInitialized) {
  console.log('Email service initialized with custom adapter');
} else {
  console.warn('Email service not initialized');
}
```

### Example 3: REST API SMTP Service

If you're using a REST API for SMTP (like SendGrid, Mailgun, etc.):

```javascript
const axios = require('axios');

class RestApiSmtpAdapter {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
    this.fromEmail = config.fromEmail;
  }

  async send(mailOptions) {
    try {
      const response = await axios.post(this.apiUrl, {
        to: mailOptions.to,
        from: mailOptions.from || this.fromEmail,
        subject: mailOptions.subject,
        html: mailOptions.html,
        cc: mailOptions.cc,
        bcc: mailOptions.bcc,
        replyTo: mailOptions.replyTo
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data.id || response.data.message_id,
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verify() {
    try {
      const response = await axios.get(`${this.apiUrl}/verify`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = RestApiSmtpAdapter;
```

### Example 4: Queue-Based SMTP (Async Processing)

If you want to queue emails instead of sending immediately:

```javascript
class QueuedSmtpAdapter {
  constructor(config) {
    this.queue = [];
    this.processing = false;
    this.smtpClient = config.smtpClient;
  }

  async send(mailOptions) {
    // Add to queue
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.queue.push({
      id: messageId,
      mailOptions,
      timestamp: new Date(),
      status: 'queued'
    });

    // Start processing queue if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return {
      success: true,
      messageId,
      response: 'Email queued for sending'
    };
  }

  async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const email = this.queue.shift();
      
      try {
        email.status = 'sending';
        await this.smtpClient.send(email.mailOptions);
        email.status = 'sent';
        console.log(`Email ${email.id} sent successfully`);
      } catch (error) {
        email.status = 'failed';
        email.error = error.message;
        console.error(`Email ${email.id} failed:`, error.message);
        
        // Optionally re-queue failed emails
        // this.queue.push(email);
      }
    }
    
    this.processing = false;
  }

  async verify() {
    return { success: true };
  }
}

module.exports = QueuedSmtpAdapter;
```

## Usage in Payment Controller

The payment controller automatically uses your custom adapter:

```javascript
// This will use your custom adapter
POST /api/payment/send-confirmation/SA123ABC
{
  "email": "customer@example.com"
}
```

The flow is:
1. Controller calls `emailSender.sendEmail()` or `emailSender.sendOrderConfirmationEmail()`
2. Email sender calls your adapter's `send()` method
3. Your adapter handles the SMTP communication
4. Result is returned to controller and client

## Setting Custom Adapter at Runtime

You can also set the adapter after initialization:

```javascript
const emailSender = require('./utils/emailSender');
const CustomAdapter = require('./utils/customSmtpAdapter');

// Later in your code
const adapter = new CustomAdapter(config);
emailSender.setAdapter(adapter);
```

## Error Handling

Your adapter's `send()` method should return:

**Success:**
```javascript
{
  success: true,
  messageId: 'unique-message-id',
  response: 'optional response data'
}
```

**Failure:**
```javascript
{
  success: false,
  error: 'descriptive error message'
}
```

The email sender will handle these responses and return appropriate HTTP status codes to the client.

## Testing Your Adapter

```javascript
const CustomAdapter = require('./utils/customSmtpAdapter');
const emailSender = require('./utils/emailSender');

// Initialize with your adapter
const adapter = new CustomAdapter(config);
emailSender.initialize(adapter);

// Test sending
const result = await emailSender.sendEmail(
  'test@example.com',
  'Test Subject',
  '<p>Test HTML</p>'
);

console.log(result);
// Should output: { success: true, messageId: '...' }
```

## Environment Variables

Your custom adapter can use environment variables:

```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@sirizagaria.com

# For API-based SMTP
SMTP_API_KEY=your-api-key
SMTP_API_URL=https://api.example.com/send
```

## Key Points

- **Adapter is optional** - If not provided, the system tries to use nodemailer
- **Full control** - You have complete control over how emails are sent
- **Async support** - All methods are async, supporting queuing, batching, etc.
- **Error handling** - Return proper success/error responses
- **Flexible** - Works with any SMTP service (direct SMTP, REST API, queue systems, etc.)

## Integration Checklist

- [ ] Create your custom adapter class
- [ ] Implement `send(mailOptions)` method
- [ ] Optionally implement `verify()` method
- [ ] Update `server.js` to initialize with your adapter
- [ ] Add required environment variables
- [ ] Test with `POST /api/payment/send-confirmation/{orderId}`
- [ ] Verify emails are being sent correctly
