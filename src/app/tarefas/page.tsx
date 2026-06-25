import Link from "next/link";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { TarefasList } from "@/components/tarefas/TarefasList";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function TarefasPage() {
  const prisma = await getDB();
  const pacientesComTarefas = await prisma.paciente.findMany({
    where: {
      ativo: true,
      tarefas: { some: { status: "PENDENTE" } },
    },
    orderBy: { nome: "asc" },
    include: {
      tarefas: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const total = pacientesComTarefas.reduce(
    (acc, p) => acc + p.tarefas.filter((t) => t.status === "PENDENTE").length,
    0
  );

  return (
    <div>
      <PageHeader
        title="Tarefas pendentes"
        subtitle={total > 0 ? `${total} tarefa${total !== 1 ? "s" : ""} em aberto` : "Tudo em dia!"}
      />

      {pacientesComTarefas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-body-md text-text-secondary">Nenhuma tarefa pendente. </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pacientesComTarefas.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <Link
                  href={`/pacientes/${p.id}`}
                  className="text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors"
                >
                  {p.nome}
                </Link>
              </CardHeader>
              <TarefasList tarefas={p.tarefas} pacienteId={p.id} showAddForm={false} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
