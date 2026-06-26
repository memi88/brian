"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Calendar, CheckSquare, ClipboardList, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/planejamento", label: "Planejamento", icon: Calendar },
  { href: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/avaliacoes", label: "Avaliações", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-surface-low h-full">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Brain size={20} className="text-primary" />
        <span className="text-label-md font-semibold text-on-surface">Brain</span>
      </div>

      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded text-body-sm transition-colors",
                active
                  ? "bg-primary text-white font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 flex border-t border-border bg-surface z-50">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 text-label-sm transition-colors",
              active ? "text-primary" : "text-text-secondary"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2 : 1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
