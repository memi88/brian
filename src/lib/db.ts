import { PrismaClient } from "@/generated/prisma/client";

export async function getDB(): Promise<PrismaClient> {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    return new PrismaClient({ adapter: new PrismaLibSql({ url: "file:dev.db" }) });
  }
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = getCloudflareContext();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaD1 } = require("@prisma/adapter-d1");
  return new PrismaClient({ adapter: new PrismaD1((env as { DB: D1Database }).DB) });
}
