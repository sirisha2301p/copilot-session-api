import { CoreModule } from '@app/core/core.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorizationModule } from '../auth/auth.module';
import { UserModule } from '../user/users.module';

@Module({
	imports: [CoreModule, AuthorizationModule, UserModule],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
