"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, Scissors } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Header } from "@/components/header";
import { useUserData } from "@/hooks/use-user-data";

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
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
import { Button } from "@/components/ui/button";

const HistoryPage = () => {
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

  // Função para mapear tipos de serviço
  const getServiceName = (serviceType: string) => {
    switch (serviceType) {
      case "corte-cabelo":
        return "Corte de Cabelo";
      case "corte-barba":
        return "Corte de Barba";
      case "cabelo-barba":
        return "Cabelo e Barba";
      default:
        return "Serviço Desconhecido";
    }
  };

  // Ordenar agendamentos por data (mais recente primeiro)
  const sortedAppointments = [...appointments].sort((a, b) => {
    return (
      new Date(b.appointmentDate).getTime() -
      new Date(a.appointmentDate).getTime()
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2EEEF]">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-gray-600">Carregando histórico...</p>
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
        {/* Cabeçalho da Página */}
        <div className="mb-6 flex flex-col items-start gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="shadow-md">
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Histórico de Agendamentos
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Olá {user?.name ? formatUserName(user.name) : "Cliente"}, aqui
              estão todos os seus agendamentos.
            </p>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm font-bold">
            Todos os Agendamentos ({appointments.length}):
          </p>

          <Accordion type="single" collapsible className="w-full">
            {appointments.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Scissors className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-muted-foreground text-lg font-medium">
                  Nenhum agendamento encontrado
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Você ainda não fez nenhum agendamento conosco.
                </p>
                <Link
                  href="/authentication"
                  className="text-primary mt-4 inline-block text-sm hover:underline"
                >
                  Fazer primeiro agendamento →
                </Link>
              </div>
            ) : (
              sortedAppointments.map(
                (appointment: Appointment, index: number) => (
                  <AccordionItem
                    key={appointment.id}
                    value={`appointment-${index}`}
                    className="mb-4 overflow-hidden rounded-lg border-none bg-white shadow-md"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                      <div className="flex w-full items-start justify-between">
                        <div className="flex items-start">
                          <div className="flex flex-col items-start">
                            <p className="text-muted-foreground text-sm font-bold">
                              {getServiceName(
                                appointment.serviceType || "corte-cabelo",
                              )}{" "}
                              - {formatDate(appointment.appointmentDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="flex flex-col gap-2 pl-12">
                        <p className="text-muted-foreground text-sm font-medium">
                          <strong>Horário do serviço:</strong>{" "}
                          {appointment.appointmentTime}
                        </p>
                        <p className="text-muted-foreground text-sm font-medium">
                          <strong>Data:</strong>{" "}
                          {formatDate(appointment.appointmentDate)}
                        </p>
                        <p className="text-muted-foreground text-sm font-medium">
                          <strong>Barbeiro:</strong> BarberFy Team
                        </p>
                        <p className="text-muted-foreground text-sm font-medium">
                          <strong>Serviço:</strong>{" "}
                          {getServiceName(
                            appointment.serviceType || "corte-cabelo",
                          )}
                        </p>
                        <p className="text-muted-foreground text-sm font-medium">
                          <strong>Agendado em:</strong>{" "}
                          {format(
                            new Date(appointment.createdAt),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR },
                          )}
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
                ),
              )
            )}
          </Accordion>
        </div>

        {/* Rodapé */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-xs">
            © 2025 BarberFy - Todos os direitos reservados.
          </p>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
