import { z } from 'zod';

export const VerifyRequestSchema = z.object({
  input: z
    .string()
    .trim()
    .min(1, { message: 'Input cannot be empty' })
    .max(2048, { message: 'Input length exceeds 2048 characters maximum limit' }),
  type: z.enum(['auto', 'email', 'phone', 'url']).optional().default('auto'),
  bypassCache: z.boolean().optional().default(false),
  simulateRateLimit: z.boolean().optional().default(false),
  includeAiAnalysis: z.boolean().optional().default(true),
});

export type ValidatedVerifyRequest = z.infer<typeof VerifyRequestSchema>;

export function validateInputLimits(type: 'email' | 'phone' | 'url', value: string): { valid: boolean; error?: string; errorAr?: string } {
  if (type === 'email') {
    if (value.length > 320) {
      return {
        valid: false,
        error: 'Email address exceeds maximum RFC 5321 length of 320 characters.',
        errorAr: 'طول عنوان البريد يتجاوز الحد الأقصى المسموح به (320 محرفاً).',
      };
    }
  } else if (type === 'phone') {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length > 20 || digitsOnly.length < 5) {
      return {
        valid: false,
        error: 'Phone digit count is invalid (must be between 5 and 20 digits).',
        errorAr: 'عدد خانات رقم الهاتف غير صالح (يجب أن يكون بين 5 و 20 خانة).',
      };
    }
  } else if (type === 'url') {
    if (value.length > 2048) {
      return {
        valid: false,
        error: 'URL exceeds maximum allowable length of 2048 characters.',
        errorAr: 'طول الرابط يتجاوز الحد الأقصى المسموح به (2048 محرفاً).',
      };
    }
  }
  return { valid: true };
}
