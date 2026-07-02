import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfigService {
	private readonly envConfig: { [key: string]: any } = {};

	constructor() {
		/*app configurations*/
		this.envConfig.app = {
			port: parseInt(process.env.PORT ?? '3000', 10),
			environment: process.env.NODE_ENV ?? 'development',
			corsOrigins: process.env.CORS_ORIGINS ?? ''
		};

		/*database*/
		this.envConfig.db = {
			mssql: {
				dialect: 'mssql',
				database: process.env.DB_NAME ?? 'tolet',
				username: process.env.DB_USER ?? 'sa',
				password: process.env.DB_PASSWORD ?? '',
				host: process.env.DB_HOST ?? 'localhost',
				port: parseInt(process.env.DB_PORT ?? '1433', 10),
				dialectOptions: {
					options: {
						encrypt: true,
						trustServerCertificate: Boolean(process.env.MSSQL_TRUST_SERVER_CERTIFICATE),
						connectTimeout: 15000,
						requestTimeout: 300000
					}
				},
				pool: {
					max: 5,
					min: 0,
					acquire: 30000,
					idle: 10000
				}
			}
		};

		/*JWT / token settings*/
		this.envConfig.tokenMetadata = {
			accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access',
			accessTtl: process.env.JWT_ACCESS_TTL ?? '900s',
			refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh',
			refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d'
		};

		/*Logger*/
		this.envConfig.logger = {
			logLevel: process.env.LOG_LEVEL ?? 'info',
			serviceName: process.env.SERVICE_NAME ?? 'tolet-backend',
			azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING ?? '',
			azureLogContainer: process.env.AZURE_LOG_CONTAINER ?? 'app-logs'
		};
	}

	get(key: string): any {
		return this.envConfig[key];
	}
}
