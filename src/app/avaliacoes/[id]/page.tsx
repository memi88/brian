import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatarData } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Clock, ClipboardList } from "lucide-react";
import { BotaoDeletarAvaliacao } from "@/components/avaliacoes/BotaoDeletarAvaliacao";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const TIPO_LABELS: Record<string, string> = {
  LIVRE: "Fluência Verbal Livre",
  FONEMICA: "Fluência Verbal Fonêmica",
  SEMANTICA: "Fluência Verbal Semântica",
};

function getBlocos(numBlocos: number) {
  const all = [
    { label: "Bloco 1", intervalo: "0 – 30s", index: 0 },
    { label: "Bloco 2", intervalo: "30 – 60s", index: 1 },
    { label: "Bloco 3", intervalo: "60 – 90s", index: 2 },
    { label: "Bloco 4", intervalo: "90 – 120s", index: 3 },
    { label: "Bloco 5", intervalo: "120 – 150s", index: 4 },
  ];
  return all.slice(0, numBlocos);
}

export default async function AvaliacaoPage({ params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: {
      paciente: { select: { id: true, nome: true } },
      categoria: { select: { nome: true, cor: true } },
      palavras: { orderBy: [{ bloco: "asc" }, { timestamp: "asc" }] },
    },
  });

  if (!avaliacao) notFound();

  const numBlocos = avaliacao.tipo === "LIVRE" ? 5 : 4;
  const BLOCOS = getBlocos(numBlocos);
  const tipoLabel = TIPO_LABELS[avaliacao.tipo] ?? "Fluência Verbal";

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/avaliacoes"
          className="inline-flex items-center gap-1.5 text-label-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Avaliações
        </Link>
        {!avaliacao.revisaoCompleta && (
          <Link href={`/avaliacoes/${id}/revisar`}>
            <Button size="sm" variant="outlined">
              <ClipboardList size={14} />
              Revisar palavras
            </Button>
          </Link>
        )}
      </div>

      <PageHeader
        title="Resultado da avaliação"
        subtitle={`${avaliacao.paciente.nome} — ${tipoLabel}`}
      />

      <div className="flex flex-col gap-5">
        {/* Status + data */}
        <div className="flex flex-wrap items-center gap-3">
          {avaliacao.revisaoCompleta ? (
            <Badge variant="done">
              <CheckCircle size={11} className="inline mr-1" />
              Revisada
            </Badge>
          ) : (
            <Badge variant="pending">Pendente revisão</Badge>
          )}
          <span className="text-label-sm text-text-secondary">
            {formatarData(avaliacao.dataAplicacao)}
          </span>
          {avaliacao.duracaoSegundos && (
            <span className="flex items-center gap-1 text-label-sm text-text-secondary">
              <Clock size={12} />
              {Math.floor(avaliacao.duracaoSegundos / 60)}:{String(avaliacao.duracaoSegundos % 60).padStart(2, "0")}
            </span>
          )}
          {avaliacao.categoria && (
            <span className="flex items-center gap-1.5 text-label-sm text-text-secondary">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: avaliacao.categoria.cor }} />
              {avaliacao.categoria.nome}
            </span>
          )}
        </div>

        {/* Totais */}
        <Card>
          <CardHeader>
            <CardTitle>Total de palavras</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-low border border-border rounded-lg p-3 text-center">
              <div className="text-2xl font-bold tabular-nums text-on-surface">{avaliacao.totalPalavras}</div>
              <div className="text-label-sm text-text-secondary mt-0.5">Total</div>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold tabular-nums text-primary-dark">{avaliacao.totalValidas}</div>
              <div className="text-label-sm text-text-secondary mt-0.5">Válidas</div>
            </div>
          </div>
        </Card>

        {/* Palavras por bloco */}
        <Card>
          <CardHeader>
            <CardTitle>Palavras por bloco</CardTitle>
          </CardHeader>
          <div className={`grid gap-2 ${numBlocos === 5 ? "grid-cols-5" : "grid-cols-4"}`}>
            {BLOCOS.map((b) => {
              const count = avaliacao.palavras.filter((p) => p.bloco === b.index).length;
              return (
                <div key={b.index} className="text-center">
                  <div className="text-2xl font-bold text-on-surface tabular-nums">{count}</div>
                  <div className="text-label-sm text-text-secondary">{b.label}</div>
                  <div className="text-label-sm text-text-secondary opacity-60">{b.intervalo}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Palavras por bloco (lista) */}
        {BLOCOS.map((b) => {
          const blocoWords = avaliacao.palavras.filter((p) => p.bloco === b.index);
          if (blocoWords.length === 0) return null;
          return (
            <Card key={b.index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{b.label} — {b.intervalo}</CardTitle>
                  <span className="text-label-sm text-primary font-semibold">
                    {blocoWords.length} palavra{blocoWords.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardHeader>
              <div className="flex flex-wrap gap-2">
                {blocoWords.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center rounded-full border px-3 py-1 text-body-sm font-medium bg-primary/15 text-primary-dark border-primary/30"
                  >
                    {p.texto}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}

        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3">
            <Link href={`/pacientes/${avaliacao.paciente.id}`}>
              <Button variant="outlined">Ver paciente</Button>
            </Link>
            {!avaliacao.revisaoCompleta && (
              <Link href={`/avaliacoes/${id}/revisar`}>
                <Button>Revisar palavras</Button>
              </Link>
            )}
          </div>
          <BotaoDeletarAvaliacao avaliacaoId={id} />
        </div>
      </div>
    </div>
  );
}
