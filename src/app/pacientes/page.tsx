import Link from "next/link";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { calcularIdade, formatarData } from "@/lib/utils";
import { Plus, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  const prisma = await getDB();
  const pacientes = await prisma.paciente.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    include: {
      _count: {
        select: {
          tarefas: { where: { status: "PENDENTE" } },
          atendimentos: true,
        },
      },
    },
  });

  return (
    <div>
      <PageHeader
        title="Pacientes"
        subtitle={`${pacientes.length} paciente${pacientes.length !== 1 ? "s" : ""} ativo${pacientes.length !== 1 ? "s" : ""}`}
        action={
          <Link href="/pacientes/novo">
            <Button>
              <Plus size={16} />
              Novo paciente
            </Button>
          </Link>
        }
      />

      {pacientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-body-md text-text-secondary">Nenhum paciente cadastrado ainda.</p>
          <Link href="/pacientes/novo" className="mt-4">
            <Button variant="secondary">Cadastrar primeiro paciente</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border border border-border rounded-lg overflow-hidden bg-surface">
          {pacientes.map((p) => (
            <Link
              key={p.id}
              href={`/pacientes/${p.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-surface-low transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-body-md font-semibold text-on-surface">{p.nome}</span>
                <span className="text-body-sm text-text-secondary">
                  {p.dataNascimento
                    ? `${calcularIdade(p.dataNascimento)} anos · `
                    : ""}
                  {p._count.atendimentos} atendimento{p._count.atendimentos !== 1 ? "s" : ""}
                  {p.dataInicioAcomp
                    ? ` · desde ${formatarData(p.dataInicioAcomp)}`
                    : ""}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {p._count.tarefas > 0 && (
                  <Badge variant="pending">
                    {p._count.tarefas} pendente{p._count.tarefas !== 1 ? "s" : ""}
                  </Badge>
                )}
                <ChevronRight size={16} className="text-text-secondary" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
