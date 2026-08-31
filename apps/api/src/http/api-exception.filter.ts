import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      if (
        typeof payload === "object" &&
        payload !== null &&
        "error" in payload
      ) {
        res.status(status).json(payload);
        return;
      }
      res.status(status).json({
        error: {
          code: "HTTP_ERROR",
          message:
            typeof payload === "string" ? payload : "Erro na requisição.",
        },
      });
      return;
    }
    this.logger.error(
      exception instanceof Error ? exception.stack ?? exception.message : exception,
    );
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: "INTERNAL",
        message: "Erro interno.",
      },
    });
  }
}
