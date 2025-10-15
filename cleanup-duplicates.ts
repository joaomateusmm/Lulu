import { sql } from "drizzle-orm";

import { db } from "./src/db";
import { appointmentTable } from "./src/db/schema";

async function cleanupDuplicates() {
  console.log("🔍 Procurando agendamentos duplicados...");

  try {
    // Deletar agendamentos duplicados, mantendo apenas o mais antigo de cada grupo
    const result = await db.execute(sql`
      DELETE FROM appointment a
      USING appointment b
      WHERE a.id > b.id
        AND a.appointment_date = b.appointment_date
        AND a.appointment_time = b.appointment_time
    `);

    console.log("✅ Duplicatas removidas!");
    console.log(`📊 Total de registros deletados: ${result.rowCount || 0}`);

    // Mostrar todos os agendamentos restantes
    const remaining = await db.select().from(appointmentTable);
    console.log("\n📋 Agendamentos restantes no banco:");
    console.table(
      remaining.map((apt) => ({
        id: apt.id,
        data: apt.appointmentDate.toLocaleDateString("pt-BR"),
        horario: apt.appointmentTime,
        servico: apt.serviceType,
        status: apt.status,
      })),
    );
  } catch (error) {
    console.error("❌ Erro ao limpar duplicatas:", error);
  }

  process.exit(0);
}

cleanupDuplicates();
