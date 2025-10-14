"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EyeClosed, Scissors } from "lucide-react";
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

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
        <Carousel className="w-full">
          <CarouselContent className="-ml-7">
            {/* Serviço 1 - Corte de Cabelo */}
            <CarouselItem className="basis-1/2 pl-2">
              <Link href="/authentication">
                <div className="flex cursor-pointer flex-col items-center gap-3 transition-transform duration-200 hover:scale-105 active:scale-95">
                  <div className="flex h-30 w-30 items-center justify-center rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
                    <Scissors className="h-14 w-14 rotate-270 text-gray-700" />
                  </div>
                  <p className="text-center text-sm font-medium text-gray-700">
                    Corte de Cabelo
                  </p>
                </div>
              </Link>
            </CarouselItem>

            {/* Serviço 2 - Barba */}
            <CarouselItem className="basis-1/2 pl-2">
              <Link href="/authentication">
                <div className="flex cursor-pointer flex-col items-center gap-3 transition-transform duration-200 hover:scale-105 active:scale-95">
                  <div className="flex h-30 w-30 items-center justify-center rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
                    <div
                      className="flex h-14 w-14 items-center justify-center"
                      style={{
                        filter:
                          "brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(665%) hue-rotate(202deg) brightness(93%) contrast(85%)",
                      }}
                    >
                      <Image
                        src="/assets/beard-icon.svg"
                        alt="Ícone de Barba"
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <p className="text-center text-sm font-medium text-gray-700">
                    Barba
                  </p>
                </div>
              </Link>
            </CarouselItem>

            {/* Serviço 3 - Sobrancelha */}
            <CarouselItem className="basis-1/2 pl-2">
              <Link href="/authentication">
                <div className="flex cursor-pointer flex-col items-center gap-3 transition-transform duration-200 hover:scale-105 active:scale-95">
                  <div className="flex h-30 w-30 items-center justify-center rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
                    <EyeClosed className="h-14 w-14 text-gray-700" />
                  </div>
                  <p className="text-center text-sm font-medium text-gray-700">
                    Sobrancelha
                  </p>
                </div>
              </Link>
            </CarouselItem>

            {/* Serviço 4 - Exemplo adicional */}
            <CarouselItem className="basis-1/2 pl-2">
              <Link href="/authentication">
                <div className="flex cursor-pointer flex-col items-center gap-3 transition-transform duration-200 hover:scale-105 active:scale-95">
                  <div className="flex h-30 w-30 items-center justify-center rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
                    <Scissors className="h-14 w-14 text-gray-700" />
                  </div>
                  <p className="text-center text-sm font-medium text-gray-700">
                    Cabelo + Barba
                  </p>
                </div>
              </Link>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </main>
    </div>
  );
};

export default Authentication;
