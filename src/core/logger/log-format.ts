import { format } from 'winston';

export interface LogFormatOptions {
	serviceName: string;
	environment: string;
}

// Only these three folders are provisioned in blob storage; anything more
// granular (debug/verbose/http/silly) still needs a home when LOG_LEVEL
// enables it, so it falls back into "info".
const FOLDER_LEVELS: Record<string, string[]> = {
	error: ['error'],
	warn: ['warn'],
	info: ['info', 'http', 'verbose', 'debug', 'silly']
};

export const folderFilter = (folder: keyof typeof FOLDER_LEVELS) =>
	format((info) => (FOLDER_LEVELS[folder].includes(info.level) ? info : false))();

export const buildLogFormat = ({ serviceName, environment }: LogFormatOptions) =>
	format.combine(
		format.timestamp(),
		format.printf((info) => {
			const entry: Record<string, unknown> = {
				timestamp: info.timestamp,
				level: String(info.level).toUpperCase(),
				message: info.message,
				'service.name': serviceName,
				environment
			};

			if (info['trace.id']) entry['trace.id'] = info['trace.id'];
			if (info['http.status_code'] !== undefined) entry['http.status_code'] = info['http.status_code'];
			if (info.route) entry.route = info.route;
			if (info.fatal) entry.fatal = true;
			if (info.exception) entry.exception = info.exception;

			return JSON.stringify(entry);
		})
	);
