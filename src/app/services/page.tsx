"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Header } from "@/components/header";

import SignInForm from "./components/sign-in-form";

function ServicesContent() {
  const searchParams = useSearchParams();
  const preSelectedService = searchParams.get("service");

  return <SignInForm preSelectedService={preSelectedService || undefined} />;
}

const Services = () => {
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
        <Suspense fallback={<div>Carregando...</div>}>
          <ServicesContent />
        </Suspense>
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

export default Services;
