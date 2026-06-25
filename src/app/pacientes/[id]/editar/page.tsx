import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { PacienteForm } from "@/components/pacientes/PacienteForm";

type Params = { params: Promise<{ id: string }> };

export default async function EditarPacientePage({ params }: Params) {
  const { id } = await params;
  const prisma = await getDB();

  const paciente = await prisma.paciente.findUnique({ where: { id } });
  if (!paciente) notFound();

  return (
    <div className="max-w-xl">
      <PageHeader title={`Editar — ${paciente.nome}`} />
      <PacienteForm
        defaultValues={{
          id: paciente.id,
          nome: paciente.nome,
          dataNascimento: paciente.dataNascimento?.toISOString() ?? null,
          responsavel: paciente.responsavel,
          contato: paciente.contato,
          dataInicioAcomp: paciente.dataInicioAcomp?.toISOString() ?? null,
          observacoes: paciente.observacoes,
        }}
      />
    </div>
  );
}
