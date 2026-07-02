import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AtPayload } from '@app/shared/models.shared';

export const CurrentUser = createParamDecorator(
	(data: keyof AtPayload | undefined, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		const claims: AtPayload = request.claims;
		return data ? claims?.[data] : claims;
	}
);
