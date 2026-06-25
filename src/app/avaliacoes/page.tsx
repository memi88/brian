import Link from "next/link";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Plus, Settings, CheckCircle, Clock } from "lucide-react";
import { formatarData } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AvaliacoesPage() {
  const prisma = await getDB();

  const [avaliacoes, totalCategorias] = await Promise.all([
    prisma.avaliacao.findMany({
      orderBy: { dataAplicacao: "desc" },
      take: 20,
      include: {
        paciente: { select: { id: true, nome: true } },
        categoria: { select: { nome: true, cor: true } },
      },
    }),
    prisma.categoriaSemantica.count({ where: { ativo: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Avaliações"
        subtitle="Teste de Fluência Verbal Semântica"
        action={
          <div className="flex gap-2">
            <Link href="/avaliacoes/categorias">
              <Button variant="outlined" size="sm">
                <Settings size={14} />
                Categorias ({totalCategorias})
              </Button>
            </Link>
            <Link href="/avaliacoes/nova">
              <Button size="sm">
                <Plus size={14} />
                Nova avaliação
              </Button>
            </Link>
          </div>
        }
      />

      {avaliacoes.length === 0 ? (
        <Card className="flex flex-col items-center py-16 gap-3 text-center">
          <p className="text-body-md text-on-surface font-semibold">Nenhuma avaliação realizada ainda</p>
          <p className="text-body-sm text-text-secondary max-w-xs">
            Inicie uma nova avaliação para registrar o Teste de Fluência Verbal Semântica de um paciente.
          </p>
          {totalCategorias === 0 ? (
            <div className="flex flex-col items-center gap-2 mt-2">
              <p className="text-label-sm text-tertiary">Primeiro, cadastre uma categoria semântica (ex: Animais).</p>
              <Link href="/avaliacoes/categorias">
                <Button variant="outlined" size="sm">Cadastrar categorias</Button>
              </Link>
            </div>
          ) : (
            <Link href="/avaliacoes/nova">
              <Button size="sm">
                <Plus size={14} />
                Nova avaliação
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {avaliacoes.map((a) => (
            <Link key={a.id} href={`/avaliacoes/${a.id}`} className="block">
              <Card className="flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-surface-low transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-label-md font-semibold text-on-surface">{a.paciente.nome}</span>
                    <span
                      className="inline-block w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: a.categoria.cor }}
                    />
                    <span className="text-label-sm text-text-secondary">{a.categoria.nome}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-label-sm text-text-secondary">
                    <span>{formatarData(a.dataAplicacao)}</span>
                    {a.duracaoSegundos && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {Math.floor(a.duracaoSegundos / 60)}:{String(a.duracaoSegundos % 60).padStart(2, "0")}
                      </span>
                    )}
                    <span><strong className="text-on-surface">{a.totalValidas}</strong> válidas</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {a.revisaoCompleta ? (
                    <Badge variant="done">
                      <CheckCircle size={11} className="mr-1 inline" />
                      Revisada
                    </Badge>
                  ) : (
                    <Badge variant="pending">Pendente revisão</Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
