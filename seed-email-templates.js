const mongoose = require('mongoose');
require('dotenv').config();

const EmailTemplate = require('./models/emailTemplate');

const defaultTemplates = [
  {
    name: 'order-confirmation',
    displayName: 'Order Confirmation',
    description: 'Email sent to customer when order is confirmed',
    subject: 'Confirmación de Orden - Siriza Agaria',
    type: 'order-confirmation',
    isDefault: true,
    isActive: true,
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Confirmación de Orden</h1>
            <p>Estimado/a {{customerName}},</p>
            <p>Gracias por tu compra. Tu orden ha sido confirmada.</p>
            
            <h2>Detalles de la Orden</h2>
            <p><strong>Número de Orden:</strong> {{orderNumber}}</p>
            <p><strong>Fecha:</strong> {{orderDate}}</p>
            <p><strong>Estado:</strong> {{status}}</p>
            
            <h3>Artículos</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f0f0f0;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Producto</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Cantidad</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Precio</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                {{itemsRows}}
              </tbody>
            </table>
            
            <h3>Resumen de Pago</h3>
            <p><strong>Subtotal:</strong> ${{subtotal}}</p>
            <p><strong>Envío:</strong> ${{shippingCost}}</p>
            <p style="font-size: 18px;"><strong>Total:</strong> ${{total}}</p>
            
            <h3>Información de Entrega</h3>
            <p><strong>Nombre:</strong> {{customerName}}</p>
            <p><strong>Dirección:</strong> {{address}}</p>
            <p><strong>Comuna:</strong> {{commune}}</p>
            <p><strong>Región:</strong> {{region}}</p>
            <p><strong>Teléfono:</strong> {{phone}}</p>
            
            {{#trackingNumber}}
            <h3>Rastreo</h3>
            <p><strong>Número de Seguimiento:</strong> {{trackingNumber}}</p>
            <p><a href="{{trackingUrl}}">Rastrear tu orden</a></p>
            {{/trackingNumber}}
            
            {{#notes}}
            <h3>Notas</h3>
            <p>{{notes}}</p>
            {{/notes}}
            
            <hr>
            <p style="color: #666; font-size: 12px;">
              Si tienes preguntas, contáctanos en support@sirizagaria.com
            </p>
          </div>
        </body>
      </html>
    `,
    placeholders: [
      { name: 'customerName', description: 'Customer full name', required: true },
      { name: 'orderNumber', description: 'Order ID', required: true },
      { name: 'orderDate', description: 'Order creation date', required: true },
      { name: 'status', description: 'Order status', required: true },
      { name: 'items', description: 'Array of order items', required: true },
      { name: 'subtotal', description: 'Order subtotal', required: true },
      { name: 'shippingCost', description: 'Shipping cost', required: true },
      { name: 'total', description: 'Total amount', required: true },
      { name: 'address', description: 'Delivery address', required: true },
      { name: 'commune', description: 'Commune/City', required: true },
      { name: 'region', description: 'Region/State', required: true },
      { name: 'phone', description: 'Customer phone', required: true },
      { name: 'trackingNumber', description: 'Tracking number', required: false },
      { name: 'trackingUrl', description: 'Tracking URL', required: false },
      { name: 'notes', description: 'Additional notes', required: false }
    ]
  },
  {
    name: 'transfer-confirmation',
    displayName: 'Transfer Confirmation',
    description: 'Email sent when bank transfer payment is confirmed',
    subject: 'Transferencia Confirmada - Siriza Agaria',
    type: 'transfer-confirmation',
    isDefault: true,
    isActive: true,
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Transferencia Confirmada</h1>
            <p>Estimado/a {{customerName}},</p>
            <p>Hemos recibido tu transferencia bancaria. Tu orden ha sido confirmada.</p>
            
            <h2>Detalles de la Transferencia</h2>
            <p><strong>Número de Orden:</strong> {{orderNumber}}</p>
            <p><strong>Monto:</strong> ${{total}}</p>
            <p><strong>Fecha de Confirmación:</strong> {{confirmationDate}}</p>
            
            <h3>Información de Entrega</h3>
            <p><strong>Nombre:</strong> {{customerName}}</p>
            <p><strong>Dirección:</strong> {{address}}</p>
            <p><strong>Comuna:</strong> {{commune}}</p>
            <p><strong>Región:</strong> {{region}}</p>
            <p><strong>Teléfono:</strong> {{phone}}</p>
            
            {{#notes}}
            <h3>Notas</h3>
            <p>{{notes}}</p>
            {{/notes}}
            
            <p>Tu orden será procesada y enviada pronto. Recibirás un email con el número de seguimiento.</p>
            
            <hr>
            <p style="color: #666; font-size: 12px;">
              Si tienes preguntas, contáctanos en support@sirizagaria.com
            </p>
          </div>
        </body>
      </html>
    `,
    placeholders: [
      { name: 'customerName', description: 'Customer full name', required: true },
      { name: 'orderNumber', description: 'Order ID', required: true },
      { name: 'total', description: 'Total amount transferred', required: true },
      { name: 'confirmationDate', description: 'Confirmation date', required: true },
      { name: 'address', description: 'Delivery address', required: true },
      { name: 'commune', description: 'Commune/City', required: true },
      { name: 'region', description: 'Region/State', required: true },
      { name: 'phone', description: 'Customer phone', required: true },
      { name: 'notes', description: 'Additional notes', required: false }
    ]
  },
  {
    name: 'shipping-notification',
    displayName: 'Shipping Notification',
    description: 'Email sent when order is shipped with tracking information',
    subject: 'Tu Orden ha sido Enviada - Siriza Agaria',
    type: 'shipping-notification',
    isDefault: true,
    isActive: true,
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>¡Tu Orden ha sido Enviada!</h1>
            <p>Estimado/a {{customerName}},</p>
            <p>Tu orden ha sido enviada y está en camino.</p>
            
            <h2>Información de Envío</h2>
            <p><strong>Número de Orden:</strong> {{orderNumber}}</p>
            <p><strong>Número de Seguimiento:</strong> {{trackingNumber}}</p>
            <p><strong>Fecha de Envío:</strong> {{shippingDate}}</p>
            
            <h3>Dirección de Entrega</h3>
            <p><strong>Nombre:</strong> {{customerName}}</p>
            <p><strong>Dirección:</strong> {{address}}</p>
            <p><strong>Comuna:</strong> {{commune}}</p>
            <p><strong>Región:</strong> {{region}}</p>
            
            <h3>Rastrear tu Orden</h3>
            <p><a href="{{trackingUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Rastrear Envío
            </a></p>
            
            <p>Puedes usar el número de seguimiento {{trackingNumber}} para rastrear tu paquete en tiempo real.</p>
            
            <hr>
            <p style="color: #666; font-size: 12px;">
              Si tienes preguntas, contáctanos en support@sirizagaria.com
            </p>
          </div>
        </body>
      </html>
    `,
    placeholders: [
      { name: 'customerName', description: 'Customer full name', required: true },
      { name: 'orderNumber', description: 'Order ID', required: true },
      { name: 'trackingNumber', description: 'Tracking number', required: true },
      { name: 'shippingDate', description: 'Shipping date', required: true },
      { name: 'address', description: 'Delivery address', required: true },
      { name: 'commune', description: 'Commune/City', required: true },
      { name: 'region', description: 'Region/State', required: true },
      { name: 'trackingUrl', description: 'Tracking URL', required: true }
    ]
  }
];

async function seedTemplates() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('\nSeeding email templates...');
    
    for (const template of defaultTemplates) {
      const existing = await EmailTemplate.findOne({ name: template.name });
      
      if (existing) {
        console.log(`⏭️  Template "${template.name}" already exists, skipping...`);
      } else {
        await EmailTemplate.create(template);
        console.log(`✅ Created template: ${template.displayName}`);
      }
    }

    console.log('\n✅ Email templates seeded successfully');
    
    const count = await EmailTemplate.countDocuments();
    console.log(`Total templates in database: ${count}`);

  } catch (error) {
    console.error('❌ Error seeding templates:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedTemplates();
