import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { appointmentTable } from "@/db/schema";

// GET - Verificar horários disponíveis para uma data específica
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          message: "Data é obrigatória",
        },
        { status: 400 },
      );
    }

    // Validar se a data é válida
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Data inválida",
        },
        { status: 400 },
      );
    }

    // Buscar TODOS os agendamentos e filtrar por data manualmente
    // Isso resolve problemas de timezone
    const allAppointments = await db.select().from(appointmentTable);

    // Filtrar agendamentos pela data (comparando apenas ano-mês-dia, ignorando hora)
    const appointmentsForDate = allAppointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      const aptDateString = aptDate.toISOString().split("T")[0]; // "2025-10-15"
      const requestedDateString = selectedDate.toISOString().split("T")[0]; // "2025-10-15"
      return aptDateString === requestedDateString;
    });

    // Lista de todos os horários possíveis (de hora em hora)
    const allTimeSlots = [
      "8:00",
      "9:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ];

    // Filtrar apenas agendamentos com status "scheduled" e extrair horários ocupados do banco
    const bookedTimes = appointmentsForDate
      .filter((apt) => apt.status === "scheduled")
      .map((appointment) => appointment.appointmentTime);

    // Filtrar horários disponíveis
    const availableTimeSlots = allTimeSlots.filter(
      (time) => !bookedTimes.includes(time),
    );

    // Criar array com todos os horários e seus status
    const allTimeSlotsWithStatus = allTimeSlots.map((time) => ({
      time: time,
      available: !bookedTimes.includes(time),
    }));

    return NextResponse.json({
      success: true,
      data: {
        date: date,
        availableTimeSlots: availableTimeSlots,
        bookedTimeSlots: bookedTimes,
        allTimeSlotsWithStatus: allTimeSlotsWithStatus,
        totalAvailable: availableTimeSlots.length,
        totalBooked: bookedTimes.length,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar horários disponíveis:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
      },
      { status: 500 },
    );
  }
}
