import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, context }) => {
        // Skip validation if this update was triggered by a hook to prevent infinite loops
        if (context?.skipValidation) {
          return doc;
        }

        let needsUpdate = false;
        const updatedData: any = {};

        // Validate and clean cart data
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

          // Remove duplicates based on item.id
          const uniqueCart = validatedCart.reduce(
            (acc: any[], current: any) => {
              const existingIndex = acc.findIndex(
                (item) => item.id === current.id
              );
              if (existingIndex >= 0) {
                // Merge quantities for duplicate items
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

        // Validate and clean wishlist data
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

          // Remove duplicates based on item.id
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

        // Update the document if validation changes were needed
        if (needsUpdate && operation !== "create") {
          try {
            const payload = (this as any).payload;
            await payload.update({
              collection: "users",
              id: doc.id,
              data: updatedData,
              context: { skipValidation: true }, // Prevent infinite loop
            });
          } catch (error) {
            // Silently handle validation update errors
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
    },
    tokenExpiration: 86400,
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
      return false;
    },
    update: ({ req: { user } }) => {
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
  ],
};
