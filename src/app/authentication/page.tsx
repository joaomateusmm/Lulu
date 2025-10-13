import { CalendarSearch, Menu, Scissors } from "lucide-react";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Authentication = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#F2EEEF]">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center rounded-md bg-[#f7f7f7] px-2 py-1">
          <h2 className="text-lg font-bold text-purple-700">BarberFy</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Menu className="h-6 w-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-2">
            <DropdownMenuLabel>BarberFy</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Agendar Corte</DropdownMenuItem>
            <DropdownMenuItem>Ver Agendamentos</DropdownMenuItem>
            <DropdownMenuItem>Serviços</DropdownMenuItem>
            <DropdownMenuItem>Contato</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Conteúdo principal centralizado */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <div className="mb-4 flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-lg">
            <Image
              src="/logo.png"
              alt="Logo Andrews Barber"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">
              Bem-vindo à BarberFy
            </h1>
            <p className="text-gray-600">O que você deseja fazer?</p>
          </div>

          <div className="mt-6 flex gap-10">
            <div className="flex cursor-pointer flex-col items-center gap-3 transition-transform duration-200 hover:scale-105 active:scale-95">
              <div className="flex h-30 w-30 items-center justify-center rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
                <Scissors className="h-14 w-14 rotate-270 text-gray-700" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Agendar um<br></br> Corte
              </p>
            </div>

            <div className="flex cursor-pointer flex-col items-center gap-3 transition-transform duration-200 hover:scale-105 active:scale-95">
              <div className="flex h-30 w-30 items-center justify-center rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
                <CalendarSearch className="h-14 w-14 text-gray-700" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Ver meus<br></br> Agendamentos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé fixo na parte inferior */}
      <footer className="flex justify-center py-4">
        <p className="text-sm text-gray-500">
          © 2025 BarberFy - Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
};

export default Authentication;
