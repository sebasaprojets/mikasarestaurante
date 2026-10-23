/** Limites e saneamento de texto livre digitado pelo visitante (vai para a mensagem do WhatsApp). */
export const LIMITS = { name: 80, allergies: 200, notes: 500, message: 1500 } as const;

// Caracteres de controle (exceto \n e \t) e marcas bidirecionais/invisíveis usadas para spoofing.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩﻿]/g;

export function sanitizeText(input: string, max: number, opts: { multiline?: boolean } = {}): string {
  let s = String(input ?? "").normalize("NFC").replace(CONTROL, "");
  s = opts.multiline ? s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  return Array.from(s.trim()).slice(0, max).join("");
}

export function clampMessage(message: string): string {
  return Array.from(message).slice(0, LIMITS.message).join("");
}
