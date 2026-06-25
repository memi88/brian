import { PrismaClient } from "@/generated/prisma/client";

// Production (Workers): receives D1 binding from request context
export function getPrismaWithD1(d1: D1Database): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaD1 } = require("@prisma/adapter-d1");
  return new PrismaClient({ adapter: new PrismaD1(d1) });
}

// Local dev only (next dev) — this branch is tree-shaken out of the Workers bundle
// because bundlers replace process.env.NODE_ENV with "production" in prod builds
export function getPrismaLocal(): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaLibSql } = require("@prisma/adapter-libsql");
  return new PrismaClient({ adapter: new PrismaLibSql({ url: "file:dev.db" }) });
}

export async function getDB(): Promise<PrismaClient> {
  if (process.env.NODE_ENV !== "production") {
    return getPrismaLocal();
  }
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = getCloudflareContext();
  return getPrismaWithD1((env as { DB: D1Database }).DB);
}
