import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserAbstractSqlDao } from '../abstract/users.abstract';
import { MsSqlConstants } from '../connection/constants.mssql';
import {
	User,
	UserColumns,
	OwnerProfile,
	OwnerProfileColumns,
	AgentProfile,
	AgentProfileColumns
} from '../models';
import AppLogger from '@app/core/logger/app-logger';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { AtPayload } from '@app/shared/models.shared';

@Injectable()
export class UserSqlDao implements UserAbstractSqlDao {
	constructor(
		@Inject(MsSqlConstants.USERS) private _userModel: typeof User,
		@Inject(MsSqlConstants.OWNER_PROFILES) private _ownerProfileModel: typeof OwnerProfile,
		@Inject(MsSqlConstants.AGENT_PROFILES) private _agentProfileModel: typeof AgentProfile,
		readonly _loggerSvc: AppLogger
	) {}

	//#region getProfile
	async getProfile(userId: string, claims: AtPayload): Promise<AppResponse> {
		try {
			const user = await this._userModel.findByPk(userId, {
				attributes: [
					UserColumns.Id,
					UserColumns.Email,
					UserColumns.FullName,
					UserColumns.Phone,
					UserColumns.Role,
					UserColumns.KycStatus,
					'createdAt'
				],
				include: [
					{ model: this._ownerProfileModel, attributes: [OwnerProfileColumns.BusinessName] },
					{
						model: this._agentProfileModel,
						attributes: [AgentProfileColumns.IsApproved, AgentProfileColumns.IsAvailable]
					}
				]
			});
			if (!user) {
				return createResponse(HttpStatus.NOT_FOUND, messages.U5);
			}
			return createResponse(HttpStatus.OK, messages.U7, user);
		} catch (error: any) {
			this._loggerSvc.error(error, HttpStatus.INTERNAL_SERVER_ERROR, claims?.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
}
