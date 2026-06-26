import type { PrismaClient } from "@/generated/prisma";

export async function getDB(): Promise<PrismaClient> {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient: PC } = require("@/generated/prisma");
    const libsql = createClient({ url: "file:dev.db" });
    return new PC({ adapter: new PrismaLibSQL(libsql) });
  }
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = getCloudflareContext();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaD1 } = require("@prisma/adapter-d1");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient: PC } = require("@/generated/prisma/wasm");
  return new PC({ adapter: new PrismaD1((env as { DB: D1Database }).DB) });
}
