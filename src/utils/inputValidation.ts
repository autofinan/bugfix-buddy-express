import { z } from "zod";

/**
 * SEGURANÇA: Validação de entrada para dados de clientes
 * Previne ataques XSS e injection, além de garantir formato correto
 */

// Schema de validação para email
export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Email inválido" })
  .max(255, { message: "Email muito longo (máximo 255 caracteres)" })
  .transform(val => val.toLowerCase());

// Schema de validação para telefone brasileiro
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/, {
    message: "Telefone inválido. Use formato: (11) 99999-9999"
  })
  .max(20, { message: "Telefone muito longo" })
  .optional()
  .nullable();

// Schema de validação para nome
export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Nome muito curto (mínimo 2 caracteres)" })
  .max(100, { message: "Nome muito longo (máximo 100 caracteres)" })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: "Nome contém caracteres inválidos"
  })
  .optional()
  .nullable();

// Schema completo para dados de cliente no orçamento
export const budgetCustomerSchema = z.object({
  customer_name: nameSchema,
  customer_email: emailSchema.optional().nullable(),
  customer_phone: phoneSchema,
});

// Schema de validação para notas/observações
export const notesSchema = z
  .string()
  .trim()
  .max(1000, { message: "Observações muito longas (máximo 1000 caracteres)" })
  .optional()
  .nullable();

/**
 * Sanitiza string removendo caracteres perigosos
 * Previne XSS básico
 */
export const sanitizeString = (input: string | null | undefined): string => {
  if (!input) return "";
  
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < e >
    .replace(/javascript:/gi, "") // Remove javascript:
    .replace(/on\w+=/gi, "") // Remove atributos de eventos HTML
    .slice(0, 1000); // Limita tamanho
};

/**
 * Valida e sanitiza dados de cliente
 */
export const validateCustomerData = (data: {
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
}) => {
  try {
    // Valida usando zod
    const validated = budgetCustomerSchema.parse({
      customer_name: data.customer_name ? sanitizeString(data.customer_name) : null,
      customer_email: data.customer_email ? sanitizeString(data.customer_email) : null,
      customer_phone: data.customer_phone ? sanitizeString(data.customer_phone) : null,
    });
    
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => e.message).join(", ") 
      };
    }
    return { success: false, errors: "Erro na validação dos dados" };
  }
};
