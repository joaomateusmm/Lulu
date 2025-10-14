import { randomBytes } from "crypto";

/**
 * Gera um ID único de 32 caracteres para identificar usuários
 */
export function generateUserId(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Limpa e formata o número de telefone removendo espaços e caracteres especiais
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}
