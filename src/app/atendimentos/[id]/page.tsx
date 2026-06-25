import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { TarefasList } from "@/components/tarefas/TarefasList";
import { formatarData } from "@/lib/utils";
import { ArrowLeft, ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function AtendimentoPage({ params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const atendimento = await prisma.atendimento.findUnique({
    where: { id },
    include: {
      paciente: true,
      tarefas: { orderBy: { createdAt: "asc" } },
      plano: true,
    },
  });

  if (!atendimento) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/pacientes/${atendimento.pacienteId}`}
          className="inline-flex items-center gap-1.5 text-label-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          {atendimento.paciente.nome}
        </Link>
      </div>

      <PageHeader
        title={`Atendimento — ${formatarData(atendimento.data)}${atendimento.horario ? ` às ${atendimento.horario}` : ""}`}
        subtitle={atendimento.paciente.nome}
      />

      <div className="flex flex-col gap-4">
        {/* Plano que orientou esta sessão */}
        {atendimento.plano && (
          <Card className="border-primary/30 bg-primary/5">
            <div className="flex items-start gap-2 mb-2">
              <ClipboardList size={16} className="text-primary mt-0.5" />
              <span className="text-label-md font-semibold text-primary">Plano desta sessão</span>
            </div>
            <p className="text-body-sm text-on-surface whitespace-pre-wrap">{atendimento.plano.plano}</p>
          </Card>
        )}

        {atendimento.resumo && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <p className="text-body-sm text-on-surface whitespace-pre-wrap">{atendimento.resumo}</p>
          </Card>
        )}

        {atendimento.atividades && (
          <Card>
            <CardHeader>
              <CardTitle>Atividades realizadas</CardTitle>
            </CardHeader>
            <p className="text-body-sm text-on-surface whitespace-pre-wrap">{atendimento.atividades}</p>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Tarefas</CardTitle>
          </CardHeader>
          <TarefasList
            tarefas={atendimento.tarefas}
            pacienteId={atendimento.pacienteId}
            atendimentoId={atendimento.id}
            showAddForm
          />
        </Card>

        <div className="flex gap-3">
          <Link href={`/pacientes/${atendimento.pacienteId}`}>
            <Button variant="outlined">Voltar ao paciente</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
