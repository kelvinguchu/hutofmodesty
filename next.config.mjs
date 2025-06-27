import { withPayload } from "@payloadcms/next/withPayload";
import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hutofmodesty.com",
        port: "",
        pathname: "/media/**",
        search: "",
      },
      // UploadThing CDN (current default – any sub-domain of ufs.sh)
      {
        protocol: "https",
        hostname: "**.ufs.sh",
        port: "",
        pathname: "/f/**",
        search: "",
      },
      // Legacy UploadThing CDN host
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/f/**",
        search: "",
      },
    ],
  },
};

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  importScripts: ["/worker.js"],
  fallbacks: {
    image: "/icons/icon512_maskable.png",
    document: "/offline.html",
  },
});

export default withPWAConfig(
  withPayload(nextConfig, { devBundleServerPackages: false })
);
