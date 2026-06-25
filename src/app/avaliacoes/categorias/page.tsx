"use client";

import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import Link from "next/link";

type Categoria = { id: string; nome: string; cor: string; ativo: boolean };

const CORES_SUGERIDAS = [
  "#6E8B74", "#A5787F", "#AFC6B4", "#777775",
  "#7B8FA1", "#B5834F", "#8B6E87", "#6EA88B",
];

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editCor, setEditCor] = useState("");
  const [adding, setAdding] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaCor, setNovaCor] = useState(CORES_SUGERIDAS[0]);
  const [, startTransition] = useTransition();

  async function load() {
    const res = await fetch("/api/categorias");
    const data = await res.json();
    setCategorias(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!novoNome.trim()) return;
    const res = await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoNome, cor: novaCor }),
    });
    const nova = await res.json();
    setCategorias((prev) => [...prev, nova]);
    setNovoNome("");
    setNovaCor(CORES_SUGERIDAS[0]);
    setAdding(false);
  }

  async function handleEdit(id: string) {
    await fetch(`/api/categorias/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: editNome, cor: editCor }),
    });
    setCategorias((prev) =>
      prev.map((c) => (c.id === id ? { ...c, nome: editNome, cor: editCor } : c))
    );
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/categorias/${id}`, { method: "DELETE" });
    startTransition(() => setCategorias((prev) => prev.filter((c) => c.id !== id)));
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link
          href="/avaliacoes"
          className="inline-flex items-center gap-1.5 text-label-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Avaliações
        </Link>
      </div>

      <PageHeader
        title="Categorias semânticas"
        subtitle="Temas usados no Teste de Fluência Verbal"
        action={
          !adding && (
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus size={14} />
              Nova categoria
            </Button>
          )
        }
      />

      {adding && (
        <Card className="mb-4 border-primary/30 bg-primary/5">
          <div className="flex flex-col gap-3">
            <Input
              label="Nome"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="ex: Animais"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
            />
            <div>
              <label className="text-label-md text-on-surface block mb-1.5">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {CORES_SUGERIDAS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNovaCor(c)}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: novaCor === c ? "var(--color-on-surface)" : "transparent",
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={novaCor}
                  onChange={(e) => setNovaCor(e.target.value)}
                  className="w-7 h-7 rounded-full border border-border cursor-pointer"
                  title="Cor personalizada"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <Button size="sm" onClick={handleAdd} disabled={!novoNome.trim()}>
                <Check size={14} /> Salvar
              </Button>
              <Button size="sm" variant="outlined" onClick={() => setAdding(false)}>
                <X size={14} /> Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-body-sm text-text-secondary">Carregando...</p>
      ) : categorias.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-body-sm text-text-secondary mb-3">Nenhuma categoria cadastrada ainda.</p>
          <p className="text-label-sm text-text-secondary">
            Exemplos: Animais, Frutas, Meios de transporte, Roupas, Alimentos...
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {categorias.map((c) => (
            <Card key={c.id}>
              {editingId === c.id ? (
                <div className="flex flex-col gap-3">
                  <Input
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleEdit(c.id); if (e.key === "Escape") setEditingId(null); }}
                  />
                  <div className="flex gap-2 flex-wrap">
                    {CORES_SUGERIDAS.map((cor) => (
                      <button
                        key={cor}
                        onClick={() => setEditCor(cor)}
                        className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: cor,
                          borderColor: editCor === cor ? "var(--color-on-surface)" : "transparent",
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={editCor}
                      onChange={(e) => setEditCor(e.target.value)}
                      className="w-6 h-6 rounded-full border border-border cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(c.id)}>
                      <Check size={14} /> Salvar
                    </Button>
                    <Button size="sm" variant="outlined" onClick={() => setEditingId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: c.cor }}
                  />
                  <span className="text-body-md text-on-surface flex-1">{c.nome}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingId(c.id); setEditNome(c.nome); setEditCor(c.cor); }}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
