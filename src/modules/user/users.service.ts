import { Injectable } from '@nestjs/common';
import { UserAbstractSvc } from './users.abstract';
import { DatabaseService } from '@app/database/database.service';
import { AppResponse } from '@app/shared/appresponse.shared';
import { AtPayload } from '@app/shared/models.shared';

@Injectable()
export class UserService implements UserAbstractSvc {
	constructor(private readonly _dbSvc: DatabaseService) {}

	async getProfile(userId: string, claims: AtPayload): Promise<AppResponse> {
		return this._dbSvc.userSqlTxn.getProfile(userId, claims);
	}
}
