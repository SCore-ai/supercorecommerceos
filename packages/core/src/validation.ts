import { z } from 'zod';
import { ValidationError } from './errors.js';

export { z };

export function parseWithSchema<T>(schema: z.ZodType<T>, input: unknown, message = 'Invalid input'): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(message, {
      metadata: { issues: result.error.issues },
    });
  }
  return result.data;
}
