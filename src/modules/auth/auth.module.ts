import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthAbstractSvc } from './auth.abstract';
import { AuthService } from './auth.service';

@Module({
	imports: [],
	controllers: [AuthController],
	providers: [
		{ provide: AuthAbstractSvc, useClass: AuthService },
		JwtService
	]
})
export class AuthorizationModule {}
