import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { PlanoEditor } from "@/components/planos/PlanoEditor";
import { formatarData } from "@/lib/utils";
import { ArrowLeft, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function PlanoPage({ params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const plano = await prisma.planoSessao.findUnique({
    where: { id },
    include: {
      paciente: { select: { id: true, nome: true } },
      atendimento: { select: { id: true, data: true } },
    },
  });

  if (!plano) notFound();

  const executado = !!plano.atendimentoId;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/planejamento"
          className="inline-flex items-center gap-1.5 text-label-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Planejamento
        </Link>
      </div>

      <PageHeader
        title="Plano de sessão"
        subtitle={plano.paciente.nome}
      />

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          {executado ? (
            <Badge variant="done">Executado</Badge>
          ) : (
            <Badge variant="pending">Pendente</Badge>
          )}
          <span className="text-label-sm text-text-secondary">
            Criado em {formatarData(plano.createdAt)}
          </span>
          {plano.atendimento && (
            <Link
              href={`/atendimentos/${plano.atendimento.id}`}
              className="inline-flex items-center gap-1 text-label-sm text-primary hover:underline"
            >
              <Calendar size={12} />
              Atendimento de {formatarData(plano.atendimento.data)}
            </Link>
          )}
        </div>

        <PlanoEditor
          plano={{ id: plano.id, texto: plano.plano }}
          readOnly={executado}
        />

        <div className="pt-2">
          <Link
            href={`/pacientes/${plano.paciente.id}`}
            className="text-label-sm text-text-secondary hover:text-primary transition-colors"
          >
            Ver paciente: {plano.paciente.nome}
          </Link>
        </div>
      </div>
    </div>
  );
}
