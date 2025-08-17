import { uploadthingStorage } from "@payloadcms/storage-uploadthing";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { resendAdapter } from "@payloadcms/email-resend";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Categories } from "./collections/Categories";
import { SubCategories } from "./collections/SubCategories";
import { Clothing } from "./collections/Clothing";
import { Footwear } from "./collections/Footwear";
import { Fragrances } from "./collections/Fragrances";
import { Accessories } from "./collections/Accessories";
import Orders from "./collections/Orders";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: " - Hut of Modesty",
      icons: [
        {
          rel: "icon",
          type: "image/png",
          url: "/icons/favicon.png",
        },
      ],
    },
    components: {
      graphics: {
        Logo: "./components/admin/LogoDark.tsx",
        Icon: "./components/admin/Icon.tsx",
      },
    },
  },
  email: resendAdapter({
    defaultFromAddress: "info@hutofmodesty.com",
    defaultFromName: "Hut of Modesty",
    apiKey: process.env.RESEND_API_KEY || "",
  }),
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"],
  collections: [
    Users,
    Media,
    Categories,
    SubCategories,
    Clothing,
    Footwear,
    Fragrances,
    Accessories,
    Orders,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI ?? "",
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    uploadthingStorage({
      collections: {
        media: true,
      },
      options: {
        token: process.env.UPLOADTHING_TOKEN,
      },
      // Uncomment if you need to upload files larger than 4.5 MB directly from the client
      // clientUploads: true,
    }),
  ],
});
