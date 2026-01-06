const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    this.templatesDir = path.join(__dirname, '..', 'templates');
  }

  /**
   * Load and render an email template
   * @param {string} templateName - Name of the template file (without .html)
   * @param {object} data - Data to interpolate into the template
   * @returns {string} Rendered HTML
   */
  renderTemplate(templateName, data) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templateName}`);
      }

      let html = fs.readFileSync(templatePath, 'utf8');

      // Replace simple placeholders {{key}}
      Object.keys(data).forEach(key => {
        const value = data[key];
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value || '');
      });

      // Handle conditional blocks {{#key}}...{{/key}}
      html = this.processConditionals(html, data);

      // Handle item rows for tables
      if (data.items && data.itemsRows === undefined) {
        data.itemsRows = this.generateItemRows(data.items);
        const itemsRegex = /{{itemsRows}}/g;
        html = html.replace(itemsRegex, data.itemsRows);
      }

      return html;
    } catch (error) {
      console.error('Error rendering template:', error.message);
      throw error;
    }
  }

  /**
   * Process conditional blocks in templates
   * @param {string} html - HTML content
   * @param {object} data - Data object
   * @returns {string} Processed HTML
   */
  processConditionals(html, data) {
    const conditionalRegex = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g;
    
    return html.replace(conditionalRegex, (match, key, content) => {
      if (data[key]) {
        // Replace nested placeholders within the conditional block
        let processedContent = content;
        Object.keys(data).forEach(dataKey => {
          const value = data[dataKey];
          const regex = new RegExp(`{{${dataKey}}}`, 'g');
          processedContent = processedContent.replace(regex, value || '');
        });
        return processedContent;
      }
      return '';
    });
  }

  /**
   * Generate table rows for order items
   * @param {array} items - Array of order items
   * @returns {string} HTML table rows
   */
  generateItemRows(items) {
    return items.map(item => `
      <tr>
        <td>${item.product}</td>
        <td>${item.quantity}</td>
        <td>$${this.formatCurrency(item.unit_price)}</td>
        <td>$${this.formatCurrency(item.quantity * item.unit_price)}</td>
      </tr>
    `).join('');
  }

  /**
   * Format currency value
   * @param {number} value - Value to format
   * @returns {string} Formatted currency
   */
  formatCurrency(value) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('CLP', '').trim();
  }

  /**
   * Format date to Spanish locale
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  /**
   * Prepare order confirmation email data
   * @param {object} order - Order document from MongoDB
   * @returns {object} Data for template rendering
   */
  prepareOrderConfirmationData(order) {
    const statusMap = {
      'confirmed': 'Confirmado',
      'pending_payment': 'Pago Pendiente',
      'initiated': 'Iniciado',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado',
      'failed': 'Fallido'
    };

    const statusClassMap = {
      'confirmed': 'confirmed',
      'pending_payment': 'pending',
      'initiated': 'pending',
      'shipped': 'confirmed',
      'delivered': 'confirmed',
      'cancelled': 'cancelled',
      'refunded': 'cancelled',
      'failed': 'failed'
    };

    return {
      orderNumber: order.buy_order,
      orderDate: this.formatDate(order.created_at),
      status: statusMap[order.status] || order.status,
      statusClass: statusClassMap[order.status] || 'pending',
      subtotal: this.formatCurrency(order.subtotal),
      shippingCost: this.formatCurrency(order.shipping_cost),
      total: this.formatCurrency(order.total),
      items: order.items,
      itemsRows: this.generateItemRows(order.items),
      customerName: order.customer.nombre,
      email: order.customer.email,
      phone: order.customer.telefono,
      address: order.customer.direccion,
      commune: order.customer.comuna,
      region: order.customer.region,
      trackingNumber: order.tracking_number || null,
      trackingUrl: `${process.env.FRONTEND_URL || 'https://sirizagaria.com'}/rastrear/${order.buy_order}`,
      notes: order.customer.notas || null
    };
  }

  /**
   * Prepare transfer confirmation email data
   * @param {object} order - Order document from MongoDB
   * @returns {object} Data for template rendering
   */
  prepareTransferConfirmationData(order) {
    return {
      orderNumber: order.buy_order,
      total: this.formatCurrency(order.total),
      confirmationDate: this.formatDate(order.confirmed_at || new Date()),
      customerName: order.customer.nombre,
      phone: order.customer.telefono,
      address: order.customer.direccion,
      commune: order.customer.comuna,
      region: order.customer.region,
      notes: order.transaction_data?.confirmation_notes || null
    };
  }

  /**
   * Prepare shipping notification email data
   * @param {object} order - Order document from MongoDB
   * @returns {object} Data for template rendering
   */
  prepareShippingNotificationData(order) {
    return {
      orderNumber: order.buy_order,
      trackingNumber: order.tracking_number,
      shippingDate: this.formatDate(new Date()),
      customerName: order.customer.nombre,
      address: order.customer.direccion,
      commune: order.customer.comuna,
      region: order.customer.region,
      trackingUrl: `${process.env.FRONTEND_URL || 'https://sirizagaria.com'}/rastrear/${order.buy_order}`
    };
  }

  /**
   * Get available templates
   * @returns {array} List of available template names
   */
  getAvailableTemplates() {
    try {
      const files = fs.readdirSync(this.templatesDir);
      return files
        .filter(file => file.endsWith('.html'))
        .map(file => file.replace('.html', ''));
    } catch (error) {
      console.error('Error reading templates directory:', error.message);
      return [];
    }
  }
}

module.exports = new EmailService();
