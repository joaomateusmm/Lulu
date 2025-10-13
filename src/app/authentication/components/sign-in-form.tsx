"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(10, "Número de telefone inválido"),
  date: z.date().optional(),
  time: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SignInFormProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

const SignInForm = ({ onBack, showBackButton = false }: SignInFormProps) => {
  const [showDateTimeFields, setShowDateTimeFields] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      date: undefined,
      time: "",
    },
  });

  async function onContinue(values: FormValues) {
    if (!values.name.trim()) {
      form.setError("name", { message: "Nome inválido" });
      return;
    }

    if (!values.phone.trim() || values.phone.length < 10) {
      form.setError("phone", { message: "Número inválido" });
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

    // Aqui você implementaria a lógica de agendamento
    toast.success("Agendamento realizado com sucesso!");

    // Exemplo: resetar form após sucesso
    form.reset();
    setShowDateTimeFields(false);
  }

  function onSubmit(values: FormValues) {
    if (!showDateTimeFields) {
      return onContinue(values);
    } else {
      return onSchedule(values);
    }
  }
  return (
    <div className="">
      <div className="mb-4 text-center">
        {showBackButton && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center text-sm text-gray-600 transition-colors hover:text-gray-800"
          >
            ← Voltar
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">
          Corte com a BarberFy
        </h1>
      </div>

      <div className="w-[80vw] p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campos iniciais: Nome e Telefone */}
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
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Campos de Data e Hora - aparecem após clicar em Continuar */}
            {showDateTimeFields && (
              <div className="animate-in slide-in-from-bottom-4 space-y-4 duration-300">
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Data do corte
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-11 w-full justify-start text-left font-normal",
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
                              onSelect={field.onChange}
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
                          Hora do corte
                        </FormLabel>
                        <FormControl>
                          <select
                            className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">Selecione um horário</option>
                            <option value="08:00">08:00</option>
                            <option value="08:30">08:30</option>
                            <option value="09:00">09:00</option>
                            <option value="09:30">09:30</option>
                            <option value="10:00">10:00</option>
                            <option value="10:30">10:30</option>
                            <option value="11:00">11:00</option>
                            <option value="11:30">11:30</option>
                            <option value="14:00">14:00</option>
                            <option value="14:30">14:30</option>
                            <option value="15:00">15:00</option>
                            <option value="15:30">15:30</option>
                            <option value="16:00">16:00</option>
                            <option value="16:30">16:30</option>
                            <option value="17:00">17:00</option>
                            <option value="17:30">17:30</option>
                            <option value="18:00">18:00</option>
                          </select>
                        </FormControl>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Botão que muda de "Continuar" para "Agendar" */}
            <div className="pt-4">
              <Button
                type="submit"
                className="h-12 w-full rounded-lg bg-blue-600 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700"
              >
                {showDateTimeFields ? "Agendar" : "Continuar"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignInForm;
