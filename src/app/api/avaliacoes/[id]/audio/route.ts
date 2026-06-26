import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

type R2Object = {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
  size: number;
};

type CloudflareEnv = {
  AUDIO: {
    get: (key: string) => Promise<R2Object | null>;
    delete: (key: string) => Promise<void>;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ error: "Áudio não disponível em dev" }, { status: 404 });
  }

  const prisma = await getDB();
  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    select: { audioUrl: true },
  });

  if (!avaliacao?.audioUrl) {
    return NextResponse.json({ error: "Áudio não encontrado" }, { status: 404 });
  }

  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = getCloudflareContext() as unknown as { env: CloudflareEnv };
  const obj = await ctx.env.AUDIO.get(avaliacao.audioUrl);

  if (!obj) {
    return NextResponse.json({ error: "Áudio não encontrado no storage" }, { status: 404 });
  }

  return new Response(obj.body, {
    headers: {
      "Content-Type": "audio/webm",
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
    },
  });
}
