import { CalendarSearch, Scissors } from "lucide-react";
import Image from "next/image";

const Authentication = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#F2EEEF] p-4">
      {/* Conteúdo principal centralizado */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <div className="mb-4 flex h-33 w-33 items-center justify-center rounded-full bg-white shadow-lg">
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
              Bem-vindo à Andrews Barber
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
          © 2025 Barbearia - Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
};

export default Authentication;
