import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
      // Alamat yang boleh mengirim formulir ke server ini (di belakang proxy kampus)
      allowedOrigins: ["lab-teknikdigital.eng.unila.ac.id", "10.10.248.66"],
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;