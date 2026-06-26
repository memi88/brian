"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tarefa } from "@/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface TarefasListProps {
  tarefas: Tarefa[];
  pacienteId: string;
  atendimentoId?: string;
  showAddForm?: boolean;
}

export function TarefasList({ tarefas, pacienteId, atendimentoId, showAddForm = true }: TarefasListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [novaDescricao, setNovaDescricao] = useState("");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function toggleStatus(tarefa: Tarefa) {
    await fetch(`/api/tarefas/${tarefa.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: tarefa.status === "PENDENTE" ? "CONCLUIDA" : "PENDENTE",
      }),
    });
    startTransition(() => router.refresh());
  }

  async function deletar(id: string) {
    await fetch(`/api/tarefas/${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  async function adicionarTarefa(e: React.FormEvent) {
    e.preventDefault();
    if (!novaDescricao.trim()) return;
    setAdding(true);
    await fetch("/api/tarefas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pacienteId, atendimentoId, descricao: novaDescricao }),
    });
    setNovaDescricao("");
    setShowForm(false);
    setAdding(false);
    startTransition(() => router.refresh());
  }

  const pendentes = tarefas.filter((t) => t.status === "PENDENTE");
  const concluidas = tarefas.filter((t) => t.status === "CONCLUIDA");

  return (
    <div className="flex flex-col gap-3">
      {pendentes.length === 0 && concluidas.length === 0 && (
        <p className="text-body-sm text-text-secondary">Nenhuma tarefa ainda.</p>
      )}

      {pendentes.map((t) => (
        <TarefaItem
          key={t.id}
          tarefa={t}
          onToggle={() => toggleStatus(t)}
          onDelete={() => deletar(t.id)}
          disabled={isPending}
        />
      ))}

      {concluidas.length > 0 && (
        <details className="mt-1">
          <summary className="text-label-sm text-text-secondary cursor-pointer select-none">
            {concluidas.length} concluída{concluidas.length !== 1 ? "s" : ""}
          </summary>
          <div className="flex flex-col gap-2 mt-2">
            {concluidas.map((t) => (
              <TarefaItem
                key={t.id}
                tarefa={t}
                onToggle={() => toggleStatus(t)}
                onDelete={() => deletar(t.id)}
                disabled={isPending}
              />
            ))}
          </div>
        </details>
      )}

      {showAddForm && (
        showForm ? (
          <form onSubmit={adicionarTarefa} className="flex gap-2 mt-1">
            <Input
              placeholder="Descrever tarefa…"
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              autoFocus
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={adding}>
              {adding ? "…" : "Adicionar"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setShowForm(false); setNovaDescricao(""); }}
            >
              Cancelar
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-label-sm text-text-secondary hover:text-primary transition-colors mt-1 w-fit"
          >
            <Plus size={14} />
            Adicionar tarefa
          </button>
        )
      )}
    </div>
  );
}

function TarefaItem({
  tarefa,
  onToggle,
  onDelete,
  disabled,
}: {
  tarefa: Tarefa;
  onToggle: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const concluida = tarefa.status === "CONCLUIDA";

  return (
    <div className="flex items-start gap-3 group">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          "mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors",
          concluida
            ? "bg-primary border-primary"
            : "border-border hover:border-primary"
        )}
        aria-label={concluida ? "Marcar como pendente" : "Marcar como concluída"}
      >
        {concluida && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span
        className={cn(
          "flex-1 text-body-sm",
          concluida ? "line-through text-text-secondary" : "text-on-surface"
        )}
      >
        {tarefa.descricao}
      </span>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-text-secondary hover:text-error"
        aria-label="Remover tarefa"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
