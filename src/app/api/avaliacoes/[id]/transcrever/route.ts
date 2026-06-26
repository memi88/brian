import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

type WhisperWord = { word: string; start: number; end: number };
type WhisperResult = { text?: string; words?: WhisperWord[] };

type CloudflareEnv = {
  AI: { run: (model: string, input: unknown) => Promise<unknown> };
  AUDIO: {
    put: (key: string, value: ArrayBuffer) => Promise<void>;
  };
};

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;

  const formData = await req.formData();
  const audioFile = formData.get("audio") as File | null;
  const duracaoStr = formData.get("duracao") as string | null;

  if (!audioFile) return NextResponse.json({ error: "Áudio não encontrado" }, { status: 400 });

  const audioBuffer = await audioFile.arrayBuffer();
  const duracaoSegundos = duracaoStr ? parseInt(duracaoStr, 10) : null;

  let transcricaoRaw = "";
  let palavrasRaw: WhisperWord[] = [];
  let audioKey: string | null = null;

  try {
    if (process.env.NODE_ENV === "production") {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = getCloudflareContext() as unknown as { env: CloudflareEnv };

      const [result] = await Promise.all([
        ctx.env.AI.run("@cf/openai/whisper-large-v3-turbo", {
          audio: [...new Uint8Array(audioBuffer)],
        }) as Promise<WhisperResult>,
        (async () => {
          const key = `avaliacoes/${id}/audio.webm`;
          await ctx.env.AUDIO.put(key, audioBuffer);
          audioKey = key;
        })(),
      ]);

      transcricaoRaw = result.text ?? "";
      palavrasRaw = result.words ?? [];
    } else {
      const accountId = process.env.CF_ACCOUNT_ID;
      const apiToken = process.env.CF_API_TOKEN;
      if (!accountId || !apiToken) {
        return NextResponse.json(
          { error: "Defina CF_ACCOUNT_ID e CF_API_TOKEN no .env para usar transcrição em dev" },
          { status: 501 }
        );
      }
      const cfRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/openai/whisper-large-v3-turbo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/octet-stream",
          },
          body: audioBuffer,
        }
      );
      const data = (await cfRes.json()) as { result?: WhisperResult };
      transcricaoRaw = data.result?.text ?? "";
      palavrasRaw = data.result?.words ?? [];
    }
  } catch {
    return NextResponse.json({ error: "Erro ao transcrever áudio" }, { status: 500 });
  }

  const prisma = await getDB();

  const avaliacaoInfo = await prisma.avaliacao.findUnique({ where: { id }, select: { tipo: true } });
  const maxBloco = avaliacaoInfo?.tipo === "LIVRE" ? 4 : 3;

  await prisma.palavra.deleteMany({ where: { avaliacaoId: id } });

  const palavras = await Promise.all(
    palavrasRaw.map((w) =>
      prisma.palavra.create({
        data: {
          avaliacaoId: id,
          texto: w.word.trim().toLowerCase(),
          timestamp: w.start,
          bloco: Math.min(Math.floor(w.start / 30), maxBloco),
          tipo: "VALIDA",
        },
      })
    )
  );

  const avaliacao = await prisma.avaliacao.update({
    where: { id },
    data: {
      transcricaoRaw,
      totalPalavras: palavras.length,
      totalValidas: palavras.length,
      totalRepeticoes: 0,
      totalIntrusoes: 0,
      totalNeologismos: 0,
      ...(duracaoSegundos !== null ? { duracaoSegundos } : {}),
      ...(audioKey !== null ? { audioUrl: audioKey } : {}),
    },
  });

  return NextResponse.json({ avaliacao, palavras });
}
