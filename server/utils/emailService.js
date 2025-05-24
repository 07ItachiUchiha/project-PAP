const sendEmail = require('./sendEmail');

// Email templates
const emailTemplates = {
  orderConfirmation: (order, user) => ({
    subject: `Order Confirmation - PlantPAP Order #${order._id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5a27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; color: #2d5a27; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 PlantPAP</h1>
            <h2>Order Confirmation</h2>
          </div>
          
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Thank you for your order! We've received your order and are preparing it for shipment.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> #${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
              
              <h4>Items Ordered:</h4>
              ${order.orderItems.map(item => `
                <div class="item">
                  <span>${item.name} (x${item.qty})</span>
                  <span>$${(item.price * item.qty).toFixed(2)}</span>
                </div>
              `).join('')}
              
              <div class="item total">
                <span>Total Amount:</span>
                <span>$${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="order-details">
              <h4>Shipping Address:</h4>
              <p>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}
              </p>
            </div>
            
            <p>We'll send you another email when your order ships with tracking information.</p>
            <p>If you have any questions, please contact our customer service team.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing PlantPAP!</p>
            <p>🌱 Growing happiness, one plant at a time 🌱</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Order Confirmation - PlantPAP Order #${order._id}
      
      Hi ${user.name},
      
      Thank you for your order! We've received your order and are preparing it for shipment.
      
      Order Details:
      Order Number: #${order._id}
      Order Date: ${new Date(order.createdAt).toLocaleDateString()}
      Payment Status: ${order.paymentStatus}
      
      Items Ordered:
      ${order.orderItems.map(item => `${item.name} (x${item.qty}) - $${(item.price * item.qty).toFixed(2)}`).join('\n')}
      
      Total Amount: $${order.totalPrice.toFixed(2)}
      
      Shipping Address:
      ${order.shippingAddress.address}
      ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}
      ${order.shippingAddress.country}
      
      We'll send you another email when your order ships with tracking information.
      
      Thank you for choosing PlantPAP!
    `
  }),

  orderStatusUpdate: (order, user, status) => ({
    subject: `Order Update - PlantPAP Order #${order._id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5a27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status-update { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; text-align: center; }
          .status { font-size: 24px; font-weight: bold; color: #2d5a27; margin: 10px 0; }
          .order-summary { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 PlantPAP</h1>
            <h2>Order Status Update</h2>
          </div>
          
          <div class="content">
            <p>Hi ${user.name},</p>
            
            <div class="status-update">
              <p>Your order status has been updated:</p>
              <div class="status">${status.toUpperCase()}</div>
              ${status === 'shipped' ? `
                <p>🚚 Your order is on its way!</p>
                ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
              ` : status === 'delivered' ? `
                <p>📦 Your order has been delivered!</p>
                <p>We hope you love your new plants!</p>
              ` : `
                <p>We'll keep you updated on your order progress.</p>
              `}
            </div>
            
            <div class="order-summary">
              <h4>Order Summary:</h4>
              <p><strong>Order Number:</strong> #${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> $${order.totalPrice.toFixed(2)}</p>
            </div>
            
            <p>If you have any questions, please contact our customer service team.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing PlantPAP!</p>
            <p>🌱 Growing happiness, one plant at a time 🌱</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Order Status Update - PlantPAP Order #${order._id}
      
      Hi ${user.name},
      
      Your order status has been updated: ${status.toUpperCase()}
      
      Order Summary:
      Order Number: #${order._id}
      Order Date: ${new Date(order.createdAt).toLocaleDateString()}
      Total Amount: $${order.totalPrice.toFixed(2)}
      
      ${status === 'shipped' ? `Your order is on its way!${order.trackingNumber ? ` Tracking Number: ${order.trackingNumber}` : ''}` : 
        status === 'delivered' ? 'Your order has been delivered! We hope you love your new plants!' : 
        'We\'ll keep you updated on your order progress.'}
      
      Thank you for choosing PlantPAP!
    `
  }),

  welcomeEmail: (user) => ({
    subject: 'Welcome to PlantPAP! 🌱',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to PlantPAP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5a27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .welcome-box { background: white; padding: 20px; margin: 10px 0; border-radius: 5px; text-align: center; }
          .tips { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 Welcome to PlantPAP! 🌱</h1>
          </div>
          
          <div class="content">
            <div class="welcome-box">
              <h2>Hi ${user.name}!</h2>
              <p>Welcome to the PlantPAP family! We're excited to help you grow your plant collection and bring more green into your life.</p>
            </div>
            
            <div class="tips">
              <h3>🌿 Getting Started Tips:</h3>
              <ul>
                <li>Browse our collection of beautiful plants</li>
                <li>Check out our plant care guides</li>
                <li>Join our community for tips and advice</li>
                <li>Follow us for plant care tips and new arrivals</li>
              </ul>
            </div>
            
            <div class="welcome-box">
              <p>Ready to start your plant journey?</p>
              <p><strong>Happy planting! 🌱</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for joining PlantPAP!</p>
            <p>🌱 Growing happiness, one plant at a time 🌱</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to PlantPAP! 🌱
      
      Hi ${user.name}!
      
      Welcome to the PlantPAP family! We're excited to help you grow your plant collection and bring more green into your life.
      
      Getting Started Tips:
      - Browse our collection of beautiful plants
      - Check out our plant care guides
      - Join our community for tips and advice
      - Follow us for plant care tips and new arrivals
      
      Ready to start your plant journey?
      Happy planting! 🌱
      
      Thank you for joining PlantPAP!
    `
  })
};

// Email service functions
const emailService = {
  async sendOrderConfirmation(order, user) {
    try {
      const template = emailTemplates.orderConfirmation(order, user);
      await sendEmail({
        email: user.email,
        subject: template.subject,
        html: template.html,
        message: template.text
      });
      console.log(`Order confirmation email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      throw error;
    }
  },

  async sendOrderStatusUpdate(order, user, status) {
    try {
      const template = emailTemplates.orderStatusUpdate(order, user, status);
      await sendEmail({
        email: user.email,
        subject: template.subject,
        html: template.html,
        message: template.text
      });
      console.log(`Order status update email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send order status update email:', error);
      throw error;
    }
  },

  async sendWelcomeEmail(user) {
    try {
      const template = emailTemplates.welcomeEmail(user);
      await sendEmail({
        email: user.email,
        subject: template.subject,
        html: template.html,
        message: template.text
      });
      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }
};

module.exports = {
  emailService,
  emailTemplates
};
