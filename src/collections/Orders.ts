import type { CollectionConfig } from "payload";
import { sendOrderConfirmationEmails } from "../lib/email/orderEmails";

const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: ["orderNumber", "customer", "total", "status", "createdAt"],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === "create" && !data.orderNumber) {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const day = String(now.getDate()).padStart(2, "0");

          const randomNum = Math.floor(1000 + Math.random() * 9000);

          data.orderNumber = `HOM-${year}${month}${day}-${randomNum}`;
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === "create" && doc.status === "paid") {
          try {
            await sendOrderConfirmationEmails({
              order: doc,
              req,
            });
          } catch (error) {
            req.payload.logger.error(
              "Failed to send order confirmation emails:",
              error
            );
          }
        }

        return doc;
      },
    ],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: false,
      admin: {
        description: "User who placed the order (if authenticated)",
      },
    },
    {
      name: "orderNumber",
      type: "text",
      required: true,
      admin: {
        description: "Unique order identifier",
      },
    },
    {
      name: "customer",
      type: "group",
      fields: [
        {
          name: "firstName",
          type: "text",
          required: true,
        },
        {
          name: "lastName",
          type: "text",
          required: true,
        },
        {
          name: "email",
          type: "email",
          required: true,
        },
        {
          name: "phone",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "shippingAddress",
      type: "group",
      fields: [
        {
          name: "address",
          type: "text",
          required: true,
        },
        {
          name: "city",
          type: "text",
          required: true,
        },
        {
          name: "country",
          type: "text",
          required: true,
        },
        {
          name: "postalCode",
          type: "text",
          required: false,
        },
      ],
    },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        {
          name: "productId",
          type: "text",
          required: true,
        },
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "price",
          type: "number",
          required: true,
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          min: 1,
        },
        {
          name: "image",
          type: "text",
        },
      ],
    },
    {
      name: "subtotal",
      type: "number",
      required: true,
    },
    {
      name: "shippingFee",
      type: "number",
      defaultValue: 0,
    },
    {
      name: "total",
      type: "number",
      required: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        {
          label: "Pending",
          value: "pending",
        },
        {
          label: "Processing",
          value: "processing",
        },
        {
          label: "Paid",
          value: "paid",
        },
        {
          label: "Shipped",
          value: "shipped",
        },
        {
          label: "Delivered",
          value: "delivered",
        },
        {
          label: "Cancelled",
          value: "cancelled",
        },
      ],
    },
    {
      name: "payment",
      type: "group",
      fields: [
        {
          name: "method",
          type: "select",
          required: true,
          defaultValue: "mpesa",
          options: [
            {
              label: "M-Pesa",
              value: "mpesa",
            },
          ],
        },
        {
          name: "transactionId",
          type: "text",
          admin: {
            description: "Payment provider transaction ID",
          },
        },
        {
          name: "status",
          type: "select",
          defaultValue: "pending",
          options: [
            {
              label: "Pending",
              value: "pending",
            },
            {
              label: "Processing",
              value: "processing",
            },
            {
              label: "Complete",
              value: "complete",
            },
            {
              label: "Failed",
              value: "failed",
            },
          ],
        },
        {
          name: "details",
          type: "json",
          admin: {
            description: "Additional payment details from provider",
          },
        },
      ],
    },
  ],
  timestamps: true,
};

export default Orders;
