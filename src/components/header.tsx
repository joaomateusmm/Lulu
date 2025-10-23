"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const handleLogout = () => {
    localStorage.removeItem("Lulu Nail_user_id");
    window.location.href = "/authentication";
  };

  return (
    <header className="flex items-center justify-between border px-10 py-3">
      <div className="flex items-center rounded-md">
        <Link href="/">
          <h2 className="text-primary cursor-pointer text-2xl font-bold transition-colors hover:opacity-80">
            Lulu Nail
          </h2>
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Menu className="h-6 w-6 text-gray-700" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-2">
          <DropdownMenuLabel>Lulu Nail</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/services" className="cursor-pointer">
              Agendar Serviço
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/" className="cursor-pointer">
              Ver Agendamentos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/history" className="cursor-pointer">
              Histórico de Agendamentos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="https://wa.link/e35ygr" className="cursor-pointer">
              Contato
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            Sair da Conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
