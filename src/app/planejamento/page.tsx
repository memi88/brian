import Link from "next/link";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Plus, ClipboardList, Calendar } from "lucide-react";
import { formatarData } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PlanejamentoPage() {
  const prisma = await getDB();

  const [planosAtivos, planosExecutados] = await Promise.all([
    prisma.planoSessao.findMany({
      where: { atendimentoId: null },
      orderBy: { createdAt: "desc" },
      include: { paciente: { select: { id: true, nome: true } } },
    }),
    prisma.planoSessao.findMany({
      where: { NOT: { atendimentoId: null } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        paciente: { select: { id: true, nome: true } },
        atendimento: { select: { id: true, data: true } },
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Planejamento"
        subtitle="Planos de sessão por paciente"
        action={
          <Link href="/planejamento/novo">
            <Button size="sm">
              <Plus size={14} />
              Novo plano
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-headline-sm font-semibold text-on-surface">Planos pendentes</h2>
            {planosAtivos.length > 0 && (
              <Badge variant="pending">{planosAtivos.length}</Badge>
            )}
          </div>

          {planosAtivos.length === 0 ? (
            <Card className="flex flex-col items-center py-12 gap-3 text-center">
              <ClipboardList size={28} className="text-primary/40" />
              <p className="text-body-sm text-text-secondary">Nenhum plano pendente</p>
              <Link href="/planejamento/novo">
                <Button variant="outlined" size="sm">Criar plano</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {planosAtivos.map((p) => (
                <Link key={p.id} href={`/planejamento/${p.id}`} className="block">
                  <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer border-primary/20 bg-primary/5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-label-md font-semibold text-primary">{p.paciente.nome}</span>
                      <Badge variant="pending">Pendente</Badge>
                    </div>
                    <p className="text-body-sm text-on-surface line-clamp-3 whitespace-pre-wrap">{p.plano}</p>
                    <p className="text-label-sm text-text-secondary mt-3">
                      Criado em {formatarData(p.createdAt)}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {planosExecutados.length > 0 && (
          <section>
            <h2 className="text-headline-sm font-semibold text-on-surface mb-4">Histórico de planos</h2>
            <div className="flex flex-col gap-2">
              {planosExecutados.map((p) => (
                <Link key={p.id} href={`/planejamento/${p.id}`} className="block">
                  <Card className="flex flex-col sm:flex-row sm:items-start gap-3 hover:bg-surface-low transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-label-md font-semibold text-on-surface">{p.paciente.nome}</span>
                        <Badge variant="done">Executado</Badge>
                      </div>
                      <p className="text-body-sm text-text-secondary line-clamp-2">{p.plano}</p>
                    </div>
                    {p.atendimento && (
                      <div className="flex items-center gap-1.5 text-label-sm text-text-secondary shrink-0">
                        <Calendar size={12} />
                        {formatarData(p.atendimento.data)}
                      </div>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
