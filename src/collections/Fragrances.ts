import type { CollectionConfig } from "payload";

export const Fragrances: CollectionConfig = {
  slug: "fragrances",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "subcategory", "price", "status"],
    listSearchableFields: ["name", "description"],
  },
  access: {
    read: () => true, // Everyone can read fragrance products
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
          "Auto-filled with 'Fragrances' category (can be changed if needed)",
      },
      defaultValue: async ({ req }) => {
        try {
          const fragrancesCategory = await req.payload.find({
            collection: "categories",
            where: { slug: { equals: "fragrances" } },
            limit: 1,
          });
          return fragrancesCategory.docs[0]?.id || null;
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
        description: "Select fragrance subcategory (Perfumes, Bakhoor, etc.)",
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
    // Fragrance Volume/Size
    {
      name: "volume",
      type: "number",
      label: "Volume",
      required: true,
      min: 0,
      admin: {
        description: "Enter the volume amount (unit selected below)",
      },
    },
    {
      name: "volumeUnit",
      type: "select",
      label: "Volume Unit",
      required: true,
      defaultValue: "ml",
      options: [
        { label: "ml", value: "ml" },
        { label: "oz", value: "oz" },
        { label: "g", value: "g" },
      ],
    },
    // Longevity
    {
      name: "longevity",
      type: "select",
      label: "Longevity",
      options: [
        { label: "Light (2-4 hours)", value: "light" },
        { label: "Moderate (4-6 hours)", value: "moderate" },
        { label: "Long-lasting (6-8 hours)", value: "long" },
        { label: "Very Long-lasting (8+ hours)", value: "very-long" },
      ],
    },
    // Gender and Occasion
    {
      name: "targetGender",
      type: "select",
      label: "Target Gender",
      defaultValue: "unisex",
      options: [
        { label: "Men", value: "men" },
        { label: "Women", value: "women" },
        { label: "Unisex", value: "unisex" },
      ],
    },
    {
      name: "occasion",
      type: "select",
      label: "Best Occasion",
      options: [
        { label: "Daily Wear", value: "daily" },
        { label: "Evening", value: "evening" },
        { label: "Special Occasions", value: "special" },
        { label: "Office/Work", value: "office" },
        { label: "Seasonal", value: "seasonal" },
      ],
    },
  ],
};
