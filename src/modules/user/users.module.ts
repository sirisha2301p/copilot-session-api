import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserAbstractSvc } from './users.abstract';
import { UserService } from './users.service';

@Module({
	controllers: [UserController],
	providers: [{ provide: UserAbstractSvc, useClass: UserService }]
})
export class UserModule {}
