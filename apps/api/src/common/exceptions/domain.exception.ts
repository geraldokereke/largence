import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorDetails {
  code: string;
  message: string;
  target?: string;
  metadata?: Record<string, any>;
}

export class DomainException extends HttpException {
  constructor(
    public readonly details: ErrorDetails,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(details, status);
  }
}

export class InfrastructureException extends DomainException {
  constructor(details: ErrorDetails) {
    super(details, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class AuthException extends DomainException {
  constructor(details: ErrorDetails, status: HttpStatus = HttpStatus.UNAUTHORIZED) {
    super(details, status);
  }
}
