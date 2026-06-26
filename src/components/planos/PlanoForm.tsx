"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { formatarData } from "@/lib/utils";
import { ClipboardList, CheckCircle2 } from "lucide-react";

type Paciente = { id: string; nome: string };

type Contexto = {
  data: string;
  resumo: string | null;
  tarefasPendentes: { id: string; descricao: string }[];
} | null;

interface PlanoFormProps {
  pacientes: Paciente[];
  defaultPacienteId?: string;
  contextoInicial?: Contexto;
}

export function PlanoForm({ pacientes, defaultPacienteId, contextoInicial }: PlanoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [pacienteId, setPacienteId] = useState(defaultPacienteId ?? "");
  const [planoTexto, setPlanoTexto] = useState("");
  const [contexto, setContexto] = useState<Contexto>(contextoInicial ?? null);
  const [loadingContexto, setLoadingContexto] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pacienteId || pacienteId === defaultPacienteId) return;
    setContexto(null);
    setLoadingContexto(true);
    fetch(`/api/planos/contexto?pacienteId=${pacienteId}`)
      .then((r) => r.json())
      .then((data) => {
        setContexto(
          data.ultimoAtendimento
            ? {
                data: data.ultimoAtendimento.data,
                resumo: data.ultimoAtendimento.resumo,
                tarefasPendentes: data.ultimoAtendimento.tarefas.map(
                  (t: { id: string; descricao: string }) => ({ id: t.id, descricao: t.descricao })
                ),
              }
            : null
        );
      })
      .finally(() => setLoadingContexto(false));
  }, [pacienteId, defaultPacienteId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pacienteId) { setError("Selecione um paciente"); return; }
    if (!planoTexto.trim()) { setError("O plano não pode ser vazio"); return; }

    setError("");
    const res = await fetch("/api/planos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pacienteId, plano: planoTexto }),
    });

    if (!res.ok) { setError("Erro ao salvar o plano"); return; }

    startTransition(() => router.push("/planejamento"));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {!defaultPacienteId && (
        <Select
          label="Paciente"
          value={pacienteId}
          onChange={(e) => setPacienteId(e.target.value)}
          required
        >
          <option value="">Selecione...</option>
          {pacientes.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </Select>
      )}

      {/* Contexto do último atendimento */}
      {loadingContexto && (
        <p className="text-body-sm text-text-secondary animate-pulse">Carregando contexto...</p>
      )}

      {contexto && !loadingContexto && (
        <Card className="border-secondary/50 bg-secondary/10">
          <p className="text-label-sm font-semibold text-on-surface mb-3 flex items-center gap-1.5">
            <ClipboardList size={14} className="text-primary" />
            Último atendimento — {formatarData(contexto.data)}
          </p>

          {contexto.resumo && (
            <div className="mb-3">
              <p className="text-label-sm text-text-secondary mb-1">Resumo</p>
              <p className="text-body-sm text-on-surface">{contexto.resumo}</p>
            </div>
          )}

          {contexto.tarefasPendentes.length > 0 && (
            <div>
              <p className="text-label-sm text-text-secondary mb-2">
                {contexto.tarefasPendentes.length} tarefa{contexto.tarefasPendentes.length !== 1 ? "s" : ""} pendente{contexto.tarefasPendentes.length !== 1 ? "s" : ""}
              </p>
              <ul className="flex flex-col gap-1">
                {contexto.tarefasPendentes.map((t) => (
                  <li key={t.id} className="flex items-start gap-2 text-body-sm text-on-surface">
                    <CheckCircle2 size={14} className="text-tertiary mt-0.5 shrink-0" />
                    {t.descricao}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!contexto.resumo && contexto.tarefasPendentes.length === 0 && (
            <p className="text-body-sm text-text-secondary">Nenhuma informação adicional registrada.</p>
          )}
        </Card>
      )}

      {pacienteId && !contexto && !loadingContexto && (
        <p className="text-body-sm text-text-secondary">
          Primeiro atendimento — sem histórico anterior.
        </p>
      )}

      <Textarea
        label="Plano para a próxima sessão"
        value={planoTexto}
        onChange={(e) => setPlanoTexto(e.target.value)}
        rows={8}
        placeholder="Descreva os objetivos, atividades planejadas e estratégias para a próxima sessão..."
        required
      />

      {error && <p className="text-label-sm text-error">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar plano"}
        </Button>
        <Button type="button" variant="outlined" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
