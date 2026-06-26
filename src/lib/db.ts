import { PrismaClient } from "@/generated/prisma";

export async function getDB(): Promise<PrismaClient> {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql");
    const libsql = createClient({ url: "file:dev.db" });
    return new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
  }
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = getCloudflareContext();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaD1 } = require("@prisma/adapter-d1");
  return new PrismaClient({ adapter: new PrismaD1((env as { DB: D1Database }).DB) });
}
