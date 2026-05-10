import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  traceId: string | string[];
  code?: string;
  message?: string;
  target?: string;
  metadata?: Record<string, any>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const httpStatus =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const traceId =
      request.headers['x-trace-id'] || `tr_${Math.random().toString(36).substring(7)}`;

    let errorResponse: ErrorResponse = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request) as string,
      traceId,
    };

    if (exception instanceof DomainException) {
      errorResponse = { ...errorResponse, ...exception.details };
    } else if (exception instanceof HttpException) {
      const res = exception.getResponse() as Record<string, any>;
      errorResponse = {
        ...errorResponse,
        code: (res.message as string) || 'HTTP_ERROR',
        message: exception.message,
      };
    } else {
      // Internal system error
      errorResponse = {
        ...errorResponse,
        code: 'INTERNAL_SYSTEM_ERROR',
        message: 'An unexpected error occurred in the Largence platform.',
      };

      // Log the actual stack trace only for non-domain errors
      this.logger.error({
        message: exception instanceof Error ? exception.message : 'Unknown error',
        stack: exception instanceof Error ? exception.stack : undefined,
        traceId,
        path: errorResponse.path,
      });
    }

    this.logger.warn({
      type: 'API_ERROR',
      status: httpStatus,
      traceId,
      error: errorResponse,
    });

    httpAdapter.reply(response, errorResponse, httpStatus);
  }
}
