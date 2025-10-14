import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { appointmentTable, user } from "@/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "ID do usuário é obrigatório",
        },
        { status: 400 },
      );
    }

    // Buscar agendamentos do usuário
    const appointments = await db
      .select({
        id: appointmentTable.id,
        appointmentDate: appointmentTable.appointmentDate,
        appointmentTime: appointmentTable.appointmentTime,
        status: appointmentTable.status,
        createdAt: appointmentTable.createdAt,
      })
      .from(appointmentTable)
      .where(eq(appointmentTable.userId, userId))
      .orderBy(appointmentTable.appointmentDate);

    // Buscar informações do usuário
    const [userInfo] = await db
      .select({
        id: user.id,
        name: user.name,
        phone: user.phone,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userInfo) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuário não encontrado",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user: userInfo,
      appointments,
    });
  } catch (error) {
    console.error("Erro ao buscar agendamentos do usuário:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar agendamentos",
      },
      { status: 500 },
    );
  }
}
