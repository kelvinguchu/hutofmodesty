import type { CollectionConfig } from "payload";

export const Footwear: CollectionConfig = {
  slug: "footwear",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "subcategory", "price", "status"],
    listSearchableFields: ["name", "description"],
  },
  access: {
    read: () => true, // Everyone can read footwear products
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.name && !data?.slug) {
              data.slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            }
            return data;
          },
        ],
      },
    },
    {
      name: "description",
      type: "richText",
      required: true,
    },
    {
      name: "price",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
      hasMany: false,
      admin: {
        description:
          "Auto-filled with 'Footwear' category (can be changed if needed)",
      },
      defaultValue: async ({ req }) => {
        try {
          const footwearCategory = await req.payload.find({
            collection: "categories",
            where: { slug: { equals: "footwear" } },
            limit: 1,
          });
          return footwearCategory.docs[0]?.id || null;
        } catch {
          return null;
        }
      },
    },
    {
      name: "subcategory",
      type: "relationship",
      relationTo: "subcategories",
      required: true,
      hasMany: false,
      admin: {
        condition: (data) => Boolean(data?.category),
        description: "Select footwear subcategory (Shoes, etc.)",
      },
      filterOptions: ({ data }) => {
        if (!data?.category) return false;
        return {
          category: { equals: data.category },
        };
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Draft", value: "draft" },
        { label: "Out of Stock", value: "out-of-stock" },
      ],
    },
    {
      name: "trending",
      type: "checkbox",
      label: "Trending Product",
      defaultValue: false,
    },
    {
      name: "mainImage",
      type: "upload",
      relationTo: "media",
      required: true,
    },

    // Size Range
    {
      name: "sizeFrom",
      type: "number",
      label: "Size From",
      required: true,
      admin: {
        description: "Starting size (e.g., 35)",
      },
    },
    {
      name: "sizeTo",
      type: "number",
      label: "Size To",
      required: true,
      admin: {
        description:
          "Ending size (e.g., 42). Use same as 'Size From' for single size",
      },
    },
    // Footwear-specific fields
    {
      name: "material",
      type: "text",
      label: "Material",
      admin: {
        description: "e.g., Leather, Canvas, Synthetic",
      },
    },
    {
      name: "shoeType",
      type: "text",
      label: "Shoe Type",
      admin: {
        description: "e.g., Flats, Heels, Boots, Sandals, Sneakers",
      },
    },
    {
      name: "careInstructions",
      type: "textarea",
      label: "Care Instructions",
      admin: {
        description: "How to care for this footwear",
      },
    },
  ],
};
