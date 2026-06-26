import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

type CloudflareEnv = {
  AUDIO: { delete: (key: string) => Promise<void> };
};

async function deleteAudioFromR2(key: string) {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext() as unknown as { env: CloudflareEnv };
    await ctx.env.AUDIO.delete(key);
  } catch {
    // não bloqueia a finalização se a deleção falhar
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: {
      paciente: { select: { id: true, nome: true } },
      categoria: { select: { id: true, nome: true, cor: true } },
      palavras: { orderBy: [{ bloco: "asc" }, { timestamp: "asc" }] },
    },
  });

  if (!avaliacao) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(avaliacao);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();
  const body = await req.json();
  const {
    duracaoSegundos, totalPalavras, totalValidas, totalRepeticoes,
    totalIntrusoes, totalNeologismos, transcricaoRaw, revisaoCompleta,
  } = body;

  // Se finalizando, deletar áudio do R2
  if (revisaoCompleta === true && process.env.NODE_ENV === "production") {
    const atual = await prisma.avaliacao.findUnique({ where: { id }, select: { audioUrl: true } });
    if (atual?.audioUrl) {
      await deleteAudioFromR2(atual.audioUrl);
    }
  }

  const avaliacao = await prisma.avaliacao.update({
    where: { id },
    data: {
      ...(duracaoSegundos !== undefined && { duracaoSegundos }),
      ...(totalPalavras !== undefined && { totalPalavras }),
      ...(totalValidas !== undefined && { totalValidas }),
      ...(totalRepeticoes !== undefined && { totalRepeticoes }),
      ...(totalIntrusoes !== undefined && { totalIntrusoes }),
      ...(totalNeologismos !== undefined && { totalNeologismos }),
      ...(transcricaoRaw !== undefined && { transcricaoRaw }),
      ...(revisaoCompleta !== undefined && { revisaoCompleta }),
      ...(revisaoCompleta === true && { audioUrl: null }),
    },
  });

  return NextResponse.json(avaliacao);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  // Deletar áudio do R2 antes de remover o registro
  if (process.env.NODE_ENV === "production") {
    const atual = await prisma.avaliacao.findUnique({ where: { id }, select: { audioUrl: true } });
    if (atual?.audioUrl) {
      await deleteAudioFromR2(atual.audioUrl);
    }
  }

  await prisma.$transaction([
    prisma.palavra.deleteMany({ where: { avaliacaoId: id } }),
    prisma.avaliacao.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true });
}
