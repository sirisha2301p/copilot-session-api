import AppLogger from '@app/core/logger/app-logger';
import { messages } from '@app/shared/messages.shared';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ErrorHandler implements ExceptionFilter {
	constructor(private readonly _logger: AppLogger) {}

	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp(),
			req = ctx.getRequest<any>(),
			res = ctx.getResponse<Response>();

		let err_response: any, status: number;
		const err_desc: any = typeof exception.getResponse === 'function' ? exception.getResponse() : undefined;

		if (exception instanceof HttpException) {
			status = err_desc && err_desc.code ? err_desc.code : exception.getStatus();
			let errorMessage = err_desc && Array.isArray(err_desc.message) ? err_desc.message[0] : err_desc.message || exception.message;
			if (status === 400 && errorMessage) {
				const parts = errorMessage.split(/\.\d+\./);
				errorMessage = parts[parts.length - 1].trim();
			}
			err_response = {
				code: status,
				message: errorMessage,
				description: err_desc && err_desc.description ? err_desc.description : undefined
			};
		} else {
			status = HttpStatus.INTERNAL_SERVER_ERROR;
			err_response = {
				code: status,
				message: messages.E2
			};
		}

		if (status === 500) {
			this._logger.error(exception, status, req.claims?.sid);
		} else {
			this._logger.log(exception, status, req.claims?.sid);
		}

		res.status(status).json(err_response);
	}
}
