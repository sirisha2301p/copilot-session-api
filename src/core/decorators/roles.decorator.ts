import { SetMetadata } from '@nestjs/common/decorators/core/set-metadata.decorator';
import { DecoratorConstant } from '../constants/decorator.constant';
import { RoleType } from '../enums/app-role.enum';

export const HasRoles = (roles: RoleType[]) => SetMetadata(DecoratorConstant.HAS_ROLES, roles);
