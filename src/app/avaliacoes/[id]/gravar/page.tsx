import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { GravadorAudio } from "@/components/avaliacoes/GravadorAudio";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function GravarPage({ params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: {
      paciente: { select: { nome: true } },
      categoria: { select: { nome: true } },
    },
  });

  if (!avaliacao) notFound();

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Teste de Fluência Verbal"
        subtitle={`${avaliacao.paciente.nome} — ${avaliacao.categoria.nome}`}
      />

      <GravadorAudio
        avaliacaoId={id}
        categoria={avaliacao.categoria.nome}
        paciente={avaliacao.paciente.nome}
      />
    </div>
  );
}
