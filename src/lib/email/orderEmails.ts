import type { PayloadRequest } from "payload";

interface OrderData {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    country: string;
    postalCode?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  payment: {
    method: string;
    transactionId?: string;
    status: string;
    details?: Record<string, unknown>;
  };
  status: string;
  createdAt: string;
}

interface SendOrderEmailsParams {
  order: OrderData;
  req: PayloadRequest;
}

export function formatCurrency(amount: number): string {
  return `KES ${amount.toFixed(2)}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateCustomerEmailHtml(order: OrderData): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e6ebf1;">
      <td style="padding: 15px 10px; vertical-align: top;">
        ${
          item.image
            ? `<img src="${item.image}" width="60" height="60" alt="${item.name}" style="border-radius: 8px; max-width: 60px; height: auto; display: block;" />`
            : `<div style="width: 60px; height: 60px; background-color: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">No Image</div>`
        }
      </td>
      <td style="padding: 15px 10px; vertical-align: top;">
        <div style="color: #333; font-size: 16px; font-weight: bold; margin: 0 0 8px; line-height: 1.4;">${
          item.name
        }</div>
        <div style="color: #666; font-size: 14px; margin: 0; line-height: 1.4;">
          Qty: ${item.quantity} × ${formatCurrency(item.price)}
        </div>
      </td>
      <td style="padding: 15px 10px; text-align: right; vertical-align: top; white-space: nowrap;">
        <div style="color: #333; font-size: 16px; font-weight: bold; margin: 0;">
          ${formatCurrency(item.price * item.quantity)}
        </div>
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${order.orderNumber}</title>
    <style>
      @media only screen and (max-width: 600px) {
        .email-container { width: 100% !important; margin: 0 !important; }
        .email-content { padding: 15px !important; }
        .header-padding { padding: 20px 15px !important; }
        .logo-container { padding: 10px 15px !important; }
        .logo-img { width: 140px !important; max-width: 140px !important; }
        .main-title { font-size: 24px !important; }
        .section-title { font-size: 18px !important; }
        .item-table { display: block !important; width: 100% !important; }
        .item-row { display: block !important; border-bottom: 1px solid #e6ebf1 !important; padding: 15px 0 !important; }
        .item-image-cell { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 10px !important; }
        .item-details-cell { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 10px !important; }
        .item-price-cell { display: block !important; width: 100% !important; text-align: center !important; }
        .summary-table { width: 100% !important; }
        .summary-row { display: block !important; margin-bottom: 8px !important; }
        .summary-label { display: inline-block !important; width: 60% !important; text-align: left !important; }
        .summary-value { display: inline-block !important; width: 35% !important; text-align: right !important; }
        .overview-table { display: block !important; }
        .overview-cell { display: block !important; text-align: center !important; margin-bottom: 15px !important; padding: 10px !important; }
        .button-table { width: 100% !important; }
        .button-cell { display: block !important; text-align: center !important; margin-bottom: 10px !important; }
        .button-link { display: block !important; width: 80% !important; margin: 0 auto 10px !important; }
      }
    </style>
  </head>
  <body style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
    <div class="email-container" style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; max-width: 600px; width: 100%;">

      <!-- Header -->
      <div class="header-padding" style="padding: 30px; background-color: #f8f9fa; text-align: center; border-bottom: 3px solid #6b3fae;">
        <div class="logo-container" style="background-color: #ffffff; display: inline-block; padding: 15px 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <img class="logo-img" src="https://hwn6k89767.ufs.sh/f/k0Qi0uf9dUswVZpzzikaMTreiOA9qxR5j0HCbX2aKGJDgfuy" width="180" height="auto" alt="Hut of Modesty" style="display: block; max-width: 180px; height: auto;" />
        </div>
      </div>

      <!-- Main Content -->
      <div class="email-content" style="padding: 30px;">
        <h1 class="main-title" style="color: #6b3fae; font-size: 28px; font-weight: bold; margin: 0 0 20px; text-align: center; line-height: 1.3;">Order Confirmation</h1>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          Dear ${order.customer.firstName} ${order.customer.lastName},
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          Thank you for your order! We're excited to confirm that your order has been received
          and is being processed. Here are your order details:
        </p>

        <!-- Order Summary -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b3fae;">
          <div style="color: #333; font-size: 14px; line-height: 1.5; margin: 0 0 8px;">
            <strong style="color: #6b3fae;">Order Number:</strong> #${order.orderNumber}
          </div>
          <div style="color: #333; font-size: 14px; line-height: 1.5; margin: 0 0 8px;">
            <strong>Order Date:</strong> ${formatDate(order.createdAt)}
          </div>
          <div style="color: #333; font-size: 14px; line-height: 1.5; margin: 0 0 8px;">
            <strong>Payment Method:</strong> ${
              order.payment.method === "mpesa" ? "M-Pesa" : order.payment.method
            }
          </div>
          ${
            order.payment.transactionId
              ? `<div style="color: #333; font-size: 14px; line-height: 1.5; margin: 0 0 8px;">
                  <strong>Transaction ID:</strong> ${order.payment.transactionId}
                </div>`
              : ""
          }
        </div>

        <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 20px 0;" />

        <!-- Items -->
        <h2 class="section-title" style="color: #6b3fae; font-size: 20px; font-weight: bold; margin: 30px 0 15px; line-height: 1.3;">Order Items</h2>
        <table class="item-table" style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>

        <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 20px 0;" />

        <!-- Order Total -->
        <div style="margin: 20px 0;">
          <table class="summary-table" style="width: 100%;">
            <tr class="summary-row">
              <td class="summary-label" style="text-align: right; padding-right: 20px;">
                <div style="color: #666; font-size: 14px; margin: 0 0 8px;">Subtotal:</div>
              </td>
              <td class="summary-value" style="width: 120px; text-align: right;">
                <div style="color: #333; font-size: 14px; margin: 0 0 8px;">${formatCurrency(
                  order.subtotal
                )}</div>
              </td>
            </tr>
            <tr class="summary-row">
              <td class="summary-label" style="text-align: right; padding-right: 20px;">
                <div style="color: #666; font-size: 14px; margin: 0 0 8px;">Shipping:</div>
              </td>
              <td class="summary-value" style="width: 120px; text-align: right;">
                <div style="color: #333; font-size: 14px; margin: 0 0 8px;">${formatCurrency(
                  order.shippingFee
                )}</div>
              </td>
            </tr>
            <tr class="summary-row">
              <td class="summary-label" style="text-align: right; padding-right: 20px;">
                <div style="color: #333; font-size: 16px; font-weight: bold; margin: 0;">Total:</div>
              </td>
              <td class="summary-value" style="width: 120px; text-align: right;">
                <div style="color: #333; font-size: 16px; font-weight: bold; margin: 0;">${formatCurrency(
                  order.total
                )}</div>
              </td>
            </tr>
          </table>
        </div>

        <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 20px 0;" />

        <!-- Shipping Address -->
        <h2 class="section-title" style="color: #6b3fae; font-size: 20px; font-weight: bold; margin: 30px 0 15px; line-height: 1.3;">Shipping Address</h2>
        <div style="color: #333; font-size: 14px; line-height: 1.5; margin: 0; background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
          ${order.customer.firstName} ${order.customer.lastName}<br />
          ${order.shippingAddress.address}<br />
          ${order.shippingAddress.city}${
            order.shippingAddress.postalCode
              ? `, ${order.shippingAddress.postalCode}`
              : ""
          }<br />
          ${order.shippingAddress.country}
        </div>

        <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 20px 0;" />

        <!-- Next Steps -->
        <h2 class="section-title" style="color: #6b3fae; font-size: 20px; font-weight: bold; margin: 30px 0 15px; line-height: 1.3;">What's Next?</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #6b3fae;">
          <div style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
            You will be contacted shortly for further shipping and delivery details.
          </div>
        </div>



        <!-- Footer -->
        <div style="border-top: 1px solid #e6ebf1; padding-top: 20px; text-align: center; margin-top: 30px;">
          <div style="color: #666; font-size: 12px; line-height: 1.5; margin: 0 0 10px;">
            Questions about your order? Contact us at
            <a href="mailto:info@hutofmodesty.com" style="color: #6b3fae; text-decoration: underline; word-break: break-all;">
              info@hutofmodesty.com
            </a>
            or call us at +254748355387.
          </div>

          <div style="color: #666; font-size: 12px; line-height: 1.5; margin: 0 0 10px;">
            Thank you for shopping with Hut of Modesty!
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim();
}

interface RawOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface RawOrder {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    country: string;
    postalCode?: string;
  };
  items: RawOrderItem[];
  subtotal: number;
  shippingFee?: number;
  total: number;
  payment: {
    method: string;
    transactionId?: string;
    status: string;
    details?: Record<string, unknown>;
  };
  status: string;
  createdAt: string;
}

export function generateAdminEmailHtml(
  order: OrderData,
  serverUrl: string
): string {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr class="item-row" style="border-bottom: 1px solid #e6ebf1;">
      <td class="item-image-cell" style="padding: 15px 10px; vertical-align: top;">
        ${
          item.image
            ? `<img src="${item.image}" width="50" height="50" alt="${item.name}" style="border-radius: 6px; max-width: 50px; height: auto; display: block;" />`
            : `<div style="width: 50px; height: 50px; background-color: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 10px;">No Image</div>`
        }
      </td>
      <td class="item-details-cell" style="padding: 15px 10px; vertical-align: top;">
        <div style="color: #333; font-size: 14px; font-weight: bold; margin: 0 0 5px; line-height: 1.4;">${
          item.name
        }</div>
        <div style="color: #666; font-size: 12px; margin: 0 0 3px; line-height: 1.3;">Product ID: ${
          item.productId
        }</div>
        <div style="color: #666; font-size: 12px; margin: 0 0 3px; line-height: 1.3;">
          Qty: ${item.quantity} × ${formatCurrency(item.price)}
        </div>
      </td>
      <td class="item-price-cell" style="padding: 15px 10px; text-align: right; vertical-align: top; white-space: nowrap;">
        <div style="color: #333; font-size: 14px; font-weight: bold; margin: 0;">
          ${formatCurrency(item.price * item.quantity)}
        </div>
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order - ${order.orderNumber}</title>
    <style>
      @media only screen and (max-width: 600px) {
        .email-container { width: 100% !important; margin: 0 !important; }
        .email-content { padding: 15px !important; }
        .header-padding { padding: 20px 15px !important; }
        .main-title { font-size: 20px !important; }
        .section-title { font-size: 16px !important; }
        .item-table { display: block !important; width: 100% !important; }
        .item-row { display: block !important; border-bottom: 1px solid #e6ebf1 !important; padding: 15px 0 !important; }
        .item-image-cell { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 10px !important; }
        .item-details-cell { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 10px !important; }
        .item-price-cell { display: block !important; width: 100% !important; text-align: center !important; }
        .summary-table { width: 100% !important; }
        .summary-row { display: block !important; margin-bottom: 8px !important; }
        .summary-label { display: inline-block !important; width: 60% !important; text-align: left !important; }
        .summary-value { display: inline-block !important; width: 35% !important; text-align: right !important; }
        .overview-table { display: block !important; }
        .overview-cell { display: block !important; text-align: center !important; margin-bottom: 15px !important; padding: 10px !important; }
        .button-table { width: 100% !important; }
        .button-cell { display: block !important; text-align: center !important; margin-bottom: 10px !important; }
        .button-link { display: block !important; width: 80% !important; margin: 0 auto 10px !important; }
      }
    </style>
  </head>
  <body style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
    <div class="email-container" style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; max-width: 600px; width: 100%;">

      <!-- Header -->
      <div class="header-padding" style="background-color: #6b3fae; padding: 30px; text-align: center;">
        <h1 class="main-title" style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0 0 10px; line-height: 1.3;">NEW ORDER RECEIVED</h1>
        <div style="color: #ffffff; font-size: 18px; margin: 0; line-height: 1.3;">Order #${order.orderNumber}</div>
      </div>

      <!-- Alert Section -->
      <div class="email-content" style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 15px;">
        <div style="color: #92400e; font-size: 14px; margin: 0; text-align: center; line-height: 1.4;">
          <strong>Action Required:</strong> A new order has been placed and requires processing.
        </div>
      </div>

      <!-- Order Overview -->
      <div style="background-color: #f8f9fa; padding: 20px 15px; margin: 0;">
        <table class="overview-table" style="width: 100%;">
          <tr>
            <td class="overview-cell" style="text-align: center; padding: 0 10px;">
              <div style="color: #666; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 5px; line-height: 1.3;">Order Total</div>
              <div style="color: #333; font-size: 18px; font-weight: bold; margin: 0; line-height: 1.3;">${formatCurrency(order.total)}</div>
            </td>
            <td class="overview-cell" style="text-align: center; padding: 0 10px;">
              <div style="color: #666; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 5px; line-height: 1.3;">Items</div>
              <div style="color: #333; font-size: 18px; font-weight: bold; margin: 0; line-height: 1.3;">${totalItems}</div>
            </td>
            <td class="overview-cell" style="text-align: center; padding: 0 10px;">
              <div style="color: #666; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 5px; line-height: 1.3;">Payment</div>
              <div style="color: #333; font-size: 18px; font-weight: bold; margin: 0; line-height: 1.3;">${order.payment.method === "mpesa" ? "M-Pesa" : order.payment.method}</div>
            </td>
            <td class="overview-cell" style="text-align: center; padding: 0 10px;">
              <div style="color: #666; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 5px; line-height: 1.3;">Status</div>
              <div style="color: #333; font-size: 18px; font-weight: bold; margin: 0; line-height: 1.3;">PAID</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Customer Information -->
      <div class="email-content" style="padding: 0 15px; margin: 20px 0;">
        <h2 class="section-title" style="color: #6b3fae; font-size: 18px; font-weight: bold; margin: 0 0 15px; line-height: 1.3;">Customer Information</h2>
        <div style="color: #333; font-size: 14px; line-height: 1.5; margin: 0 0 8px;">
          <strong>Name:</strong> ${order.customer.firstName} ${order.customer.lastName}
        </div>
        <div style="color: #333; font-size: 14px; line-height: 1.5; margin: 0 0 8px; word-break: break-all;">
          <strong>Email:</strong> ${order.customer.email}
        </div>
        <div style="color: #333; font-size: 14px; line-height: 1.5; margin: 0 0 8px;">
          <strong>Phone:</strong> ${order.customer.phone}
        </div>
        <div style="color: #333; font-size: 14px; line-height: 1.5; margin: 0 0 8px;">
          <strong>Order Date:</strong> ${formatDate(order.createdAt)}
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 30px 15px;" />

      <!-- Shipping Information -->
      <div class="email-content" style="padding: 0 15px; margin: 20px 0;">
        <h2 class="section-title" style="color: #6b3fae; font-size: 18px; font-weight: bold; margin: 0 0 15px; line-height: 1.3;">Shipping Address</h2>
        <div style="color: #333; font-size: 14px; line-height: 1.5; margin: 0; background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
          ${order.customer.firstName} ${order.customer.lastName}<br />
          ${order.shippingAddress.address}<br />
          ${order.shippingAddress.city}${order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ""}<br />
          ${order.shippingAddress.country}
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 30px 15px;" />

      <!-- Payment Information -->
      <div class="email-content" style="padding: 0 15px; margin: 20px 0;">
        <h2 class="section-title" style="color: #6b3fae; font-size: 18px; font-weight: bold; margin: 0 0 15px; line-height: 1.3;">Payment Details</h2>
        <div style="color: #333; font-size: 14px; line-height: 1.5; margin: 0;">
          <strong>Method:</strong> ${order.payment.method === "mpesa" ? "M-Pesa" : order.payment.method}<br />
          <strong>Status:</strong> ${order.payment.status}<br />
          ${order.payment.transactionId ? `<strong>Transaction ID:</strong> ${order.payment.transactionId}<br />` : ""}
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 30px 15px;" />

      <!-- Order Items -->
      <div class="email-content" style="padding: 0 15px; margin: 20px 0;">
        <h2 class="section-title" style="color: #6b3fae; font-size: 18px; font-weight: bold; margin: 0 0 15px; line-height: 1.3;">Order Items</h2>
        <table class="item-table" style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>
      </div>

      <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 30px 15px;" />

      <!-- Order Summary -->
      <div class="email-content" style="padding: 0 15px; margin: 20px 0;">
        <h2 class="section-title" style="color: #6b3fae; font-size: 18px; font-weight: bold; margin: 0 0 15px; line-height: 1.3;">Order Summary</h2>
        <table class="summary-table" style="width: 100%;">
          <tr class="summary-row">
            <td class="summary-label" style="text-align: right; padding-right: 20px;">
              <div style="color: #666; font-size: 14px; margin: 0 0 8px;">Subtotal:</div>
            </td>
            <td class="summary-value" style="width: 100px; text-align: right;">
              <div style="color: #333; font-size: 14px; margin: 0 0 8px;">${formatCurrency(order.subtotal)}</div>
            </td>
          </tr>
          <tr class="summary-row">
            <td class="summary-label" style="text-align: right; padding-right: 20px;">
              <div style="color: #666; font-size: 14px; margin: 0 0 8px;">Shipping Fee:</div>
            </td>
            <td class="summary-value" style="width: 100px; text-align: right;">
              <div style="color: #333; font-size: 14px; margin: 0 0 8px;">${formatCurrency(order.shippingFee)}</div>
            </td>
          </tr>
          <tr class="summary-row">
            <td class="summary-label" style="text-align: right; padding-right: 20px;">
              <div style="color: #333; font-size: 16px; font-weight: bold; margin: 0;">TOTAL:</div>
            </td>
            <td class="summary-value" style="width: 100px; text-align: right;">
              <div style="color: #333; font-size: 16px; font-weight: bold; margin: 0;">${formatCurrency(order.total)}</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Action Buttons -->
      <div style="padding: 30px 15px; text-align: center;">
        <table class="button-table" style="margin: 0 auto;">
          <tr>
            <td class="button-cell" style="padding: 0 10px;">
              <a class="button-link" href="${serverUrl}/admin/collections/orders/${order.id}" style="background-color: #6b3fae; border-radius: 8px; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; text-align: center; display: inline-block; padding: 12px 24px; margin: 0 5px 10px; white-space: nowrap;">
                View Order in Admin
              </a>
            </td>
            <td class="button-cell" style="padding: 0 10px;">
              <a class="button-link" href="mailto:${order.customer.email}?subject=Order Update - ${order.orderNumber}" style="background-color: #6b7280; border-radius: 8px; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; text-align: center; display: inline-block; padding: 12px 24px; margin: 0 5px 10px; white-space: nowrap;">
                Email Customer
              </a>
            </td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e6ebf1; padding: 20px 15px; text-align: center;">
        <div style="color: #666; font-size: 12px; line-height: 1.5; margin: 0;">
          This order notification was sent to hutofmodest@gmail.com<br />
          Order received at ${formatDate(order.createdAt)}
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim();
}

export async function sendOrderConfirmationEmails({
  order,
  req,
}: SendOrderEmailsParams): Promise<void> {
  try {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

    const customerEmailHtml = generateCustomerEmailHtml(order);
    const adminEmailHtml = generateAdminEmailHtml(order, serverUrl);

    // Send customer confirmation email
    await req.payload.sendEmail({
      to: order.customer.email,
      subject: `Order Confirmation - ${order.orderNumber} - Hut of Modesty`,
      html: customerEmailHtml,
    });

    await req.payload.sendEmail({
      to: "hutofmodest@gmail.com",
      subject: `New Order ${order.orderNumber} - ${order.customer.firstName} ${order.customer.lastName} - KES ${order.total.toFixed(2)}`,
      html: adminEmailHtml,
    });

    req.payload.logger.info(
      `Order confirmation emails sent successfully for order ${order.orderNumber}`
    );
  } catch (error) {
    req.payload.logger.error(
      `Failed to send order confirmation emails for order ${order.orderNumber}:`,
      error
    );
    throw error;
  }
}

export function formatOrderForEmail(order: RawOrder): OrderData {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customer: {
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
      email: order.customer.email,
      phone: order.customer.phone,
    },
    shippingAddress: {
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      country: order.shippingAddress.country,
      postalCode: order.shippingAddress.postalCode,
    },
    items: order.items.map((item: RawOrderItem) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    subtotal: order.subtotal,
    shippingFee: order.shippingFee || 0,
    total: order.total,
    payment: {
      method: order.payment.method,
      transactionId: order.payment.transactionId,
      status: order.payment.status,
      details: order.payment.details,
    },
    status: order.status,
    createdAt: order.createdAt,
  };
}
