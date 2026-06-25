import { PacienteForm } from "@/components/pacientes/PacienteForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NovoPacientePage() {
  return (
    <div className="max-w-xl">
      <PageHeader title="Novo paciente" />
      <PacienteForm />
    </div>
  );
}
