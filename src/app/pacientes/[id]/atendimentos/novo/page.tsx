import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { AtendimentoForm } from "@/components/atendimentos/AtendimentoForm";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function NovoAtendimentoPage({ params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const paciente = await prisma.paciente.findUnique({ where: { id } });
  if (!paciente) notFound();

  // Plano mais recente sem atendimento vinculado
  const plano = await prisma.planoSessao.findFirst({
    where: { pacienteId: id, atendimentoId: null },
    orderBy: { createdAt: "desc" },
  });

  // Último atendimento com tarefas pendentes (para contexto)
  const ultimoAtendimento = await prisma.atendimento.findFirst({
    where: { pacienteId: id },
    orderBy: { data: "desc" },
    include: {
      tarefas: { where: { status: "PENDENTE" }, orderBy: { createdAt: "asc" } },
    },
  });

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Novo atendimento"
        subtitle={paciente.nome}
      />
      <AtendimentoForm
        pacienteId={id}
        plano={plano ? { id: plano.id, texto: plano.plano } : null}
        ultimoAtendimento={
          ultimoAtendimento
            ? {
                data: ultimoAtendimento.data.toISOString(),
                resumo: ultimoAtendimento.resumo,
                tarefasPendentes: ultimoAtendimento.tarefas.map((t) => ({
                  id: t.id,
                  descricao: t.descricao,
                })),
              }
            : null
        }
      />
    </div>
  );
}
