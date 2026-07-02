import { DecoratorConstant } from '@app/core/constants/decorator.constant';
import { SetMetadata } from '@nestjs/common/decorators/core/set-metadata.decorator';

export const Authorize = () => SetMetadata(DecoratorConstant.SECURED, true);
