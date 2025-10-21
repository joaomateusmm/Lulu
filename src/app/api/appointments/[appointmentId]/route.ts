import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { appointmentTable } from "@/db/schema";

type AppointmentRow = {
  id: string;
  appointmentTime: string;
  status: string;
};

// PATCH - Editar agendamento
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  try {
    const { appointmentId } = await params;
    const body = await request.json();

    // Verificar se o agendamento existe primeiro
    const existingAppointment = await db
      .select()
      .from(appointmentTable)
      .where(eq(appointmentTable.id, appointmentId))
      .limit(1);

    if (existingAppointment.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Agendamento não encontrado",
        },
        { status: 404 },
      );
    }

    // Se apenas status está sendo atualizado (admin action)
    if (
      body.status &&
      !body.serviceType &&
      !body.appointmentDate &&
      !body.appointmentTime
    ) {
      const validStatuses = ["scheduled", "completed", "cancelled"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            message: "Status inválido",
          },
          { status: 400 },
        );
      }

      // Atualizar apenas o status
      const [updatedAppointment] = await db
        .update(appointmentTable)
        .set({
          status: body.status,
        })
        .where(eq(appointmentTable.id, appointmentId))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Status atualizado com sucesso",
        appointment: updatedAppointment,
      });
    }

    // Validação básica dos dados para edição completa
    const { serviceType, appointmentDate, appointmentTime } = body;

    if (!serviceType || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        {
          success: false,
          message: "Todos os campos são obrigatórios",
        },
        { status: 400 },
      );
    }

    // Validar tipos de serviço aceitos
    const validServiceTypes = ["corte-cabelo", "corte-barba", "cabelo-barba"];
    if (!validServiceTypes.includes(serviceType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tipo de serviço inválido",
        },
        { status: 400 },
      );
    }

    // Verificar se o agendamento pode ser editado (não cancelado/concluído)
    const appointment = existingAppointment[0];
    if (appointment.status !== "scheduled") {
      return NextResponse.json(
        {
          success: false,
          message: "Apenas agendamentos confirmados podem ser editados",
        },
        { status: 400 },
      );
    }

    // Validar e converter a data
    const selectedDate = new Date(appointmentDate);

    // Verificar se a data é válida
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Data inválida",
        },
        { status: 400 },
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return NextResponse.json(
        {
          success: false,
          message: "Não é possível agendar para datas passadas",
        },
        { status: 400 },
      );
    }

    // Validar formato do horário
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(appointmentTime)) {
      return NextResponse.json(
        {
          success: false,
          message: "Formato de horário inválido",
        },
        { status: 400 },
      );
    }

    // Verificar se já existe agendamento no mesmo horário e data (exceto o atual)
    const conflictingAppointments = await db
      .select()
      .from(appointmentTable)
      .where(eq(appointmentTable.appointmentDate, selectedDate));

    // Filtrar agendamentos no mesmo horário e status scheduled (exceto o atual)
    const hasConflict = conflictingAppointments.some(
      (apt: AppointmentRow) =>
        apt.id !== appointmentId &&
        apt.appointmentTime === appointmentTime &&
        apt.status === "scheduled",
    );

    if (hasConflict) {
      return NextResponse.json(
        {
          success: false,
          message: "Já existe um agendamento para este horário",
        },
        { status: 400 },
      );
    }

    // Atualizar o agendamento
    const [updatedAppointment] = await db
      .update(appointmentTable)
      .set({
        serviceType,
        appointmentDate: selectedDate, // Usar o objeto Date convertido
        appointmentTime,
      })
      .where(eq(appointmentTable.id, appointmentId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Agendamento atualizado com sucesso",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
      },
      { status: 500 },
    );
  }
}

// DELETE - Excluir agendamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  try {
    const { appointmentId } = await params;

    // Verificar se o agendamento existe
    const existingAppointment = await db
      .select()
      .from(appointmentTable)
      .where(eq(appointmentTable.id, appointmentId))
      .limit(1);

    if (existingAppointment.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Agendamento não encontrado",
        },
        { status: 404 },
      );
    }

    // Excluir o agendamento
    await db
      .delete(appointmentTable)
      .where(eq(appointmentTable.id, appointmentId));

    return NextResponse.json({
      success: true,
      message: "Agendamento excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
      },
      { status: 500 },
    );
  }
}
