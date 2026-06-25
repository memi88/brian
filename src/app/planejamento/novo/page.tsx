import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlanoForm } from "@/components/planos/PlanoForm";

export const dynamic = "force-dynamic";

type SearchParams = { searchParams: Promise<{ pacienteId?: string }> };

export default async function NovoPlanoPage({ searchParams }: SearchParams) {
  const { pacienteId } = await searchParams;
  const prisma = await getDB();

  const pacientes = await prisma.paciente.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  let contextoInicial = null;
  if (pacienteId) {
    const ultimoAtendimento = await prisma.atendimento.findFirst({
      where: { pacienteId },
      orderBy: { data: "desc" },
      include: {
        tarefas: { where: { status: "PENDENTE" }, orderBy: { createdAt: "asc" } },
      },
    });
    if (ultimoAtendimento) {
      contextoInicial = {
        data: ultimoAtendimento.data.toISOString(),
        resumo: ultimoAtendimento.resumo,
        tarefasPendentes: ultimoAtendimento.tarefas.map((t) => ({
          id: t.id,
          descricao: t.descricao,
        })),
      };
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Novo plano de sessão" />
      <PlanoForm
        pacientes={pacientes}
        defaultPacienteId={pacienteId}
        contextoInicial={contextoInicial}
      />
    </div>
  );
}
