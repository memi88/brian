import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { TarefasList } from "@/components/tarefas/TarefasList";
import { calcularIdade, formatarData } from "@/lib/utils";
import { Pencil, Plus, Calendar, ClipboardList, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function PacientePage({ params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: {
      atendimentos: {
        orderBy: { data: "desc" },
        include: { tarefas: true, plano: true },
      },
      tarefas: {
        orderBy: { createdAt: "desc" },
      },
      planos: {
        where: { atendimentoId: null },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      avaliacoes: {
        orderBy: { dataAplicacao: "desc" },
        take: 5,
        include: { categoria: { select: { nome: true, cor: true } } },
      },
    },
  });

  if (!paciente) notFound();

  const tarefasPendentes = paciente.tarefas.filter((t) => t.status === "PENDENTE");

  return (
    <div>
      <PageHeader
        title={paciente.nome}
        subtitle={
          [
            paciente.dataNascimento
              ? `${calcularIdade(paciente.dataNascimento)} anos`
              : null,
            paciente.dataInicioAcomp
              ? `Acompanhamento desde ${formatarData(paciente.dataInicioAcomp)}`
              : null,
          ]
            .filter(Boolean)
            .join(" · ") || undefined
        }
        action={
          <div className="flex gap-2">
            <Link href={`/pacientes/${id}/editar`}>
              <Button variant="outlined" size="sm">
                <Pencil size={14} />
                Editar
              </Button>
            </Link>
            <Link href={`/pacientes/${id}/atendimentos/novo`}>
              <Button size="sm">
                <Plus size={14} />
                Novo atendimento
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal: atendimentos */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Atendimentos</CardTitle>
            </CardHeader>

            {paciente.atendimentos.length === 0 ? (
              <p className="text-body-sm text-text-secondary">Nenhum atendimento registrado.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border -mx-6 -mb-6">
                {paciente.atendimentos.map((a) => (
                  <Link
                    key={a.id}
                    href={`/atendimentos/${a.id}`}
                    className="flex flex-col gap-1.5 px-6 py-4 hover:bg-surface-low transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-text-secondary" />
                        <span className="text-label-md font-semibold text-on-surface">
                          {formatarData(a.data)}
                          {a.horario && ` às ${a.horario}`}
                        </span>
                      </div>
                      {a.tarefas.filter((t) => t.status === "PENDENTE").length > 0 && (
                        <Badge variant="pending">
                          {a.tarefas.filter((t) => t.status === "PENDENTE").length} tarefa{a.tarefas.filter((t) => t.status === "PENDENTE").length !== 1 ? "s" : ""} pendente{a.tarefas.filter((t) => t.status === "PENDENTE").length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    {a.resumo && (
                      <p className="text-body-sm text-on-surface-variant line-clamp-2">{a.resumo}</p>
                    )}
                    {a.plano && (
                      <p className="text-label-sm text-primary font-semibold mt-1">
                        Plano registrado para esta sessão
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Avaliações */}
          {paciente.avaliacoes.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Avaliações</CardTitle>
                  <Link href={`/avaliacoes/nova?pacienteId=${id}`} className="text-label-sm text-primary hover:underline">
                    Nova
                  </Link>
                </div>
              </CardHeader>
              <div className="flex flex-col divide-y divide-border -mx-6 -mb-6">
                {paciente.avaliacoes.map((av) => (
                  <Link
                    key={av.id}
                    href={`/avaliacoes/${av.id}`}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-surface-low transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: av.categoria.cor }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-label-md text-on-surface">{av.categoria.nome}</span>
                      <span className="text-label-sm text-text-secondary ml-2">{formatarData(av.dataAplicacao)}</span>
                    </div>
                    {av.revisaoCompleta ? (
                      <CheckCircle size={14} className="text-primary shrink-0" />
                    ) : (
                      <Badge variant="pending">Revisar</Badge>
                    )}
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Coluna lateral: tarefas + infos */}
        <div className="flex flex-col gap-4">
          {/* Plano pendente */}
          {paciente.planos[0] ? (
            <Link href={`/planejamento/${paciente.planos[0].id}`} className="block">
              <Card className="border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-primary text-headline-sm flex items-center gap-1.5">
                    <ClipboardList size={14} />
                    Plano para próxima sessão
                  </CardTitle>
                </CardHeader>
                <p className="text-body-sm text-on-surface whitespace-pre-wrap line-clamp-4">{paciente.planos[0].plano}</p>
              </Card>
            </Link>
          ) : (
            <Card className="border-dashed">
              <div className="flex flex-col items-center py-4 gap-2 text-center">
                <ClipboardList size={20} className="text-primary/40" />
                <p className="text-body-sm text-text-secondary">Sem plano para a próxima sessão</p>
                <Link href={`/planejamento/novo?pacienteId=${id}`}>
                  <Button variant="outlined" size="sm">
                    <Plus size={12} />
                    Criar plano
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Tarefas pendentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tarefas</CardTitle>
                {tarefasPendentes.length > 0 && (
                  <Badge variant="pending">{tarefasPendentes.length}</Badge>
                )}
              </div>
            </CardHeader>
            <TarefasList tarefas={paciente.tarefas} pacienteId={id} />
          </Card>

          {/* Dados do paciente */}
          <Card>
            <CardHeader>
              <CardTitle>Dados</CardTitle>
            </CardHeader>
            <dl className="flex flex-col gap-3">
              {paciente.responsavel && (
                <div>
                  <dt className="text-label-sm text-text-secondary">Responsável</dt>
                  <dd className="text-body-sm text-on-surface">{paciente.responsavel}</dd>
                </div>
              )}
              {paciente.contato && (
                <div>
                  <dt className="text-label-sm text-text-secondary">Contato</dt>
                  <dd className="text-body-sm text-on-surface">{paciente.contato}</dd>
                </div>
              )}
              {paciente.observacoes && (
                <div>
                  <dt className="text-label-sm text-text-secondary">Observações</dt>
                  <dd className="text-body-sm text-on-surface whitespace-pre-wrap">{paciente.observacoes}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
