"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

interface PlanoEditorProps {
  plano: { id: string; texto: string };
  readOnly?: boolean;
}

export function PlanoEditor({ plano, readOnly = false }: PlanoEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [texto, setTexto] = useState(plano.texto);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/planos/${plano.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plano: texto }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    await fetch(`/api/planos/${plano.id}`, { method: "DELETE" });
    startTransition(() => router.push("/planejamento"));
    router.refresh();
  }

  if (readOnly) {
    return (
      <div className="rounded-lg border border-border bg-surface-low p-4">
        <p className="text-body-sm text-on-surface whitespace-pre-wrap">{plano.texto}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {editing ? (
        <>
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={10}
            autoFocus
          />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => { setTexto(plano.texto); setEditing(false); }}
            >
              Cancelar
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-lg border border-border bg-surface-low p-4">
            <p className="text-body-sm text-on-surface whitespace-pre-wrap">{texto}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outlined" onClick={() => setEditing(true)}>
              Editar plano
            </Button>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-body-sm text-text-secondary">Confirmar exclusão?</span>
                <Button variant="danger" size="sm" onClick={handleDelete} disabled={isPending}>
                  Excluir
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
                Excluir plano
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
