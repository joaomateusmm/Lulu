"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, MoreHorizontal, Trash, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
  user: {
    name: string;
    phone: string;
  };
}

// Função para formatar data
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
};

// Função para mapear tipos de serviço
const getServiceName = (serviceType: string) => {
  switch (serviceType) {
    case "manicure":
      return "Manicure";
    case "pedicure":
      return "Pedicure";
    case "cilios":
      return "Cílios";
    case "sobrancelhas":
      return "Sobrancelhas";
    case "micropigmentacao":
      return "Micropigmentação";
    case "piercing":
      return "Piercing";
    default:
      return "Desconhecido";
  }
};

// Função para obter valor do serviço
const getServicePrice = (serviceType: string) => {
  switch (serviceType) {
    case "manicure":
      return "R$ 40,00";
    case "pedicure":
      return "R$ 50,00";
    case "cilios":
      return "R$ 80,00";
    case "sobrancelhas":
      return "R$ 35,00";
    case "micropigmentacao":
      return "R$ 150,00";
    case "piercing":
      return "R$ 60,00";
    default:
      return "R$ 0,00";
  }
};

// Função para formatar telefone
const formatPhone = (phone: string) => {
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, "");

  // Formato: (85) 9 2345-5678
  if (cleanPhone.length === 11) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 3)} ${cleanPhone.slice(3, 7)}-${cleanPhone.slice(7)}`;
  }

  // Caso o telefone tenha 10 dígitos (sem o 9)
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  }

  // Retorna o telefone original se não conseguir formatar
  return phone;
};

// Função para obter badge de status
const getStatusBadge = (status: string) => {
  switch (status) {
    case "scheduled":
      return (
        <Badge className="bg-primary hover:primary/80 text-white">
          Agendado
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-green-600 text-white hover:bg-green-700">
          Concluído
        </Badge>
      );
    case "cancelled":
      return <Badge variant={"outline"}>Cancelado</Badge>;
    default:
      return (
        <Badge className="bg-gray-600 text-white hover:bg-gray-700">
          Desconhecido
        </Badge>
      );
  }
};

const AdminPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null,
  );
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Função para buscar todos os agendamentos
  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/appointments");
      const result = await response.json();

      if (response.ok && result.success) {
        setAppointments(result.data);
      } else {
        toast.error("Erro ao carregar agendamentos.");
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      toast.error("Erro ao carregar agendamentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAppointments();
  }, []);

  // Função para atualizar status do agendamento
  const handleUpdateStatus = async (
    appointmentId: string,
    newStatus: string,
  ) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Status atualizado com sucesso!");
        fetchAllAppointments();
      } else {
        toast.error(result.message || "Erro ao atualizar status.");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status.");
    }
  };

  // Função para abrir o dialog de exclusão individual
  const openDeleteDialog = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setDeleteDialogOpen(true);
  };

  // Função para excluir agendamento
  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentToDelete}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Agendamento excluído com sucesso!");
        fetchAllAppointments();
      } else {
        toast.error(result.message || "Erro ao excluir agendamento.");
      }
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error("Erro ao excluir agendamento.");
    } finally {
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  // Definição das colunas
  const columns: ColumnDef<Appointment>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "user.name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.user.name}</div>
      ),
    },
    {
      accessorKey: "appointmentDate",
      header: "Data/Hora",
      cell: ({ row }) => (
        <div>
          {formatDate(row.getValue("appointmentDate"))} às{" "}
          {row.original.appointmentTime}
        </div>
      ),
    },
    {
      accessorKey: "user.phone",
      header: "Telefone",
      cell: ({ row }) => <div>{formatPhone(row.original.user.phone)}</div>,
    },
    {
      accessorKey: "serviceType",
      header: "Serviço",
      cell: ({ row }) => (
        <div>{getServiceName(row.getValue("serviceType"))}</div>
      ),
    },
    {
      id: "price",
      header: "Valor",
      cell: ({ row }) => (
        <div className="font-semibold">
          {getServicePrice(row.original.serviceType)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Ações</div>,
      cell: ({ row }) => {
        const appointment = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {appointment.status === "scheduled" && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        handleUpdateStatus(appointment.id, "completed")
                      }
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Concluir
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleUpdateStatus(appointment.id, "cancelled")
                      }
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => openDeleteDialog(appointment.id)}
                  className="text-gray-800"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Configuração da tabela
  const table = useReactTable({
    data: appointments,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater({ pageIndex, pageSize });
        setPageIndex(newPagination.pageIndex);
        setPageSize(newPagination.pageSize);
      }
    },
  });

  // Função para alterar o tamanho da página
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0); // Reset para primeira página ao mudar tamanho
    table.setPageSize(size);
  };

  // Função para filtrar por status
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPageIndex(0); // Reset para primeira página ao filtrar
    if (status === "all") {
      table.getColumn("status")?.setFilterValue(undefined);
    } else {
      table.getColumn("status")?.setFilterValue(status);
    }
  };

  // Função para obter o texto do filtro de status
  const getStatusFilterText = () => {
    switch (statusFilter) {
      case "scheduled":
        return "Agendado";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      default:
        return "Todos";
    }
  };

  // Função para atualizar status em massa
  const handleBulkUpdateStatus = async (newStatus: string) => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id);

    if (selectedIds.length === 0) {
      toast.error("Nenhum agendamento selecionado.");
      return;
    }

    try {
      // Atualizar cada agendamento
      const updatePromises = selectedIds.map((id) =>
        fetch(`/api/appointments/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }),
      );

      const results = await Promise.all(updatePromises);
      const allSuccessful = results.every((res) => res.ok);

      if (allSuccessful) {
        toast.success(
          `${selectedIds.length} agendamento(s) atualizado(s) com sucesso!`,
        );
        setRowSelection({}); // Limpar seleção
        fetchAllAppointments();
      } else {
        toast.error("Alguns agendamentos não puderam ser atualizados.");
        fetchAllAppointments();
      }
    } catch (error) {
      console.error("Erro ao atualizar agendamentos em massa:", error);
      toast.error("Erro ao atualizar agendamentos.");
    }
  };

  // Função para abrir o dialog de exclusão em massa
  const openBulkDeleteDialog = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id);

    if (selectedIds.length === 0) {
      toast.error("Nenhum agendamento selecionado.");
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  // Função para excluir em massa
  const handleBulkDelete = async () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id);

    try {
      // Excluir cada agendamento
      const deletePromises = selectedIds.map((id) =>
        fetch(`/api/appointments/${id}`, {
          method: "DELETE",
        }),
      );

      const results = await Promise.all(deletePromises);
      const allSuccessful = results.every((res) => res.ok);

      if (allSuccessful) {
        toast.success(
          `${selectedIds.length} agendamento(s) excluído(s) com sucesso!`,
        );
        setRowSelection({}); // Limpar seleção
        fetchAllAppointments();
      } else {
        toast.error("Alguns agendamentos não puderam ser excluídos.");
        fetchAllAppointments();
      }
    } catch (error) {
      console.error("Erro ao excluir agendamentos em massa:", error);
      toast.error("Erro ao excluir agendamentos.");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Conteúdo Principal */}
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 bg-white">
            {/* SidebarTrigger no canto superior esquerdo */}
            <div className="top left absolute">
              <SidebarTrigger />
            </div>

            {/* Conteúdo do header */}
            <div className="px-6 pt-16 pb-4">
              <div className="flex flex-col gap-2">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="cursor-pointer hover:text-gray-900">
                    Lulu Nail
                  </span>
                  <span>›</span>
                  <span className="cursor-pointer hover:text-gray-900">
                    Páginas e Ferramentas
                  </span>
                  <span>›</span>
                  <span className="font-medium text-gray-900">
                    Agendamentos
                  </span>
                </div>
                {/* Título */}
                <h1 className="mb-3 text-2xl font-bold text-gray-900">
                  Agendamentos
                </h1>
              </div>
              {/* Separator com largura limitada */}
              <div className="mt-4">
                <div className="mx-auto h-px bg-gray-200" />
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-white shadow-sm">
                <div className="text-center">
                  <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                  <p className="text-gray-600">Carregando agendamentos...</p>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {/* Barra de filtros */}
                <div className="mb-4 flex items-center justify-between">
                  <Input
                    placeholder="Filtrar por nome..."
                    value={
                      (table
                        .getColumn("user.name")
                        ?.getFilterValue() as string) ?? ""
                    }
                    onChange={(event) =>
                      table
                        .getColumn("user.name")
                        ?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">{getStatusFilterText()}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleStatusFilter("all")}
                      >
                        Todos
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusFilter("scheduled")}
                      >
                        Agendado
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusFilter("completed")}
                      >
                        Concluído
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusFilter("cancelled")}
                      >
                        Cancelado
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tabela */}
                <div className="rounded-lg border bg-white shadow-sm">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => {
                            return (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            <div className="mb-4 flex justify-center">
                              <Image
                                src="/assets/illustration.svg"
                                alt="Lulu Nail Logo"
                                width={300}
                                height={300}
                                className="my-3 rounded-lg opacity-80"
                              />
                            </div>
                            <p className="mb-4 text-gray-600">
                              Nenhum agendamento encontrado.
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Ações em massa */}
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-700">
                      {table.getFilteredSelectedRowModel().rows.length}{" "}
                      agendamento(s) selecionado(s)
                    </p>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkUpdateStatus("completed")}
                        className="bg-green-50 hover:bg-green-100"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Concluir Selecionados
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkUpdateStatus("cancelled")}
                        className="bg-gray-50 hover:bg-gray-100"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar Selecionados
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openBulkDeleteDialog}
                        className="bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Excluir Selecionados
                      </Button>
                    </div>
                  </div>
                )}

                {/* Paginação */}
                <div className="flex items-center justify-end space-x-2 py-4">
                  <div className="text-muted-foreground flex-1 text-sm">
                    Mostrando {table.getRowModel().rows.length} de{" "}
                    {table.getFilteredRowModel().rows.length} agendamento(s)
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          {pageSize === appointments.length
                            ? "Todos"
                            : pageSize}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Itens por página</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handlePageSizeChange(10)}
                        >
                          10
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePageSizeChange(20)}
                        >
                          20
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePageSizeChange(30)}
                        >
                          30
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handlePageSizeChange(appointments.length)
                          }
                        >
                          Todos
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>

      {/* Alert Dialog para exclusão individual */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAppointment}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog para exclusão em massa */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{" "}
              {table.getFilteredSelectedRowModel().rows.length} agendamento(s)?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default AdminPage;
