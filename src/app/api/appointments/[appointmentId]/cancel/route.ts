import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { appointmentTable } from "@/db/schema";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  try {
    const { appointmentId } = await params;

    if (!appointmentId) {
      return NextResponse.json(
        {
          success: false,
          message: "ID do agendamento é obrigatório",
        },
        { status: 400 },
      );
    }

    // Verificar se o agendamento existe
    const [existingAppointment] = await db
      .select()
      .from(appointmentTable)
      .where(eq(appointmentTable.id, appointmentId))
      .limit(1);

    if (!existingAppointment) {
      return NextResponse.json(
        {
          success: false,
          message: "Agendamento não encontrado",
        },
        { status: 404 },
      );
    }

    // Verificar se o agendamento já está cancelado ou concluído
    if (existingAppointment.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          message: "Agendamento já está cancelado",
        },
        { status: 400 },
      );
    }

    if (existingAppointment.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          message: "Não é possível cancelar um agendamento já concluído",
        },
        { status: 400 },
      );
    }

    // Atualizar o status para cancelado
    await db
      .update(appointmentTable)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(appointmentTable.id, appointmentId));

    return NextResponse.json({
      success: true,
      message: "Agendamento cancelado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
      },
      { status: 500 },
    );
  }
}
