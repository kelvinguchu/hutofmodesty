import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    // Configure cookies for proper session handling
    cookies: {
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
    },
    // Set reasonable token expiration (24 hours)
    tokenExpiration: 86400, // 24 hours in seconds
  },
  access: {
    // Allow public registration
    create: () => true,
    // Require authentication for reading users
    read: ({ req: { user } }) => {
      // If user is logged in, they can read their own profile
      if (user) {
        // Admins can read all users
        if (user.role === "admin") {
          return true;
        }
        // Regular users can only read their own profile
        return {
          id: {
            equals: user.id,
          },
        };
      }
      // No access for unauthenticated users
      return false;
    },
    // Users can update their own profile, admins can update any
    update: ({ req: { user } }) => {
      if (user) {
        // Admins can update any user
        if (user.role === "admin") {
          return true;
        }
        // Regular users can only update their own profile
        return {
          id: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    // Only admins can delete users
    delete: ({ req: { user } }) => {
      return user?.role === "admin";
    },
    // Allow only users with role === 'admin' into the Payload admin panel
    admin: ({ req: { user } }) => {
      return user?.role === "admin";
    },
  },
  fields: [
    // Email added by default
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
        if (!value) return true; // Allow empty since it's optional
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
        // Only admins can update user roles
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
