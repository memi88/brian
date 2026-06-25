"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface PacienteFormProps {
  defaultValues?: {
    id: string;
    nome: string;
    dataNascimento?: string | null;
    responsavel?: string | null;
    contato?: string | null;
    dataInicioAcomp?: string | null;
    observacoes?: string | null;
  };
}

export function PacienteForm({ defaultValues }: PacienteFormProps) {
  const router = useRouter();
  const isEditing = !!defaultValues?.id;

  const [form, setForm] = useState({
    nome: defaultValues?.nome ?? "",
    dataNascimento: defaultValues?.dataNascimento?.slice(0, 10) ?? "",
    responsavel: defaultValues?.responsavel ?? "",
    contato: defaultValues?.contato ?? "",
    dataInicioAcomp: defaultValues?.dataInicioAcomp?.slice(0, 10) ?? "",
    observacoes: defaultValues?.observacoes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    setLoading(true);
    setError("");

    const payload = {
      nome: form.nome,
      dataNascimento: form.dataNascimento || null,
      responsavel: form.responsavel || null,
      contato: form.contato || null,
      dataInicioAcomp: form.dataInicioAcomp || null,
      observacoes: form.observacoes || null,
    };

    const res = await fetch(
      isEditing ? `/api/pacientes/${defaultValues.id}` : "/api/pacientes",
      {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao salvar");
      setLoading(false);
      return;
    }

    const paciente = await res.json();
    router.push(`/pacientes/${paciente.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Nome completo *"
        value={form.nome}
        onChange={(e) => set("nome", e.target.value)}
        placeholder="Nome do paciente"
        error={error && !form.nome.trim() ? error : undefined}
        autoFocus
      />
      <Input
        label="Data de nascimento"
        type="date"
        value={form.dataNascimento}
        onChange={(e) => set("dataNascimento", e.target.value)}
      />
      <Input
        label="Responsável / contato"
        value={form.responsavel}
        onChange={(e) => set("responsavel", e.target.value)}
        placeholder="Nome do responsável"
      />
      <Input
        label="Telefone / e-mail"
        value={form.contato}
        onChange={(e) => set("contato", e.target.value)}
        placeholder="(11) 99999-9999 ou email@exemplo.com"
      />
      <Input
        label="Início do acompanhamento"
        type="date"
        value={form.dataInicioAcomp}
        onChange={(e) => set("dataInicioAcomp", e.target.value)}
      />
      <Textarea
        label="Observações gerais"
        value={form.observacoes}
        onChange={(e) => set("observacoes", e.target.value)}
        placeholder="Diagnóstico, histórico relevante, informações importantes…"
        rows={4}
      />

      {error && form.nome.trim() && (
        <p className="text-label-sm text-error">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando…" : isEditing ? "Salvar alterações" : "Cadastrar paciente"}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
