import { AppResponse } from '@app/shared/appresponse.shared';
import { AtPayload } from '@app/shared/models.shared';

export abstract class UserAbstractSvc {
	abstract getProfile(userId: string, claims: AtPayload): Promise<AppResponse>;
}
