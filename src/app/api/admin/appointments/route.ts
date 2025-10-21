import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { appointmentTable, user } from "@/db/schema";

export async function GET() {
  try {
    // Buscar todos os agendamentos com informações do usuário
    const appointments = await db
      .select({
        id: appointmentTable.id,
        appointmentDate: appointmentTable.appointmentDate,
        appointmentTime: appointmentTable.appointmentTime,
        serviceType: appointmentTable.serviceType,
        status: appointmentTable.status,
        createdAt: appointmentTable.createdAt,
        userId: appointmentTable.userId,
      })
      .from(appointmentTable)
      .orderBy(appointmentTable.appointmentDate);

    // Buscar informações dos usuários
    const appointmentsWithUsers = await Promise.all(
      appointments.map(async (appointment) => {
        const userData = await db
          .select({
            name: user.name,
            phone: user.phone,
          })
          .from(user)
          .where(eq(user.id, appointment.userId))
          .limit(1);

        return {
          ...appointment,
          user: userData[0] || { name: "Desconhecido", phone: "N/A" },
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: appointmentsWithUsers,
    });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar agendamentos.",
      },
      { status: 500 },
    );
  }
}
