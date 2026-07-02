import { Injectable } from '@nestjs/common';
import { AuthAbstractSqlDao } from './mssql/abstract/auth.abstract';
import { UserAbstractSqlDao } from './mssql/abstract/users.abstract';

@Injectable()
export class DatabaseService {
	constructor(
		public authSqlTxn: AuthAbstractSqlDao,
		public userSqlTxn: UserAbstractSqlDao
	) {}
}
