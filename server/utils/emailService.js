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
  }),

  returnRequestConfirmation: (returnRequest, user) => ({
    subject: `Return Request Confirmation - PlantPAP Return #${returnRequest.returnNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Return Request Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5a27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .return-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .status { padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .status-requested { background: #fef3c7; color: #92400e; }
          .total { font-weight: bold; font-size: 18px; color: #dc2626; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 PlantPAP</h1>
            <h2>Return Request Received</h2>
          </div>
          
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>We've received your return request and are reviewing it. We'll process your request within 2-3 business days.</p>
            
            <div class="return-details">
              <h3>Return Details</h3>
              <p><strong>Return Number:</strong> #${returnRequest.returnNumber}</p>
              <p><strong>Order Number:</strong> #${returnRequest.order?.orderNumber || returnRequest.order?._id}</p>
              <p><strong>Request Date:</strong> ${new Date(returnRequest.createdAt).toLocaleDateString()}</p>
              <p><strong>Return Type:</strong> ${returnRequest.returnType?.charAt(0).toUpperCase() + returnRequest.returnType?.slice(1)}</p>
              <p><strong>Reason:</strong> ${returnRequest.primaryReason?.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Status:</strong> <span class="status status-requested">Requested</span></p>
              
              <h4>Items to Return:</h4>
              ${returnRequest.items?.map(item => `
                <div class="item">
                  <span>${item.product?.name || 'Product'} (x${item.quantity})</span>
                  <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('') || '<p>No items specified</p>'}
              
              <div class="item total">
                <span>Expected Refund Amount:</span>
                <span>₹${returnRequest.refundAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our team will review your return request within 2-3 business days</li>
              <li>If approved, we'll send you return shipping instructions</li>
              <li>Once we receive and inspect the items, we'll process your refund</li>
              <li>Refunds typically take 5-7 business days to appear in your account</li>
            </ul>
            
            <p>You can track your return status anytime by logging into your account.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing PlantPAP!</p>
            <p>Need help? Contact us at support@plantpap.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${user.name},

      We've received your return request #${returnRequest.returnNumber} for order #${returnRequest.order?.orderNumber || returnRequest.order?._id}.

      Return Details:
      - Return Type: ${returnRequest.returnType}
      - Reason: ${returnRequest.primaryReason?.replace('_', ' ')}
      - Expected Refund: ₹${returnRequest.refundAmount?.toFixed(2) || '0.00'}

      We'll review your request within 2-3 business days and send you further instructions.

      Thank you for choosing PlantPAP!
    `
  }),

  returnStatusUpdate: (returnRequest, user, newStatus) => ({
    subject: `Return Status Update - PlantPAP Return #${returnRequest.returnNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Return Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5a27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; text-align: center; }
          .status { padding: 8px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; text-transform: uppercase; }
          .status-approved { background: #dcfce7; color: #166534; }
          .status-rejected { background: #fee2e2; color: #dc2626; }
          .status-processing { background: #dbeafe; color: #1d4ed8; }
          .status-completed { background: #dcfce7; color: #166534; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 PlantPAP</h1>
            <h2>Return Status Update</h2>
          </div>
          
          <div class="content">
            <p>Hi ${user.name},</p>
            
            <div class="status-box">
              <h3>Your return request has been updated!</h3>
              <p><strong>Return #${returnRequest.returnNumber}</strong></p>
              <p>Status: <span class="status status-${newStatus}">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span></p>
            </div>
            
            ${getStatusMessage(newStatus, returnRequest)}
            
            <p>You can track your return status anytime by logging into your account.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing PlantPAP!</p>
            <p>Need help? Contact us at support@plantpap.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${user.name},

      Your return request #${returnRequest.returnNumber} has been updated.
      
      New Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
      
      ${getStatusMessageText(newStatus, returnRequest)}

      Thank you for choosing PlantPAP!
    `
  }),

  returnCompleted: (returnRequest, user) => ({
    subject: `Return Completed - PlantPAP Return #${returnRequest.returnNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Return Completed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5a27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .success-box { background: #dcfce7; border: 2px solid #22c55e; padding: 20px; margin: 15px 0; border-radius: 8px; text-align: center; }
          .refund-amount { font-size: 24px; font-weight: bold; color: #22c55e; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 PlantPAP</h1>
            <h2>Return Completed Successfully!</h2>
          </div>
          
          <div class="content">
            <p>Hi ${user.name},</p>
            
            <div class="success-box">
              <h3>✅ Your return has been completed!</h3>
              <p><strong>Return #${returnRequest.returnNumber}</strong></p>
              <div class="refund-amount">₹${returnRequest.refundAmount?.toFixed(2) || '0.00'}</div>
              <p>Refund processed successfully</p>
            </div>
            
            <p>Your refund of <strong>₹${returnRequest.refundAmount?.toFixed(2) || '0.00'}</strong> has been processed and will appear in your original payment method within 5-7 business days.</p>
            
            <p><strong>Return Summary:</strong></p>
            <ul>
              <li>Return Number: #${returnRequest.returnNumber}</li>
              <li>Original Order: #${returnRequest.order?.orderNumber || returnRequest.order?._id}</li>
              <li>Return Reason: ${returnRequest.primaryReason?.replace('_', ' ').toUpperCase()}</li>
              <li>Refund Method: ${returnRequest.refundMethod || 'Original Payment Method'}</li>
            </ul>
            
            <p>Thank you for giving us the opportunity to serve you. We hope you'll continue shopping with PlantPAP!</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing PlantPAP!</p>
            <p>Need help? Contact us at support@plantpap.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${user.name},

      Great news! Your return #${returnRequest.returnNumber} has been completed successfully.

      Refund Amount: ₹${returnRequest.refundAmount?.toFixed(2) || '0.00'}
      
      Your refund will appear in your original payment method within 5-7 business days.

      Thank you for choosing PlantPAP!
    `
  })

};

// Helper functions for return status messages
const getStatusMessage = (status, returnRequest) => {
  switch (status) {
    case 'approved':
      return `
        <div class="status-message">
          <p>✅ Great! Your return request has been approved.</p>
          <p><strong>What's next?</strong></p>
          <ul>
            <li>We'll arrange for pickup of your items within 2-3 business days</li>
            <li>Please pack the items securely in their original packaging if possible</li>
            <li>Keep your return confirmation number handy: #${returnRequest.returnNumber}</li>
          </ul>
          ${returnRequest.pickupScheduledAt ? `
            <p><strong>Scheduled Pickup:</strong> ${new Date(returnRequest.pickupScheduledAt).toLocaleDateString()}</p>
          ` : ''}
        </div>
      `;
    case 'rejected':
      return `
        <div class="status-message">
          <p>❌ Unfortunately, your return request has been rejected.</p>
          ${returnRequest.rejectionReason ? `
            <p><strong>Reason:</strong> ${returnRequest.rejectionReason}</p>
          ` : ''}
          <p>If you have any questions about this decision, please contact our customer support team.</p>
        </div>
      `;
    case 'pickup_scheduled':
      return `
        <div class="status-message">
          <p>🚚 Pickup has been scheduled for your return items.</p>
          ${returnRequest.pickupScheduledAt ? `
            <p><strong>Pickup Date:</strong> ${new Date(returnRequest.pickupScheduledAt).toLocaleDateString()}</p>
          ` : ''}
          <p>Please ensure someone is available at the pickup address during the scheduled time.</p>
        </div>
      `;
    case 'picked_up':
      return `
        <div class="status-message">
          <p>📦 Your return items have been picked up successfully.</p>
          <p>We're now inspecting the items and will process your refund once the inspection is complete.</p>
          <p>This typically takes 2-3 business days.</p>
        </div>
      `;
    case 'refund_processed':
      return `
        <div class="status-message">
          <p>💰 Your refund has been processed!</p>
          <p><strong>Refund Amount:</strong> ₹${returnRequest.refundAmount?.toFixed(2) || '0.00'}</p>
          <p>The refund will appear in your original payment method within 5-7 business days.</p>
        </div>
      `;
    case 'completed':
      return `
        <div class="status-message">
          <p>✅ Your return has been completed successfully!</p>
          <p>Thank you for your patience throughout this process.</p>
        </div>
      `;
    case 'cancelled':
      return `
        <div class="status-message">
          <p>❌ Your return request has been cancelled.</p>
          ${returnRequest.cancellationReason ? `
            <p><strong>Reason:</strong> ${returnRequest.cancellationReason}</p>
          ` : ''}
        </div>
      `;
    default:
      return `
        <div class="status-message">
          <p>Your return status has been updated to: ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
        </div>
      `;
  }
};

const getStatusMessageText = (status, returnRequest) => {
  switch (status) {
    case 'approved':
      return `Great! Your return request has been approved. We'll arrange for pickup within 2-3 business days.`;
    case 'rejected':
      return `Unfortunately, your return request has been rejected. ${returnRequest.rejectionReason ? `Reason: ${returnRequest.rejectionReason}` : 'Please contact support for more details.'}`;
    case 'pickup_scheduled':
      return `Pickup has been scheduled for your return items. ${returnRequest.pickupScheduledAt ? `Pickup Date: ${new Date(returnRequest.pickupScheduledAt).toLocaleDateString()}` : ''}`;
    case 'picked_up':
      return `Your return items have been picked up. We're now inspecting them and will process your refund within 2-3 business days.`;
    case 'refund_processed':
      return `Your refund of ₹${returnRequest.refundAmount?.toFixed(2) || '0.00'} has been processed and will appear in your account within 5-7 business days.`;
    case 'completed':
      return `Your return has been completed successfully. Thank you for your patience.`;
    case 'cancelled':
      return `Your return request has been cancelled. ${returnRequest.cancellationReason || ''}`;
    default:
      return `Your return status has been updated to: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  }
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
  },

  async sendReturnRequestConfirmation(returnRequest, user) {
    try {
      const template = emailTemplates.returnRequestConfirmation(returnRequest, user);
      await sendEmail({
        email: user.email,
        subject: template.subject,
        html: template.html,
        message: template.text
      });
      console.log(`Return request confirmation email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send return request confirmation email:', error);
      throw error;
    }
  },

  async sendReturnStatusUpdate(returnRequest, user, newStatus) {
    try {
      const template = emailTemplates.returnStatusUpdate(returnRequest, user, newStatus);
      await sendEmail({
        email: user.email,
        subject: template.subject,
        html: template.html,
        message: template.text
      });
      console.log(`Return status update email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send return status update email:', error);
      throw error;
    }
  },

  async sendReturnCompleted(returnRequest, user) {
    try {
      const template = emailTemplates.returnCompleted(returnRequest, user);
      await sendEmail({
        email: user.email,
        subject: template.subject,
        html: template.html,
        message: template.text
      });
      console.log(`Return completed email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send return completed email:', error);
      throw error;
    }
  }
};

module.exports = {
  emailService,
  emailTemplates
};
