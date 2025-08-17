import type { CollectionConfig } from "payload";
import {
  generateForgotPasswordEmailHTML,
  generateForgotPasswordEmailSubject,
} from "../lib/email/forgotPasswordTemplate";
import {
  generateEmailVerificationHTML,
  generateEmailVerificationSubject,
} from "../lib/email/emailVerificationTemplate";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, context }) => {
        if (context?.skipValidation) {
          return doc;
        }

        let needsUpdate = false;
        const updatedData: any = {};

        if (doc.cart && Array.isArray(doc.cart)) {
          const validatedCart = doc.cart.filter((item: any) => {
            return (
              item &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.price === "number" &&
              typeof item.quantity === "number" &&
              item.quantity > 0
            );
          });

          const uniqueCart = validatedCart.reduce(
            (acc: any[], current: any) => {
              const existingIndex = acc.findIndex(
                (item) => item.id === current.id
              );
              if (existingIndex >= 0) {
                acc[existingIndex].quantity += current.quantity;
              } else {
                acc.push(current);
              }
              return acc;
            },
            []
          );

          if (JSON.stringify(uniqueCart) !== JSON.stringify(doc.cart)) {
            updatedData.cart = uniqueCart;
            needsUpdate = true;
          }
        }

        if (doc.wishlist && Array.isArray(doc.wishlist)) {
          const validatedWishlist = doc.wishlist.filter((item: any) => {
            return (
              item &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.price === "number"
            );
          });

          const uniqueWishlist = validatedWishlist.reduce(
            (acc: any[], current: any) => {
              const exists = acc.some((item) => item.id === current.id);
              if (!exists) {
                acc.push(current);
              }
              return acc;
            },
            []
          );

          if (JSON.stringify(uniqueWishlist) !== JSON.stringify(doc.wishlist)) {
            updatedData.wishlist = uniqueWishlist;
            needsUpdate = true;
          }
        }

        if (needsUpdate && operation !== "create") {
          try {
            const payload = (this as any).payload;
            await payload.update({
              collection: "users",
              id: doc.id,
              data: updatedData,
              context: { skipValidation: true },
            });
          } catch (error) {
            console.error("Error updating user data after validation:", error);
          }
        }

        return doc;
      },
    ],
  },
  auth: {
    cookies: {
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? new URL(process.env.NEXT_PUBLIC_SERVER_URL || "").hostname
          : undefined,
    },
    tokenExpiration: 86400,
    verify: {
      generateEmailHTML: generateEmailVerificationHTML,
      generateEmailSubject: generateEmailVerificationSubject,
    },
    forgotPassword: {
      expiration: 1000 * 60 * 60 * 2,
      generateEmailHTML: generateForgotPasswordEmailHTML,
      generateEmailSubject: generateForgotPasswordEmailSubject,
    },
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => {
      if (user) {
        if (user.role === "admin") {
          return true;
        }
        return {
          id: {
            equals: user.id,
          },
        };
      }

      // Deny unauthenticated reads for security
      // resetPassword now uses overrideAccess: true to bypass this
      return false;
    },
    update: ({ req: { user } }) => {
      // Allow password reset operations - Payload's resetPassword bypasses normal auth
      // We need to allow unauthenticated updates for password reset operations
      if (!user) {
        return true;
      }

      if (user) {
        if (user.role === "admin") {
          return true;
        }
        return {
          id: {
            equals: user.id,
          },
        };
      }

      return false;
    },
    delete: ({ req: { user } }) => {
      return user?.role === "admin";
    },
    admin: ({ req: { user } }) => {
      return user?.role === "admin";
    },
  },
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
      name: "profilePhoto",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Upload a profile photo",
      },
    },
    {
      name: "cart",
      type: "json",
      admin: {
        description: "User's saved cart items",
      },
    },
    {
      name: "wishlist",
      type: "json",
      admin: {
        description: "User's saved wishlist items",
      },
    },
    {
      name: "phone",
      type: "text",
      validate: (value: string | null | undefined) => {
        if (!value) return true;
        const phoneRegex =
          /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(value)) {
          return "Please enter a valid phone number";
        }
        return true;
      },
      admin: {
        description: "User's mobile/phone number",
      },
    },
    {
      name: "savedShippingAddress",
      type: "group",
      admin: {
        description: "User's saved shipping address",
      },
      fields: [
        {
          name: "address",
          type: "text",
          maxLength: 200,
          admin: {
            description: "Street address",
          },
        },
        {
          name: "city",
          type: "text",
          maxLength: 100,
          admin: {
            description: "City",
          },
        },
        {
          name: "country",
          type: "text",
          maxLength: 100,
          defaultValue: "Kenya",
          admin: {
            description: "Country",
          },
        },
        {
          name: "postalCode",
          type: "text",
          maxLength: 20,
          admin: {
            description: "Postal/ZIP code",
          },
        },
      ],
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "customer",
      options: [
        {
          label: "Customer",
          value: "customer",
        },
        {
          label: "Admin",
          value: "admin",
        },
      ],
      access: {
        update: ({ req: { user } }) => {
          return user?.role === "admin";
        },
      },
      admin: {
        description: "User role for access control",
      },
    },
    // Email verification tracking fields
    {
      name: "verificationAttempts",
      type: "number",
      defaultValue: 0,
      admin: {
        hidden: true, // Hide from admin UI
      },
      access: {
        read: ({ req }) => req.user?.role === "admin",
        update: ({ req }) => req.user?.role === "admin",
      },
    },
    {
      name: "lastVerificationAttempt",
      type: "date",
      admin: {
        hidden: true, // Hide from admin UI
      },
      access: {
        read: ({ req }) => req.user?.role === "admin",
        update: ({ req }) => req.user?.role === "admin",
      },
    },
  ],
};
