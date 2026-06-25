"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TarefasList } from "@/components/tarefas/TarefasList";
import { formatarData } from "@/lib/utils";
import { CalendarDays, ClipboardList } from "lucide-react";

interface AtendimentoFormProps {
  pacienteId: string;
  plano: { id: string; texto: string } | null;
  ultimoAtendimento: {
    data: string;
    resumo?: string | null;
    tarefasPendentes: { id: string; descricao: string }[];
  } | null;
}

export function AtendimentoForm({ pacienteId, plano, ultimoAtendimento }: AtendimentoFormProps) {
  const router = useRouter();
  const hoje = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    data: hoje,
    horario: "",
    resumo: "",
    atividades: "",
  });
  const [atendimentoId, setAtendimentoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.data) { setError("Data é obrigatória"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/atendimentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pacienteId,
        data: form.data,
        horario: form.horario || null,
        resumo: form.resumo || null,
        atividades: form.atividades || null,
        planoId: plano?.id ?? null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao salvar");
      setLoading(false);
      return;
    }

    const novo = await res.json();
    setAtendimentoId(novo.id);
    setSaved(true);
    setLoading(false);
  }

  // Após salvar, permite adicionar tarefas antes de redirecionar
  if (saved && atendimentoId) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="border-primary/30 bg-primary/5">
          <p className="text-body-sm font-semibold text-primary">Atendimento registrado!</p>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Adicione as tarefas geradas nesta sessão antes de finalizar.
          </p>
        </Card>

        <Card>
          <h2 className="text-headline-sm font-semibold text-on-surface mb-4">Tarefas desta sessão</h2>
          <TarefasList
            tarefas={[]}
            pacienteId={pacienteId}
            atendimentoId={atendimentoId}
            showAddForm
          />
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => { router.push(`/atendimentos/${atendimentoId}`); router.refresh(); }}>
            Ver atendimento
          </Button>
          <Button
            variant="outlined"
            onClick={() => { router.push(`/pacientes/${pacienteId}`); router.refresh(); }}
          >
            Voltar ao paciente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Contexto: plano pendente */}
      {plano && (
        <Card className="border-primary/30 bg-primary/5">
          <div className="flex items-start gap-2 mb-2">
            <ClipboardList size={16} className="text-primary mt-0.5" />
            <span className="text-label-md font-semibold text-primary">Plano para esta sessão</span>
          </div>
          <p className="text-body-sm text-on-surface whitespace-pre-wrap">{plano.texto}</p>
        </Card>
      )}

      {/* Contexto: último atendimento */}
      {ultimoAtendimento && (
        <Card className="bg-surface-low border-border">
          <div className="flex items-start gap-2 mb-2">
            <CalendarDays size={16} className="text-text-secondary mt-0.5" />
            <span className="text-label-md font-semibold text-on-surface-variant">
              Último atendimento — {formatarData(new Date(ultimoAtendimento.data))}
            </span>
          </div>
          {ultimoAtendimento.resumo && (
            <p className="text-body-sm text-on-surface-variant mb-3 line-clamp-3">{ultimoAtendimento.resumo}</p>
          )}
          {ultimoAtendimento.tarefasPendentes.length > 0 && (
            <div>
              <p className="text-label-sm text-text-secondary mb-1.5">
                Tarefas pendentes ({ultimoAtendimento.tarefasPendentes.length}):
              </p>
              <ul className="flex flex-col gap-1">
                {ultimoAtendimento.tarefasPendentes.map((t) => (
                  <li key={t.id} className="text-body-sm text-on-surface-variant flex items-start gap-1.5">
                    <span className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-tertiary" />
                    {t.descricao}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex gap-4">
          <Input
            label="Data *"
            type="date"
            value={form.data}
            onChange={(e) => set("data", e.target.value)}
            className="flex-1"
          />
          <Input
            label="Horário"
            type="time"
            value={form.horario}
            onChange={(e) => set("horario", e.target.value)}
            className="w-36"
          />
        </div>
        <Textarea
          label="Resumo do atendimento"
          value={form.resumo}
          onChange={(e) => set("resumo", e.target.value)}
          placeholder="O que aconteceu na sessão…"
          rows={4}
        />
        <Textarea
          label="Atividades realizadas"
          value={form.atividades}
          onChange={(e) => set("atividades", e.target.value)}
          placeholder="Atividades trabalhadas na sessão…"
          rows={3}
        />

        {error && <p className="text-label-sm text-error">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando…" : "Registrar atendimento"}
          </Button>
          <Button type="button" variant="outlined" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
