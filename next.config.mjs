import { withPayload } from "@payloadcms/next/withPayload";
import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicit image domains / patterns so <Image> works locally and in prod
  images: {
    remotePatterns: [
      // Localhost dev (with explicit port) API upload route
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/**",
      },
      // Localhost dev (with explicit port) direct media route
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/media/**",
      },
      // Localhost dev any port /api
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/api/**",
      },
      // Localhost dev any port /media
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/media/**",
      },
      // 127.0.0.1 (sometimes Next dev uses this)
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/api/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/api/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/media/**",
      },
      // Vercel preview / production URL
      {
        protocol: "https",
        hostname: "hutofmodesty.vercel.app",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "hutofmodesty.vercel.app",
        pathname: "/media/**",
      },
      // Custom production domain
      {
        protocol: "https",
        hostname: "hutofmodesty.com",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "hutofmodesty.com",
        pathname: "/media/**",
      },
      // If NEXT_PUBLIC_SERVER_URL is set to something else (e.g. staging)
      ...(process.env.NEXT_PUBLIC_SERVER_URL
        ? [
            {
              protocol: new URL(
                process.env.NEXT_PUBLIC_SERVER_URL
              ).protocol.replace(":", ""),
              hostname: new URL(process.env.NEXT_PUBLIC_SERVER_URL).hostname,
              pathname: "/api/**",
            },
            {
              protocol: new URL(
                process.env.NEXT_PUBLIC_SERVER_URL
              ).protocol.replace(":", ""),
              hostname: new URL(process.env.NEXT_PUBLIC_SERVER_URL).hostname,
              pathname: "/media/**",
            },
          ]
        : []),
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
