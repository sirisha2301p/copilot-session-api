import { AppConfigService } from '@app/config/appconfig.service';
import { Injectable, LoggerService } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import { createLogger, format, Logger, transports } from 'winston';
import { AzureBlobTransport } from './azure-blob.transport';
import { buildLogFormat, folderFilter } from './log-format';

const enum WinstonLogLevel {
	INFO = 'info',
	ERROR = 'error',
	WARN = 'warn',
	HTTP = 'http',
	DEBUG = 'debug',
	VERBOSE = 'verbose',
	SILLY = 'silly'
}

const MAX_BLOB_BYTES = 50 * 1024 * 1024;
const BLOB_FOLDERS: Array<'error' | 'warn' | 'info'> = ['error', 'warn', 'info'];

@Injectable()
export default class AppLogger implements LoggerService {
	public logger: Logger;

	constructor(_appConfigSvc: AppConfigService) {
		const loggerConfig = _appConfigSvc.get('logger');
		const { environment } = _appConfigSvc.get('app');
		const currentLogLevel = loggerConfig?.logLevel || 'info';
		const logFormat = buildLogFormat({ serviceName: loggerConfig?.serviceName || 'tolet-backend', environment });

		const channels: any[] = [new transports.Console({ format: logFormat })];

		if (loggerConfig?.azureStorageConnectionString) {
			const containerClient = BlobServiceClient.fromConnectionString(loggerConfig.azureStorageConnectionString).getContainerClient(
				loggerConfig.azureLogContainer
			);
			containerClient.createIfNotExists().catch((err) => {
				// eslint-disable-next-line no-console
				console.error('[AppLogger] failed to ensure log container exists', err);
			});

			for (const folder of BLOB_FOLDERS) {
				channels.push(
					new AzureBlobTransport({
						containerClient,
						folder,
						maxBytes: MAX_BLOB_BYTES,
						format: format.combine(folderFilter(folder), logFormat)
					})
				);
			}
		} else {
			// eslint-disable-next-line no-console
			console.warn('[AppLogger] AZURE_STORAGE_CONNECTION_STRING not set — logs will only be written to console');
		}

		this.logger = createLogger({
			level: currentLogLevel,
			format: logFormat,
			transports: channels
		});
	}

	log(msg: any, status = 200, sid = '') {
		this.write(WinstonLogLevel.INFO, msg, status, sid);
	}

	error(msg: any, status = 500, sid = '') {
		this.write(WinstonLogLevel.ERROR, msg, status, sid);
	}

	warn(msg: any, route = '', status = 206, sid = '') {
		this.write(WinstonLogLevel.WARN, msg, status, sid, route);
	}

	debug(msg: any, status = 200, sid = '') {
		this.write(WinstonLogLevel.DEBUG, msg, status, sid);
	}

	verbose(msg: any, status = 200, sid = '') {
		this.write(WinstonLogLevel.VERBOSE, msg, status, sid);
	}

	fatal(msg: any, status = 500, sid = '') {
		this.write(WinstonLogLevel.ERROR, msg, status, sid, undefined, true);
	}

	private write(level: WinstonLogLevel, msg: any, status?: number, sid?: string, route?: string, fatal?: boolean) {
		const isErrorLike = msg instanceof Error;
		const payload: Record<string, any> = { message: isErrorLike ? msg.message : String(msg) };

		if (sid) payload['trace.id'] = sid;
		if (status !== undefined) payload['http.status_code'] = status;
		if (route) payload.route = route;
		if (fatal) payload.fatal = true;
		if (isErrorLike) {
			payload.exception = { type: msg.name || 'Error', message: msg.message, stack_trace: msg.stack };
		}

		this.logger.log(level, payload);
	}
}
