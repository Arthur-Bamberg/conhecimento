import { HttpException, HttpStatus } from "@nestjs/common";
import type { z, ZodTypeAny } from "zod";

export function parseBody<S extends ZodTypeAny>(
  schema: S,
  body: unknown,
): z.infer<S> {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new HttpException(
      {
        error: {
          code: "VALIDATION",
          message: "Pedido inválido.",
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  return parsed.data;
}
