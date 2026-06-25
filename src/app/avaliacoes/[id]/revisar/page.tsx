import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { RevisorPalavras } from "@/components/avaliacoes/RevisorPalavras";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function RevisarPage({ params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: {
      paciente: { select: { nome: true } },
      categoria: { select: { nome: true } },
      palavras: { orderBy: [{ bloco: "asc" }, { timestamp: "asc" }] },
    },
  });

  if (!avaliacao) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/avaliacoes"
          className="inline-flex items-center gap-1.5 text-label-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Avaliações
        </Link>
      </div>

      <PageHeader
        title="Revisão das palavras"
        subtitle={`${avaliacao.paciente.nome} — ${avaliacao.categoria.nome}`}
      />

      <RevisorPalavras
        avaliacaoId={id}
        palavrasIniciais={avaliacao.palavras.map((p) => ({
          id: p.id,
          texto: p.texto,
          bloco: p.bloco,
          tipo: p.tipo as "VALIDA" | "REPETICAO" | "INTRUSAO" | "NEOLOGISMO",
          timestamp: p.timestamp,
        }))}
        duracaoSegundos={avaliacao.duracaoSegundos}
      />
    </div>
  );
}
