import { AppResponse } from '@app/shared/appresponse.shared';
import { AtPayload } from '@app/shared/models.shared';

export abstract class UserAbstractSqlDao {
	abstract getProfile(userId: string, claims: AtPayload): Promise<AppResponse>;
}
