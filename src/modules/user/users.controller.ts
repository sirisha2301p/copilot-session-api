import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserAbstractSvc } from './users.abstract';
import { AppResponse } from '@app/shared/appresponse.shared';
import { Authorize } from '@app/core/decorators/authorization.decorator';
import { HasRoles } from '@app/core/decorators/roles.decorator';
import { RoleGroup } from '@app/core/enums/app-role.enum';

@Controller('users')
@ApiTags('User')
export class UserController {
	constructor(private readonly _userSvc: UserAbstractSvc) {}

	@Authorize()
	@Get('me')
	@ApiOperation({ summary: 'Get the authenticated user profile' })
	async me(@Req() req: any): Promise<AppResponse> {
		return this._userSvc.getProfile(req.claims.sub, req.claims);
	}

	@Authorize()
	@HasRoles(RoleGroup.ADMIN_ONLY)
	@Get('admin-ping')
	@ApiOperation({ summary: 'Admin-only ping endpoint' })
	adminPing(): { ok: boolean; scope: string } {
		return { ok: true, scope: 'admin-only' };
	}
}
