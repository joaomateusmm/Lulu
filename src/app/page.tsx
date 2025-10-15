"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeft,
  Clock,
  Pencil,
  Scissors,
  Trash,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Header } from "@/components/header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserData } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

// Schema de validação para edição de agendamento
const editAppointmentSchema = z.object({
  serviceType: z.string().min(1, "Selecione um tipo de serviço"),
  appointmentDate: z.date({
    message: "Selecione uma data para o agendamento",
  }),
  appointmentTime: z.string().min(1, "Selecione um horário"),
});

type EditAppointmentFormData = z.infer<typeof editAppointmentSchema>;
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Authentication = () => {
  const { user, appointments, loading, error, refreshData } = useUserData();
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<
    string | null
  >(null);
  const [editingAppointmentId, setEditingAppointmentId] = useState<
    string | null
  >(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  // Função para mapear ícones de serviços
  const getServiceIcon = (serviceType: string) => {
    const iconStyle = {
      filter:
        "brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(665%) hue-rotate(202deg) brightness(73%) contrast(85%)",
    };

    switch (serviceType) {
      case "corte-cabelo":
        return (
          <div
            className="flex h-8 w-8 items-center justify-center"
            style={iconStyle}
          >
            <Image
              src="/assets/hair-icon.svg"
              alt="Ícone de Corte de Cabelo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
        );
      case "corte-barba":
        return (
          <div
            className="flex h-8 w-8 items-center justify-center"
            style={iconStyle}
          >
            <Image
              src="/assets/beard-icon.svg"
              alt="Ícone de Corte de Barba"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
        );
      case "cabelo-barba":
        return (
          <div
            className="flex h-8 w-8 items-center justify-center"
            style={iconStyle}
          >
            <Image
              src="/assets/hairstyle-icon.svg"
              alt="Ícone de Cabelo e Barba"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
        );
      default:
        return <Scissors className="h-8 w-8 rotate-270 text-gray-800" />;
    }
  };

  // Função para cancelar agendamento
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setCancellingAppointmentId(appointmentId);

      const response = await fetch(
        `/api/appointments/${appointmentId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Agendamento cancelado com sucesso!");
        // Recarregar os dados para atualizar a lista
        await refreshData();
      } else {
        toast.error(result.message || "Erro ao cancelar agendamento.");
      }
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      toast.error("Erro ao cancelar agendamento. Tente novamente.");
    } finally {
      setCancellingAppointmentId(null);
    }
  };

  // Função para editar agendamento
  const handleEditAppointment = async (
    appointmentId: string,
    formData: EditAppointmentFormData,
  ) => {
    try {
      setEditingAppointmentId(appointmentId);

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceType: formData.serviceType,
          appointmentDate: format(formData.appointmentDate, "yyyy-MM-dd"),
          appointmentTime: formData.appointmentTime,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Agendamento atualizado com sucesso!");
        setEditDialogOpen(false);
        await refreshData();
      } else {
        toast.error(result.message || "Erro ao atualizar agendamento.");
      }
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      toast.error("Erro ao atualizar agendamento. Tente novamente.");
    } finally {
      setEditingAppointmentId(null);
    }
  };

  // Componente de formulário de edição
  const EditAppointmentForm = ({
    appointment,
  }: {
    appointment: Appointment;
  }) => {
    const [allTimeSlotsWithStatus, setAllTimeSlotsWithStatus] = useState<
      { time: string; available: boolean }[]
    >([]);
    const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

    const form = useForm<EditAppointmentFormData>({
      resolver: zodResolver(editAppointmentSchema),
      defaultValues: {
        serviceType: appointment.serviceType,
        appointmentDate: new Date(appointment.appointmentDate),
        appointmentTime: appointment.appointmentTime,
      },
    });

    // Função para buscar horários disponíveis
    const fetchAvailableTimeSlots = async (date: Date) => {
      setLoadingTimeSlots(true);

      try {
        const dateString = format(date, "yyyy-MM-dd");
        const response = await fetch(
          `/api/appointments/available-times?date=${dateString}`,
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setAllTimeSlotsWithStatus(result.data.allTimeSlotsWithStatus);
        } else {
          toast.error("Erro ao carregar horários disponíveis.");
          setAllTimeSlotsWithStatus([]);
        }
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
        toast.error("Erro ao carregar horários disponíveis.");
        setAllTimeSlotsWithStatus([]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    // Buscar horários quando a data mudar
    const watchedDate = form.watch("appointmentDate");
    useEffect(() => {
      if (watchedDate) {
        fetchAvailableTimeSlots(watchedDate);
      }
    }, [watchedDate]);

    const onSubmit = (data: EditAppointmentFormData) => {
      handleEditAppointment(appointment.id, data);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Serviço</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo de serviço" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full">
                    <SelectItem value="corte-cabelo">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-4 w-4 items-center justify-center"
                          style={{
                            filter:
                              "brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(665%) hue-rotate(202deg) brightness(73%) contrast(85%)",
                          }}
                        >
                          <Image
                            src="/assets/hair-icon.svg"
                            alt="Ícone de Corte de Cabelo"
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                        Corte de Cabelo
                      </div>
                    </SelectItem>
                    <SelectItem value="corte-barba">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-4 w-4 items-center justify-center"
                          style={{
                            filter:
                              "brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(665%) hue-rotate(202deg) brightness(73%) contrast(85%)",
                          }}
                        >
                          <Image
                            src="/assets/beard-icon.svg"
                            alt="Ícone de Corte de Barba"
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                        Corte de Barba
                      </div>
                    </SelectItem>
                    <SelectItem value="cabelo-barba">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-4 w-4 items-center justify-center"
                          style={{
                            filter:
                              "brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(665%) hue-rotate(202deg) brightness(73%) contrast(85%)",
                          }}
                        >
                          <Image
                            src="/assets/hairstyle-icon.svg"
                            alt="Ícone de Cabelo e Barba"
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                        Cabelo e Barba
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data do Agendamento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        if (date) {
                          // Limpar seleção de horário quando data mudar
                          form.setValue("appointmentTime", "");
                        }
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <Clock className="mr-2 h-4 w-4 text-gray-600" />
                        {field.value || "Selecione um horário"}
                      </Button>
                    </FormControl>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-60 w-full overflow-y-auto">
                    <DropdownMenuLabel>
                      Horários de funcionamento
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {loadingTimeSlots ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                        <span className="ml-2 text-sm text-gray-500">
                          Carregando...
                        </span>
                      </div>
                    ) : allTimeSlotsWithStatus.length === 0 ? (
                      <div className="p-4 text-center">
                        <span className="text-sm text-gray-500">
                          Selecione uma data primeiro
                        </span>
                      </div>
                    ) : (
                      allTimeSlotsWithStatus.map((slot) => {
                        // Verificar se este é o horário atual do agendamento
                        const isCurrentAppointmentTime =
                          slot.time === appointment.appointmentTime;

                        // Se for o horário atual do agendamento, sempre mostrar como disponível
                        if (isCurrentAppointmentTime || slot.available) {
                          // Horário disponível - pode ser clicado
                          return (
                            <DropdownMenuItem
                              key={slot.time}
                              onClick={() => field.onChange(slot.time)}
                              className="cursor-pointer hover:bg-gray-100"
                            >
                              {slot.time}
                              {isCurrentAppointmentTime && " (atual)"}
                            </DropdownMenuItem>
                          );
                        } else {
                          // Horário ocupado - não pode ser clicado
                          return (
                            <DropdownMenuItem
                              key={slot.time}
                              className="cursor-not-allowed bg-gray-100 opacity-70"
                              onSelect={(e) => {
                                e.preventDefault();
                                return false;
                              }}
                            >
                              {slot.time} - Ocupado
                            </DropdownMenuItem>
                          );
                        }
                      })
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-center gap-2 pt-4">
            <AlertDialogCancel
              className="shadow-md"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancelar
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={editingAppointmentId === appointment.id}
              className="bg-primary hover:bg-primary/90 text-white shadow-md"
            >
              {editingAppointmentId === appointment.id ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    );
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
            {appointments.filter(
              (appointment) => appointment.status === "scheduled",
            ).length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Você não tem agendamentos confirmados no momento.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href="/services"
                    className="text-primary text-sm hover:underline"
                  >
                    Fazer novo agendamento
                  </Link>
                  <p className="text-muted-foreground text-sm">ou</p>
                  <Link
                    href="/history"
                    className="text-primary text-sm hover:underline"
                  >
                    Ver histórico completo
                  </Link>
                </div>
              </div>
            ) : (
              appointments
                .filter(
                  (appointment: Appointment) =>
                    appointment.status === "scheduled",
                )
                .map((appointment: Appointment, index: number) => (
                  <AccordionItem
                    key={appointment.id}
                    value={`appointment-${index}`}
                    className="mb-4 overflow-hidden rounded-lg border-none bg-white shadow-md"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                      <div className="flex items-center">
                        <div className="mr-4">
                          {getServiceIcon(
                            appointment.serviceType || "corte-cabelo",
                          )}
                        </div>
                        <div className="flex flex-col items-start">
                          <p className="text-muted-foreground text-sm font-bold">
                            {getServiceName(
                              appointment.serviceType || "corte-cabelo",
                            )}{" "}
                            - {formatDate(appointment.appointmentDate)}
                          </p>
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
                          <strong>Barbeiro:</strong> BarberFy Team
                        </p>
                        <p className="text-muted-foreground text-sm font-medium">
                          <strong>Serviço:</strong>{" "}
                          {getServiceName(
                            appointment.serviceType || "corte-cabelo",
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-muted-foreground text-sm font-medium">
                            <strong>Status:</strong>
                          </p>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="mt-2 mb-1 flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                className="shadow-md"
                                disabled={
                                  appointment.status === "cancelled" ||
                                  appointment.status === "completed"
                                }
                                variant={
                                  appointment.status === "cancelled"
                                    ? "secondary"
                                    : "default"
                                }
                              >
                                <Trash className="h-5 w-5" />
                                <p>
                                  {appointment.status === "cancelled"
                                    ? "Cancelado"
                                    : "Cancelar"}
                                </p>
                              </Button>
                            </AlertDialogTrigger>
                            {appointment.status !== "cancelled" &&
                              appointment.status !== "completed" && (
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Cancelar Agendamento
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Você tem certeza que deseja cancelar este
                                      agendamento? Esta ação não pode ser
                                      desfeita e irá cancelar permanentemente
                                      seu agendamento de{" "}
                                      <strong>
                                        {getServiceName(
                                          appointment.serviceType ||
                                            "corte-cabelo",
                                        )}
                                      </strong>{" "}
                                      para o dia{" "}
                                      <strong>
                                        {formatDate(
                                          appointment.appointmentDate,
                                        )}
                                      </strong>{" "}
                                      às{" "}
                                      <strong>
                                        {appointment.appointmentTime}
                                      </strong>
                                      .
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="flex w-full items-center justify-center gap-4">
                                    <AlertDialogCancel>
                                      <ChevronLeft />
                                      Manter
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleCancelAppointment(appointment.id)
                                      }
                                      disabled={
                                        cancellingAppointmentId ===
                                        appointment.id
                                      }
                                      className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
                                    >
                                      {cancellingAppointmentId ===
                                      appointment.id ? (
                                        <>
                                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                          Cancelando...
                                        </>
                                      ) : (
                                        <>
                                          <Trash />
                                          Cancelar
                                        </>
                                      )}
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              )}
                          </AlertDialog>
                          <AlertDialog
                            open={editDialogOpen}
                            onOpenChange={setEditDialogOpen}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="shadow-md"
                                onClick={() => setEditDialogOpen(true)}
                                disabled={
                                  appointment.status === "cancelled" ||
                                  appointment.status === "completed"
                                }
                              >
                                <Pencil />
                                Editar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Editar Agendamento
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Altere as informações do seu agendamento
                                  abaixo.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <EditAppointmentForm appointment={appointment} />
                            </AlertDialogContent>
                          </AlertDialog>
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
            <Link href="/services?service=corte-cabelo">
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
          <Link href="/services?service=corte-barba">
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
          <Link href="/services?service=cabelo-barba">
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
