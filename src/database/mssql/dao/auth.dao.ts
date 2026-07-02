import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthAbstractSqlDao } from '../abstract/auth.abstract';
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
import { AppConfigService } from '@app/config/appconfig.service';
import { LoginDto, LogoutDto, RefreshTokenDto, RegisterDto } from '@app/modules/auth/dto/auth.dto';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { AtPayload } from '@app/shared/models.shared';
import { RoleType } from '@app/core/enums/app-role.enum';

@Injectable()
export class AuthSqlDao implements AuthAbstractSqlDao {
	constructor(
		@Inject(MsSqlConstants.USERS) private _userModel: typeof User,
		@Inject(MsSqlConstants.OWNER_PROFILES) private _ownerProfileModel: typeof OwnerProfile,
		@Inject(MsSqlConstants.AGENT_PROFILES) private _agentProfileModel: typeof AgentProfile,
		readonly _loggerSvc: AppLogger,
		private readonly _jwtService: JwtService,
		private readonly _appConfigSvc: AppConfigService
	) {}

	//#region register
	async register(registerInfo: RegisterDto): Promise<AppResponse> {
		try {
			if (registerInfo.role === RoleType.ADMIN) {
				return createResponse(HttpStatus.FORBIDDEN, messages.A5);
			}

			const existing = await this._userModel.findOne({
				where: { [UserColumns.Email]: registerInfo.email }
			});
			if (existing) {
				return createResponse(HttpStatus.FORBIDDEN, messages.A4);
			}

			const passwordHash = await argon2.hash(registerInfo.password);

			const user = await this._userModel.create({
				[UserColumns.Email]: registerInfo.email,
				[UserColumns.PasswordHash]: passwordHash,
				[UserColumns.FullName]: registerInfo.fullName,
				[UserColumns.Phone]: registerInfo.phone ?? null,
				[UserColumns.Role]: registerInfo.role
			} as any);

			// Create the role-specific profile. Agents start unapproved.
			if (registerInfo.role === RoleType.OWNER) {
				await this._ownerProfileModel.create({
					[OwnerProfileColumns.UserId]: user.id
				} as any);
			} else if (registerInfo.role === RoleType.AGENT) {
				await this._agentProfileModel.create({
					[AgentProfileColumns.UserId]: user.id,
					[AgentProfileColumns.IsApproved]: false
				} as any);
			}

			const tokens = await this._issueAndPersistTokens(user.id, user.email, user.role);
			return createResponse(HttpStatus.CREATED, messages.A10, tokens);
		} catch (error: any) {
			this._loggerSvc.error(error, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region login
	async login(loginInfo: LoginDto): Promise<AppResponse> {
		try {
			const user = await this._userModel.findOne({
				where: { [UserColumns.Email]: loginInfo.email }
			});
			if (!user || !user.isActive) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.A3);
			}

			const valid = await argon2.verify(user.passwordHash, loginInfo.password);
			if (!valid) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.A3);
			}

			const tokens = await this._issueAndPersistTokens(user.id, user.email, user.role);
			return createResponse(HttpStatus.OK, messages.A1, tokens);
		} catch (error: any) {
			this._loggerSvc.error(error, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region logout
	async logout(logoutInfo: LogoutDto, claims: AtPayload): Promise<AppResponse> {
		try {
			const userId = logoutInfo?.userId ?? claims?.sub;
			if (!userId) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.E3);
			}
			await this._userModel.update(
				{ [UserColumns.HashedRefreshToken]: null } as any,
				{ where: { [UserColumns.Id]: userId } }
			);
			return createResponse(HttpStatus.OK, messages.A2);
		} catch (error: any) {
			this._loggerSvc.error(error, HttpStatus.INTERNAL_SERVER_ERROR, claims?.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region refreshToken
	async refreshToken(refreshInfo: RefreshTokenDto): Promise<AppResponse> {
		try {
			const tokenMeta = this._appConfigSvc.get('tokenMetadata');
			let decoded: any;
			try {
				decoded = this._jwtService.verify(refreshInfo.refreshToken, {
					secret: tokenMeta.refreshSecret
				});
			} catch {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.A8);
			}

			const user = await this._userModel.findByPk(decoded.sub);
			if (!user || !user.hashedRefreshToken) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.A6);
			}

			const matches = await argon2.verify(user.hashedRefreshToken, refreshInfo.refreshToken);
			if (!matches) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.A6);
			}

			const tokens = await this._issueAndPersistTokens(user.id, user.email, user.role);
			return createResponse(HttpStatus.OK, messages.A7, tokens);
		} catch (error: any) {
			this._loggerSvc.error(error, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async findUserById(userId: string): Promise<User | null> {
		return this._userModel.findByPk(userId);
	}

	//#region private helpers
	private async _issueAndPersistTokens(userId: string, email: string, role: RoleType) {
		const tokens = await this._signTokens(userId, email, role);
		const hashedRefreshToken = await argon2.hash(tokens.refreshToken);
		await this._userModel.update(
			{ [UserColumns.HashedRefreshToken]: hashedRefreshToken } as any,
			{ where: { [UserColumns.Id]: userId } }
		);
		return tokens;
	}

	private async _signTokens(userId: string, email: string, role: RoleType) {
		const tokenMeta = this._appConfigSvc.get('tokenMetadata');
		const payload = { sub: userId, email, role };
		const [accessToken, refreshToken] = await Promise.all([
			this._jwtService.signAsync(payload, {
				secret: tokenMeta.accessSecret,
				expiresIn: tokenMeta.accessTtl
			}),
			this._jwtService.signAsync(payload, {
				secret: tokenMeta.refreshSecret,
				expiresIn: tokenMeta.refreshTtl
			})
		]);
		return { accessToken, refreshToken };
	}
	//#endregion
}
