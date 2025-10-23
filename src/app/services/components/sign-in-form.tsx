"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUserData } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z
    .string()
    .min(15, "Telefone deve ter o formato (DD) 9XXXX-XXXX")
    .max(15, "Telefone inválido"),
  serviceType: z.string().min(1, "Selecione um serviço"),
  date: z.date().optional(),
  time: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SignInFormProps {
  onBack?: () => void;
  showBackButton?: boolean;
  preSelectedService?: string;
}

const serviceOptions = [
  { value: "manicure", label: "Manicure" },
  { value: "pedicure", label: "Pedicure" },
  { value: "cilios", label: "Cílios" },
  { value: "sobrancelhas", label: "Sobrancelhas" },
  { value: "micropigmentacao", label: "Micropigmentação" },
  { value: "piercing", label: "Piercing" },
];

const SignInForm = ({
  onBack,
  showBackButton = false,
  preSelectedService,
}: SignInFormProps) => {
  const [showDateTimeFields, setShowDateTimeFields] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [allTimeSlotsWithStatus, setAllTimeSlotsWithStatus] = useState<
    { time: string; available: boolean }[]
  >([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const { user, loading } = useUserData();

  // Função para formatar telefone automaticamente
  const formatPhone = (value: string) => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, "");

    // Aplica a máscara (DD) 9XXXX-XXXX
    if (cleanValue.length <= 2) {
      return `(${cleanValue}`;
    } else if (cleanValue.length <= 3) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
    } else if (cleanValue.length <= 7) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 3)}${cleanValue.slice(3)}`;
    } else if (cleanValue.length <= 11) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 3)}${cleanValue.slice(3, 7)}-${cleanValue.slice(7, 11)}`;
    }

    // Limita a 11 dígitos máximo
    return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 3)}${cleanValue.slice(3, 7)}-${cleanValue.slice(7, 11)}`;
  };

  // Função para validar se o telefone tem o formato correto
  const isValidPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    // Deve ter exatamente 11 dígitos e começar com 9 após o DDD
    return cleanPhone.length === 11 && cleanPhone[2] === "9";
  };

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
        setAvailableTimeSlots(result.data.availableTimeSlots);
        setAllTimeSlotsWithStatus(result.data.allTimeSlotsWithStatus);
      } else {
        toast.error("Erro ao carregar horários disponíveis.");
        setAvailableTimeSlots([]);
        setAllTimeSlotsWithStatus([]);
      }
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      toast.error("Erro ao carregar horários disponíveis.");
      setAvailableTimeSlots([]);
      setAllTimeSlotsWithStatus([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      serviceType: preSelectedService || "",
      date: undefined,
      time: "",
    },
  });

  // Atualizar serviço pré-selecionado se mudar
  useEffect(() => {
    if (preSelectedService) {
      form.setValue("serviceType", preSelectedService);
    }
  }, [preSelectedService, form]);

  // Preencher automaticamente nome e telefone do usuário logado
  useEffect(() => {
    if (user && !loading) {
      // Preencher nome
      if (user.name && !form.getValues("name")) {
        form.setValue("name", user.name);
      }

      // Preencher e formatar telefone
      if (user.phone && !form.getValues("phone")) {
        const formattedPhone = formatPhone(user.phone);
        form.setValue("phone", formattedPhone);
      }
    }
  }, [user, loading, form]);

  // Função para verificar se todos os campos estão preenchidos
  const watchedValues = form.watch();
  const isFirstStepComplete =
    watchedValues.name &&
    watchedValues.phone &&
    watchedValues.serviceType &&
    watchedValues.name.length >= 1 &&
    isValidPhone(watchedValues.phone);
  const isAllFieldsComplete =
    isFirstStepComplete &&
    showDateTimeFields &&
    watchedValues.date &&
    watchedValues.time;

  async function onContinue(values: FormValues) {
    if (!values.name.trim()) {
      form.setError("name", { message: "Nome inválido" });
      return;
    }

    if (!values.phone.trim() || !isValidPhone(values.phone)) {
      form.setError("phone", {
        message: "Telefone deve ter o formato (DD) 9XXXX-XXXX",
      });
      return;
    }

    if (!values.serviceType) {
      form.setError("serviceType", { message: "Selecione um serviço" });
      return;
    }

    setShowDateTimeFields(true);
  }

  async function onSchedule(values: FormValues) {
    if (!values.date) {
      form.setError("date", { message: "Data é obrigatória" });
      return;
    }

    if (!values.time) {
      form.setError("time", { message: "Hora é obrigatória" });
      return;
    }

    try {
      // Verificar disponibilidade em tempo real antes de enviar
      const dateString = format(values.date, "yyyy-MM-dd");
      const availabilityResponse = await fetch(
        `/api/appointments/available-times?date=${dateString}`,
      );

      const availabilityResult = await availabilityResponse.json();

      if (availabilityResponse.ok && availabilityResult.success) {
        const currentlyAvailable = availabilityResult.data.availableTimeSlots;
        const currentAllTimeSlotsWithStatus =
          availabilityResult.data.allTimeSlotsWithStatus;

        // Verificar se o horário selecionado ainda está disponível
        if (!currentlyAvailable.includes(values.time)) {
          toast.error(
            "Este horário foi ocupado por outro cliente. Escolha outro horário.",
          );
          // Atualizar as listas de horários
          setAvailableTimeSlots(currentlyAvailable);
          setAllTimeSlotsWithStatus(currentAllTimeSlotsWithStatus);
          // Limpar a seleção de horário
          form.setValue("time", "");
          return;
        }
      }

      // Salvar agendamento via API (cria conta automaticamente)
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone.replace(/\D/g, ""), // Envia apenas números
          serviceType: values.serviceType,
          appointmentDate: values.date.toISOString(),
          appointmentTime: values.time,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Agendamento realizado com sucesso!");

        // Salvar o userId no localStorage para uso posterior
        if (result.userId) {
          localStorage.setItem("Lulu Nail_user_id", result.userId);
        }

        // Redirecionar para a página principal após 1.5 segundos
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        toast.error(result.message || "Erro ao realizar agendamento.");
      }
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      toast.error("Erro ao realizar agendamento. Tente novamente.");
    }
  }

  function onSubmit(values: FormValues) {
    if (!showDateTimeFields) {
      return onContinue(values);
    } else if (isAllFieldsComplete) {
      return onSchedule(values);
    }
  }

  // Mostrar loading enquanto carrega dados do usuário
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[80vw] md:w-80">
      <div className="mb-4 text-center">
        {showBackButton && (
          <button
            onClick={onBack}
            className="flex items-center text-sm text-gray-600 transition-colors hover:text-gray-800"
          >
            ← Voltar
          </button>
        )}
        <h1 className="my-4 text-2xl font-bold text-gray-900">
          Agendar Serviço
        </h1>
      </div>

      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campos iniciais: Nome, Telefone e Serviço */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Nome completo
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu nome completo"
                        className="h-11 border-gray-300 bg-gray-50 text-sm shadow-md focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Telefone
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        type="tel"
                        className="h-11 border-gray-300 bg-gray-50 text-sm shadow-md focus:border-blue-500 focus:ring-blue-500"
                        value={field.value}
                        onChange={(e) => {
                          const formattedValue = formatPhone(e.target.value);
                          field.onChange(formattedValue);
                        }}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Tipo de Serviço
                    </FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-11 w-full justify-start text-left font-normal shadow-md",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <Scissors className="mr-2 h-4 w-4 text-gray-600/90" />
                            {field.value
                              ? serviceOptions.find(
                                  (service) => service.value === field.value,
                                )?.label
                              : "Selecione um serviço"}
                          </Button>
                        </FormControl>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>
                          Serviços disponíveis
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {serviceOptions.map((service) => (
                          <DropdownMenuItem
                            key={service.value}
                            onClick={() => field.onChange(service.value)}
                            className="cursor-pointer"
                          >
                            {service.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Campos de Data e Hora - aparecem após clicar em Continuar */}
            {showDateTimeFields && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 duration-500 ease-out">
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Data do serviço
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-11 w-full justify-start text-left font-normal shadow-md",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
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
                                  fetchAvailableTimeSlots(date);
                                  // Limpar seleção de hora quando data mudar
                                  form.setValue("time", "");
                                }
                              }}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Hora do serviço
                        </FormLabel>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-11 w-full justify-start text-left font-normal shadow-md",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <Clock className="mr-2 h-4 w-4" />
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
                                  {watchedValues.date
                                    ? "Erro ao carregar horários"
                                    : "Selecione uma data primeiro"}
                                </span>
                              </div>
                            ) : (
                              allTimeSlotsWithStatus.map((slot) => {
                                if (slot.available) {
                                  // Horário disponível - pode ser clicado
                                  return (
                                    <DropdownMenuItem
                                      key={slot.time}
                                      onClick={() => field.onChange(slot.time)}
                                      className="cursor-pointer hover:bg-gray-100"
                                    >
                                      {slot.time}
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
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Botão que muda de "Continuar" para "Agendar" */}
            <div className="pt-3">
              <Button
                type="submit"
                className={cn(
                  "relative h-10 w-full overflow-hidden rounded-full font-medium shadow-md transition-all duration-500",
                  isAllFieldsComplete
                    ? "bg-primary hover:bg-primary border-transparent text-white shadow-md"
                    : "border-primary text-primary border-2 bg-white shadow-md hover:bg-purple-50",
                )}
              >
                {/* Animação de preenchimento do background */}
                <div
                  className={cn(
                    "bg-primary absolute inset-0 transition-transform duration-700 ease-out",
                    isAllFieldsComplete ? "translate-x-0" : "-translate-x-full",
                  )}
                />

                {/* Texto do botão */}
                <span
                  className={cn(
                    "relative z-10 transition-colors duration-300",
                    isAllFieldsComplete ? "text-white" : "text-primary",
                  )}
                >
                  {isAllFieldsComplete ? "Agendar" : "Continuar"}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignInForm;
