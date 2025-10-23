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
        <div className="mt-5 flex h-35 w-35 items-center justify-center rounded-full bg-white shadow-lg duration-300 hover:scale-105 hover:shadow-xl">
          <Image
            src="/logo.jpg"
            alt="Logo Lulu Nail"
            width={300}
            height={300}
            className="rounded-full"
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
          © 2025 Lulu Nail - Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
};

export default Services;
