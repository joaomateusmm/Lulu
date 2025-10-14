-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS "appointment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "appointment_date" timestamp NOT NULL,
  "appointment_time" text NOT NULL,
  "status" text NOT NULL DEFAULT 'scheduled',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS "idx_appointment_user_id" ON "appointment" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_appointment_date" ON "appointment" ("appointment_date");
CREATE INDEX IF NOT EXISTS "idx_appointment_status" ON "appointment" ("status");

-- Comentários para documentação
COMMENT ON TABLE "appointment" IS 'Tabela para armazenar agendamentos da barbearia';
COMMENT ON COLUMN "appointment"."user_id" IS 'ID do usuário que fez o agendamento';
COMMENT ON COLUMN "appointment"."name" IS 'Nome completo do cliente';
COMMENT ON COLUMN "appointment"."phone" IS 'Telefone do cliente';
COMMENT ON COLUMN "appointment"."appointment_date" IS 'Data do agendamento';
COMMENT ON COLUMN "appointment"."appointment_time" IS 'Hora do agendamento no formato HH:MM';
COMMENT ON COLUMN "appointment"."status" IS 'Status: scheduled, completed, cancelled';