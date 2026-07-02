import { AppResponse } from '@app/shared/appresponse.shared';
import { AtPayload } from '@app/shared/models.shared';
import { LoginDto, LogoutDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';

export abstract class AuthAbstractSvc {
	abstract register(registerInfo: RegisterDto): Promise<AppResponse>;
	abstract login(loginInfo: LoginDto): Promise<AppResponse>;
	abstract logout(logoutInfo: LogoutDto, claims: AtPayload): Promise<AppResponse>;
	abstract refreshToken(refreshInfo: RefreshTokenDto): Promise<AppResponse>;
}
