import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { crearRespuesta } from '../interfaces/respuesta.interface';

@Catch(HttpException)
export class FiltroExcepcion implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const errorMessage =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
        ? (exceptionResponse as { message: string | string[] | null | object })
            .message
        : exceptionResponse;

    const formattedResponse = crearRespuesta({
      success: false,
      error: errorMessage,
    });

    response.status(status).json(formattedResponse);
  }
}
