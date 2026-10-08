/**
 * Email HTML Templates for Eflix
 * Modern, responsive, table-based layouts compatible with all email clients.
 */

export function generateCustomerOrderEmail(order, settings = {}) {
  const brandName = settings?.mail?.fromName || "Eflix";
  const supportEmail = settings?.mail?.fromEmail || "support@eflix.store";
  const whatsappNumber = settings?.whatsapp?.number || "+8801711426565";
  const orderNumber = order?.orderNumber || "ORD-PENDING";
  const customerName = order?.customer || "Valued Customer";
  const totalAmount = Number(order?.total || 0).toLocaleString("en-BD");
  const subtotal = Number(order?.subtotal || order?.total || 0).toLocaleString("en-BD");
  const discount = Number(order?.discount || 0).toLocaleString("en-BD");
  const paymentMethod = order?.paymentMethod || "bKash";
  const deliveryNotes = order?.deliveryNotes || "";
  const products = Array.isArray(order?.products) ? order.products : [];

  const itemsHtml = products
    .map((item) => {
      let attrText = "";
      if (item.attributes && typeof item.attributes === "object") {
        attrText = Object.entries(item.attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" | ");
      }
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #262626; color: #ffffff; font-size: 14px;">
            <div style="font-weight: 600;">${item.name || "Digital Package"}</div>
            ${attrText ? `<div style="font-size: 12px; color: #888888; margin-top: 2px;">${attrText}</div>` : ""}
            <div style="font-size: 12px; color: #aaaaaa; margin-top: 2px;">Qty: ${item.quantity || 1} × ৳${Number(item.price || 0).toLocaleString("en-BD")}</div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #262626; color: #ffffff; font-weight: 600; text-align: right; font-size: 14px;">
            ৳${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-BD")}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0c0c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0c0c0c; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #171717; border-radius: 14px; border: 1px solid #262626; overflow: hidden;" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f1f1f 0%, #121212 100%); padding: 32px 30px; text-align: center; border-bottom: 2px solid #f51b25;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                <span style="color: #f51b25;">E</span>FLIX<span style="font-size: 13px; font-weight: 500; color: #888888; margin-left: 8px;">DIGITAL STORE</span>
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #999999;">Order Confirmation & Details</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #ffffff;">
                Hi ${customerName},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #cccccc;">
                Thank you for your order! We have received your purchase request and payment information. Our verification team is reviewing your transaction and will dispatch your digital credentials shortly.
              </p>

              <!-- Order Summary Card -->
              <table role="presentation" width="100%" style="background-color: #1f1f1f; border-radius: 10px; border: 1px solid #2c2c2c; margin-bottom: 24px;" cellspacing="0" cellpadding="16">
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="4">
                      <tr>
                        <td style="font-size: 13px; color: #888888;">Order Number:</td>
                        <td style="font-size: 13px; font-weight: 700; color: #ffffff; text-align: right;">${orderNumber}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #888888;">Payment Method:</td>
                        <td style="font-size: 13px; font-weight: 600; color: #f51b25; text-align: right;">${paymentMethod}</td>
                      </tr>
                      ${
                        deliveryNotes
                          ? `<tr>
                              <td style="font-size: 13px; color: #888888;">Transaction Details:</td>
                              <td style="font-size: 13px; font-weight: 600; color: #ffffff; text-align: right;">${deliveryNotes}</td>
                            </tr>`
                          : ""
                      }
                      <tr>
                        <td style="font-size: 13px; color: #888888;">Order Status:</td>
                        <td style="font-size: 13px; font-weight: 600; color: #facc15; text-align: right;">Processing Verification</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Products Table -->
              <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
                Ordered Items
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                ${itemsHtml}
              </table>

              <!-- Totals -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="6" style="margin-bottom: 26px;">
                <tr>
                  <td style="font-size: 13px; color: #888888;">Subtotal:</td>
                  <td style="font-size: 13px; color: #ffffff; text-align: right;">৳${subtotal}</td>
                </tr>
                ${
                  Number(order?.discount || 0) > 0
                    ? `<tr>
                        <td style="font-size: 13px; color: #22c55e;">Coupon Discount:</td>
                        <td style="font-size: 13px; color: #22c55e; text-align: right;">-৳${discount}</td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td style="font-size: 16px; font-weight: 800; color: #ffffff; padding-top: 8px; border-top: 1px solid #262626;">Total:</td>
                  <td style="font-size: 18px; font-weight: 800; color: #f51b25; text-align: right; padding-top: 8px; border-top: 1px solid #262626;">৳${totalAmount} BDT</td>
                </tr>
              </table>

              <!-- Important notice -->
              <div style="background-color: #211516; border-left: 4px solid #f51b25; border-radius: 6px; padding: 14px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #fca5a5;">
                  <strong>⚡ Instant Delivery Notice:</strong> Your login credentials (email & password / activation code) will be delivered directly to this email address as soon as payment is confirmed.
                </p>
              </div>

              <!-- Support Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px; text-align: center;">
                      💬 Need Fast Support? Chat on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #121212; padding: 24px 30px; text-align: center; border-top: 1px solid #262626; color: #666666; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 6px 0;">Questions? Reply to this email or contact us at <a href="mailto:${supportEmail}" style="color: #f51b25; text-decoration: none;">${supportEmail}</a></p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateAdminOrderEmail(order, settings = {}, dashboardUrl = "") {
  const brandName = settings?.mail?.fromName || "Eflix";
  const orderNumber = order?.orderNumber || "ORD-PENDING";
  const customerName = order?.customer || "Customer";
  const customerEmail = order?.email || "";
  const customerPhone = order?.phone || "N/A";
  const totalAmount = Number(order?.total || 0).toLocaleString("en-BD");
  const paymentMethod = order?.paymentMethod || "bKash";
  const deliveryNotes = order?.deliveryNotes || "";
  const products = Array.isArray(order?.products) ? order.products : [];

  const itemsHtml = products
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #262626; font-size: 13px; color: #ffffff;">
          <strong>${item.name || "Item"}</strong> × ${item.quantity || 1}
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #262626; font-size: 13px; color: #ffffff; text-align: right;">
          ৳${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-BD")}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Alert: ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0c0c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0c0c0c; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #171717; border-radius: 14px; border: 1px solid #262626; overflow: hidden;" cellspacing="0" cellpadding="0">
          <!-- Alert Header -->
          <tr>
            <td style="background-color: #831843; padding: 24px 30px; text-align: center; border-bottom: 3px solid #f43f5e;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">
                🚨 NEW ORDER RECEIVED
              </h2>
              <p style="margin: 6px 0 0 0; font-size: 14px; color: #fbcfe8;">
                Order <strong>#${orderNumber}</strong> • ৳${totalAmount} BDT
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <!-- Customer Details -->
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #888888; text-transform: uppercase;">
                Customer Information
              </h3>
              <table role="presentation" width="100%" style="background-color: #1f1f1f; border-radius: 8px; border: 1px solid #2a2a2a; margin-bottom: 20px;" cellspacing="0" cellpadding="14">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff;"><strong>Name:</strong> ${customerName}</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #60a5fa;">${customerEmail}</a></p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff;"><strong>Phone:</strong> <a href="tel:${customerPhone}" style="color: #60a5fa;">${customerPhone}</a></p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff;"><strong>Method:</strong> <span style="color: #f51b25; font-weight: 600;">${paymentMethod}</span></p>
                    ${
                      deliveryNotes
                        ? `<p style="margin: 0; font-size: 14px; color: #facc15;"><strong>TrxID / Notes:</strong> ${deliveryNotes}</p>`
                        : ""
                    }
                  </td>
                </tr>
              </table>

              <!-- Order Items -->
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #888888; text-transform: uppercase;">
                Items (${products.length})
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                ${itemsHtml}
              </table>

              <!-- Button to Dashboard -->
              ${
                dashboardUrl
                  ? `
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 10px;">
                  <tr>
                    <td align="center">
                      <a href="${dashboardUrl}" style="display: inline-block; background-color: #f51b25; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 30px; border-radius: 8px; text-align: center;">
                        👉 View Order in Dashboard
                      </a>
                    </td>
                  </tr>
                </table>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #121212; padding: 16px 30px; text-align: center; border-top: 1px solid #262626; color: #666666; font-size: 12px;">
              ${brandName} Automated Admin Notification Engine
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateDigitalDeliveryEmail(order, deliveryContentHtml, settings = {}) {
  const brandName = settings?.mail?.fromName || "Eflix";
  const supportEmail = settings?.mail?.fromEmail || "support@eflix.store";
  const whatsappNumber = settings?.whatsapp?.number || "+8801711426565";
  const orderNumber = order?.orderNumber || "ORD-PENDING";
  const customerName = order?.customer || "Valued Customer";
  const products = Array.isArray(order?.products) ? order.products : [];
  const productNames =
    products.map((p) => p.name).filter(Boolean).join(", ") ||
    "Digital Product Subscription";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Digital Product - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0c0c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0c0c0c; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #171717; border-radius: 14px; border: 1px solid #262626; overflow: hidden;" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f1f1f 0%, #121212 100%); padding: 32px 30px; text-align: center; border-bottom: 2px solid #22c55e;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                <span style="color: #f51b25;">E</span>FLIX<span style="font-size: 13px; font-weight: 500; color: #888888; margin-left: 8px;">DIGITAL STORE</span>
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #22c55e; font-weight: 600;">✓ Digital Product Information & Credentials</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #ffffff;">
                Hi ${customerName},
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #cccccc;">
                Your order <strong>#${orderNumber}</strong> for <strong>${productNames}</strong> has been processed! Below are your digital product access credentials and instructions:
              </p>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" style="background-color: #1f2023; border-radius: 10px; border: 1px solid #3b3c3f; margin-bottom: 24px;" cellspacing="0" cellpadding="20">
                <tr>
                  <td style="font-size: 14px; line-height: 1.7; color: #ffffff; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                    ${deliveryContentHtml}
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #999999;">
                Please save these credentials securely. If you experience any issues accessing your digital account or product, reach out to our support team right away.
              </p>

              <!-- WhatsApp Support Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 10px;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px; text-align: center;">
                      💬 Need Help? Chat with Support on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #121212; padding: 24px 30px; text-align: center; border-top: 1px solid #262626; color: #666666; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 6px 0;">Questions? Reply to this email or contact us at <a href="mailto:${supportEmail}" style="color: #f51b25; text-decoration: none;">${supportEmail}</a></p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
