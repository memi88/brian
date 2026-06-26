import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      // In the production server build, mark the generated Prisma package as external
      // so webpack doesn't bundle it. esbuild (opennextjs-cloudflare) will then
      // re-resolve it with the "workerd" condition, picking wasm.js instead of index.js.
      // This avoids bundling runtime/library.js which contains eval("__dirname"),
      // blocked by Cloudflare Workers.
      const prevExternals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
        ? [config.externals]
        : [];
      config.externals = [
        ...prevExternals,
        ({ request }: { request?: string }, callback: (err?: Error | null, result?: string) => void) => {
          if (request?.startsWith("@/generated/prisma")) {
            return callback(null, "commonjs " + request);
          }
          callback();
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
