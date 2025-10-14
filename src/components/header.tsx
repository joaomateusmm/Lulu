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
    localStorage.removeItem("barberfy_user_id");
    window.location.href = "/authentication";
  };

  return (
    <header className="flex items-center justify-between bg-white px-10 py-3 shadow-sm">
      <div className="flex items-center rounded-md">
        <Link href="/">
          <h2 className="text-primary cursor-pointer text-lg font-bold transition-colors hover:opacity-80">
            BarberFy
          </h2>
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Menu className="h-6 w-6" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-2">
          <DropdownMenuLabel>BarberFy</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/authentication" className="cursor-pointer">
              Agendar Serviço
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/" className="cursor-pointer">
              Ver Agendamentos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Serviços</DropdownMenuItem>
          <DropdownMenuItem>Contato</DropdownMenuItem>
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
