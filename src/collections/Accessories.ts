import type { CollectionConfig } from "payload";

export const Accessories: CollectionConfig = {
  slug: "accessories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "subcategory", "price", "status"],
    listSearchableFields: ["name", "description"],
  },
  access: {
    read: () => true, // Everyone can read accessory products
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
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
          "Auto-filled with 'Accessories' category (can be changed if needed)",
      },
      defaultValue: async ({ req }) => {
        try {
          const accessoriesCategory = await req.payload.find({
            collection: "categories",
            where: { slug: { equals: "accessories" } },
            limit: 1,
          });
          return accessoriesCategory.docs[0]?.id || null;
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
        description: "Select accessory subcategory (Jewelry, Bags, etc.)",
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

    // Accessory Type
    {
      name: "accessoryType",
      type: "select",
      label: "Accessory Type",
      required: true,
      options: [
        { label: "Jewelry", value: "jewelry" },
        { label: "Bag", value: "bag" },
        { label: "Scarf/Hijab", value: "scarf" },
        { label: "Belt", value: "belt" },
        { label: "Watch", value: "watch" },
        { label: "Sunglasses", value: "sunglasses" },
        { label: "Hair Accessory", value: "hair" },
        { label: "Other", value: "other" },
      ],
    },
    // Size (for items that have sizes)
    {
      name: "availableSizes",
      type: "select",
      label: "Available Sizes",
      hasMany: true,
      admin: {
        description: "Select applicable sizes for this accessory",
      },
      options: [
        { label: "S", value: "S" },
        { label: "M", value: "M" },
        { label: "L", value: "L" },
        { label: "XL", value: "XL" },
        { label: "XXL", value: "XXL" },
      ],
    },
    // Jewelry-specific fields (conditional)
    {
      name: "jewelryType",
      type: "select",
      label: "Jewelry Type",
      admin: {
        condition: (data) => data?.accessoryType === "jewelry",
        description: "Only for jewelry items",
      },
      options: [
        { label: "Necklace", value: "necklace" },
        { label: "Earrings", value: "earrings" },
        { label: "Bracelet", value: "bracelet" },
        { label: "Ring", value: "ring" },
        { label: "Brooch", value: "brooch" },
        { label: "Anklet", value: "anklet" },
        { label: "Other", value: "other" },
      ],
    },
    {
      name: "metalType",
      type: "select",
      label: "Metal Type",
      admin: {
        condition: (data) => data?.accessoryType === "jewelry",
        description: "Only for jewelry items",
      },
      options: [
        { label: "Gold", value: "gold" },
        { label: "Silver", value: "silver" },
        { label: "Rose Gold", value: "rose-gold" },
        { label: "Platinum", value: "platinum" },
        { label: "Stainless Steel", value: "stainless-steel" },
        { label: "Alloy", value: "alloy" },
        { label: "Other", value: "other" },
      ],
    },
    // Care Instructions
    {
      name: "careInstructions",
      type: "textarea",
      label: "Care Instructions",
      admin: {
        description: "How to care for this accessory",
      },
    },
  ],
};
