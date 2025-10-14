"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Scissors } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Header } from "@/components/header";
import { useUserData } from "@/hooks/use-user-data";

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
}
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const Authentication = () => {
  const { user, appointments, loading, error } = useUserData();

  // Mostrar toast de erro se houver
  if (error) {
    toast.error(error);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-primary text-white">Confirmado</Badge>;
      case "completed":
        return <Badge className="bg-green-600 text-white">Concluído</Badge>;
      case "cancelled":
        return <Badge className="bg-red-600 text-white">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatUserName = (fullName: string) => {
    const nameParts = fullName.trim().split(" ");
    if (nameParts.length === 1) {
      return nameParts[0];
    }
    const firstName = nameParts[0];
    const secondNameInitial = nameParts[1].charAt(0).toUpperCase();
    return `${firstName} ${secondNameInitial}.`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2EEEF]">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F2EEEF]">
      {/* Header */}
      <Header />

      {/* Conteúdo Principal */}
      <main className="flex-1 px-10 py-6">
        {/* Seção de Boas-vindas */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bem-vindo!</h1>
            <p className="text-primary text-2xl font-bold">
              {user?.name ? formatUserName(user.name) : "Cliente"}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Agende nossos serviços.
            </p>
          </div>

          {/* Logo Circular */}
          <div className="flex h-20 w-20 items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo BarberFy"
              width={200}
              height={200}
              className="rounded-full object-cover"
            />
          </div>
        </div>
        {/* Estado do agendamento card quando for clicado */}

        <div className="mt-6 flex flex-col gap-2">
          <p className="text-muted-foreground text-sm font-bold">
            Seus Agendamentos:
          </p>

          <Accordion type="single" collapsible className="w-full">
            {appointments.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Você ainda não tem agendamentos.
                </p>
                <Link
                  href="/authentication"
                  className="text-primary mt-2 inline-block text-sm hover:underline"
                >
                  Agendar primeiro corte
                </Link>
              </div>
            ) : (
              appointments.map((appointment: Appointment, index: number) => (
                <AccordionItem
                  key={appointment.id}
                  value={`appointment-${index}`}
                  className="mb-4 overflow-hidden rounded-lg border-none bg-white shadow-md"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center">
                      <Scissors className="mr-4 h-8 w-8 rotate-270 text-gray-800" />
                      <div className="flex flex-col items-start">
                        <p className="text-muted-foreground text-sm font-bold">
                          Corte de Cabelo -{" "}
                          {formatDate(appointment.appointmentDate)}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3">
                    <div className="flex flex-col gap-2 pl-12">
                      <p className="text-muted-foreground text-sm font-medium">
                        <strong>Horário do corte:</strong>{" "}
                        {appointment.appointmentTime}
                      </p>
                      <p className="text-muted-foreground text-sm font-medium">
                        <strong>Barbeiro:</strong> BarberFy Team
                      </p>
                      <p className="text-muted-foreground text-sm font-medium">
                        <strong>Serviço:</strong> Corte de Cabelo
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-muted-foreground text-sm font-medium">
                          <strong>Status:</strong>
                        </p>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        </div>
        <p className="text-muted-foreground mt-2 mb-3 text-sm font-bold">
          Nossos Serviços:
        </p>

        {/* Grid de Serviços - 1 card centralizado na primeira linha, 2 na segunda */}
        <div className="grid grid-cols-2 gap-4">
          {/* Serviço 1 - Corte de Cabelo (Centralizado) */}
          <div className="col-span-2 flex justify-center">
            <Link href="/authentication">
              <div className="flex cursor-pointer flex-col items-center gap-3 transition-transform duration-200 hover:scale-105 active:scale-95">
                <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
                  <div
                    className="flex h-12 w-12 items-center justify-center"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(665%) hue-rotate(202deg) brightness(73%) contrast(85%)",
                    }}
                  >
                    <Image
                      src="/assets/hair-icon.svg"
                      alt="Ícone de Corte de Cabelo"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                </div>
                <p className="text-center text-sm font-medium text-gray-700">
                  Corte de Cabelo
                </p>
              </div>
            </Link>
          </div>

          {/* Serviço 2 - Barba */}
          <Link href="/authentication">
            <div className="flex cursor-pointer flex-col items-center gap-3 transition-transform duration-200 hover:scale-105 active:scale-95">
              <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
                <div
                  className="flex h-12 w-12 items-center justify-center"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(665%) hue-rotate(202deg) brightness(73%) contrast(85%)",
                  }}
                >
                  <Image
                    src="/assets/beard-icon.svg"
                    alt="Ícone de Barba"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-center text-sm font-medium text-gray-700">
                Barba
              </p>
            </div>
          </Link>

          {/* Serviço 3 - Barba + Cabelo */}
          <Link href="/authentication">
            <div className="flex cursor-pointer flex-col items-center gap-3 transition-transform duration-200 hover:scale-105 active:scale-95">
              <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
                <div
                  className="flex h-12 w-12 items-center justify-center"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(665%) hue-rotate(202deg) brightness(73%) contrast(85%)",
                  }}
                >
                  <Image
                    src="/assets/hairstyle-icon.svg"
                    alt="Ícone de Barba + Cabelo"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-center text-sm font-medium text-gray-700">
                Barba + Cabelo
              </p>
            </div>
          </Link>
        </div>
        <p className="text-muted-foreground mt-6 mb-2 text-sm font-bold">
          Nossa Localização:
        </p>

        {/* Card de Localização */}
        <div className="rounded-lg bg-white p-4 shadow-md">
          {/* Mapa */}
          <div
            className="mb-4 h-40 w-full rounded-md bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/maps.jpg')",
            }}
          ></div>

          {/* Informações da Barbearia */}
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="mb-1 text-lg font-bold text-gray-700">BarberFy</h3>
              <p className="text-muted-foreground text-sm">
                Rua das Flores, 123 - Centro
                <br />
                São Paulo, SP - CEP: 01234-567
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                <p>
                  <span className="font-medium">Horário:</span>
                </p>
                <p>Segunda à Sexta: 9h às 18h</p>
                <p>Sábado: 8h às 17h</p>
              </div>
            </div>

            {/* Botão Ver no Maps */}
            <a
              href="https://maps.app.goo.gl/RCqmydex1Sz3x5rAA"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-3 text-center text-sm font-medium text-white shadow-md transition-colors duration-200 hover:shadow-lg"
            >
              Ver no Google Maps
            </a>
          </div>
        </div>
        <p className="text-muted-foreground mt-6 text-xs font-bold">
          © 2025 BarberFy - Todos os direitos reservados.
        </p>
      </main>
    </div>
  );
};

export default Authentication;
