import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from './database.service';
import { sequelizeProvider } from './mssql/connection/connection.mssql';
import { msSqlDBModelsProvider } from './mssql/connection/models.connection.mssql';
import { AuthAbstractSqlDao } from './mssql/abstract/auth.abstract';
import { AuthSqlDao } from './mssql/dao/auth.dao';
import { UserAbstractSqlDao } from './mssql/abstract/users.abstract';
import { UserSqlDao } from './mssql/dao/users.dao';

@Module({
	providers: [
		...sequelizeProvider,
		...msSqlDBModelsProvider,
		DatabaseService,
		JwtService,
		{ provide: AuthAbstractSqlDao, useClass: AuthSqlDao },
		{ provide: UserAbstractSqlDao, useClass: UserSqlDao }
	],
	exports: [
		DatabaseService,
		...msSqlDBModelsProvider,
		{ provide: AuthAbstractSqlDao, useClass: AuthSqlDao },
		{ provide: UserAbstractSqlDao, useClass: UserSqlDao }
	]
})
export class DatabaseModule {}
