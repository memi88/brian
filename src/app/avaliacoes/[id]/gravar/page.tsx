import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { GravadorAudio } from "@/components/avaliacoes/GravadorAudio";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const TIPO_LABELS: Record<string, string> = {
  LIVRE: "Fluência Verbal Livre",
  FONEMICA: "Fluência Verbal Fonêmica",
  SEMANTICA: "Fluência Verbal Semântica",
};

function getDuracaoTotal(tipo: string): number {
  return tipo === "LIVRE" ? 150 : 120;
}

export default async function GravarPage({ params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: {
      paciente: { select: { nome: true } },
    },
  });

  if (!avaliacao) notFound();

  const tipoLabel = TIPO_LABELS[avaliacao.tipo] ?? "Fluência Verbal";

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Teste de Fluência Verbal"
        subtitle={`${avaliacao.paciente.nome} — ${tipoLabel}`}
      />

      <GravadorAudio
        avaliacaoId={id}
        tipo={avaliacao.tipo}
        paciente={avaliacao.paciente.nome}
        duracaoTotal={getDuracaoTotal(avaliacao.tipo)}
      />
    </div>
  );
}
