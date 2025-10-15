import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { appointmentTable, user } from "@/db/schema";
import { cleanPhoneNumber, generateUserId } from "@/lib/user-utils";

const appointmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(10, "Número de telefone inválido"),
  serviceType: z.string().min(1, "Tipo de serviço é obrigatório"),
  appointmentDate: z.string().transform((str) => new Date(str)),
  appointmentTime: z.string().min(1, "Hora é obrigatória"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = appointmentSchema.parse(body);

    // Limpar o número de telefone
    const cleanPhone = cleanPhoneNumber(validatedData.phone);

    // Verificar se já existe um usuário com esse telefone
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.phone, cleanPhone))
      .limit(1);

    let userId: string;

    if (existingUser) {
      // Usuário já existe, usar o ID existente
      userId = existingUser.id;
    } else {
      // Criar novo usuário com ID de 32 caracteres
      userId = generateUserId();

      await db.insert(user).values({
        id: userId,
        name: validatedData.name,
        phone: cleanPhone,
        email: null, // Email opcional
      });
    }

    // Tentar criar o agendamento
    // A constraint única do banco de dados vai prevenir conflitos automaticamente
    try {
      const [appointment] = await db
        .insert(appointmentTable)
        .values({
          userId: userId,
          serviceType: validatedData.serviceType,
          appointmentDate: validatedData.appointmentDate,
          appointmentTime: validatedData.appointmentTime,
          status: "scheduled",
        })
        .returning();

      return NextResponse.json(
        {
          success: true,
          message: "Agendamento criado com sucesso!",
          appointment,
          userId, // Retornar o userId para usar na sessão
        },
        { status: 201 },
      );
    } catch (dbError: unknown) {
      // Verificar se é erro de constraint única (código 23505 do PostgreSQL)
      const error = dbError as {
        code?: string;
        message?: string;
        detail?: string;
        cause?: { code?: string; detail?: string };
      };

      // Verificar o código tanto no error quanto no cause
      const errorCode = error.code || error.cause?.code;
      const errorDetail = error.detail || error.cause?.detail;

      if (
        errorCode === "23505" ||
        error.message?.includes("unique_date_time") ||
        errorDetail?.includes("unique_date_time")
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Este horário já está ocupado. Por favor, escolha outro horário.",
          },
          { status: 409 }, // Conflict
        );
      }

      // Se for outro erro do banco, relançar para ser capturado pelo catch externo
      throw dbError;
    }
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
      },
      { status: 500 },
    );
  }
}

// GET para listar agendamentos (opcional)
export async function GET() {
  try {
    const appointments = await db
      .select()
      .from(appointmentTable)
      .orderBy(appointmentTable.createdAt);

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar agendamentos",
      },
      { status: 500 },
    );
  }
}
