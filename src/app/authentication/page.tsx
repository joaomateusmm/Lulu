"use client";

import { CalendarSearch, Scissors } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Header } from "@/components/header";

import SignInForm from "./components/sign-in-form";

type ViewType = "home" | "schedule" | "appointments";

const Authentication = () => {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleViewChange = async (newView: ViewType) => {
    setIsTransitioning(true);

    // Aguarda a animação de fade out
    setTimeout(() => {
      setCurrentView(newView);
      setIsTransitioning(false);
    }, 300);
  };

  // Componente da tela inicial
  const HomeView = () => (
    <div className="flex max-w-md flex-col items-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">
          Bem-vindo à BarberFy
        </h1>
        <p className="text-gray-600">O que você deseja fazer?</p>
      </div>

      <div className="mt-6 flex gap-10">
        <div
          className="flex cursor-pointer flex-col items-center gap-3 transition-transform duration-200 hover:scale-105 active:scale-95"
          onClick={() => handleViewChange("schedule")}
        >
          <div className="flex h-30 w-30 items-center justify-center rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
            <Scissors className="h-14 w-14 rotate-270 text-gray-700" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            Agendar um<br></br> Corte
          </p>
        </div>

        <Link href="/">
          <div className="flex cursor-pointer flex-col items-center gap-3 transition-transform duration-200 hover:scale-105 active:scale-95">
            <div className="flex h-30 w-30 items-center justify-center rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
              <CalendarSearch className="h-14 w-14 text-gray-700" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Ver meus<br></br> Agendamentos
            </p>
          </div>
        </Link>
      </div>
    </div>
  );

  // Componente da tela de agendamentos
  const AppointmentsView = () => (
    <div className="flex max-w-md flex-col items-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">Meus Agendamentos</h1>
      </div>

      <div className="w-full rounded-lg bg-white p-6 shadow-lg">
        <p className="text-gray-500">Nenhum agendamento encontrado.</p>
        <button
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          onClick={() => handleViewChange("home")}
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );

  // Renderizar a view atual com animações
  const renderCurrentView = () => {
    switch (currentView) {
      case "schedule":
        return (
          <SignInForm
            onBack={() => handleViewChange("home")}
            showBackButton={true}
          />
        );
      case "appointments":
        return <AppointmentsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F2EEEF]">
      {/* Header */}
      <Header />

      {/* Logo fixa */}
      <div className="flex justify-center">
        <div className="mt-5 flex h-35 w-35 items-center justify-center rounded-full bg-white shadow-lg">
          <Image
            src="/logo.png"
            alt="Logo BarberFy"
            width={120}
            height={120}
            className="rounded-full object-cover"
          />
        </div>
      </div>

      {/* Conteúdo dinâmico centralizado */}
      <div className="flex flex-1 items-center justify-center px-4 pb-4">
        <div
          className={`transition-all duration-300 ease-in-out ${
            isTransitioning
              ? "scale-95 transform opacity-0"
              : "scale-100 transform opacity-100"
          }`}
        >
          {renderCurrentView()}
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
