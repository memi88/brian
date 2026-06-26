"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function BotaoDeletarAvaliacao({ avaliacaoId }: { avaliacaoId: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [deletando, setDeletando] = useState(false);

  async function handleDelete() {
    setDeletando(true);
    await fetch(`/api/avaliacoes/${avaliacaoId}`, { method: "DELETE" });
    router.push("/avaliacoes");
    router.refresh();
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-label-sm text-text-secondary">Confirmar exclusão?</span>
        <button
          onClick={handleDelete}
          disabled={deletando}
          className="text-label-sm text-tertiary font-semibold hover:underline disabled:opacity-60"
        >
          {deletando ? "Excluindo..." : "Sim, excluir"}
        </button>
        <button
          onClick={() => setConfirmando(false)}
          className="text-label-sm text-text-secondary hover:text-on-surface"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      className="flex items-center gap-1.5 text-label-sm text-text-secondary hover:text-tertiary transition-colors"
    >
      <Trash2 size={14} />
      Excluir avaliação
    </button>
  );
}
