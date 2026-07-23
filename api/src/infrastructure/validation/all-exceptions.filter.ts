import {
  Catch,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';

import { LoggerService } from '@infrastructure/logger/logger-service';

/**
 * Глобальный фильтр ошибок:
 * неизвестные исключения отдаём клиенту как `name: message`, а не «Internal server error».
 */
@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  @Inject(LoggerService)
  private readonly loggerService: LoggerService;

  private readonly TAG = 'AllExceptionsFilter';

  /**
   * Пробрасывает HttpException как есть; прочие Error — с текстом в body
   * @param exception - выброшенное исключение
   * @param host - Nest ArgumentsHost
   */
  public catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<{
      status: (code: number) => { json: (body: unknown) => void; };
    }>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const body = typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? exceptionResponse
        : {
          statusCode: status,
          message: exceptionResponse,
        };

      response
        .status(status)
        .json(body);
      return;
    }

    this.loggerService.error(this.TAG, 'unhandled', exception);

    const name = exception instanceof Error ? exception.name : 'Error';
    const message = exception instanceof Error ? exception.message : String(exception);
    const error = `${name}: ${message}`;

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
        error,
      });
  }
}
