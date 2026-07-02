import {
	Table,
	Column,
	Model,
	DataType,
	Default,
	PrimaryKey,
	ForeignKey,
	BelongsTo,
	Unique,
	AllowNull
} from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { User } from './user.model';

export enum OwnerProfileColumns {
	Id = 'id',
	UserId = 'userId',
	BusinessName = 'businessName'
}

@Table({ tableName: Tables.OwnerProfiles })
export class OwnerProfile extends Model<OwnerProfile> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	id!: string;

	@ForeignKey(() => User)
	@Unique
	@AllowNull(false)
	@Column(DataType.UUID)
	userId!: string;

	@BelongsTo(() => User)
	user?: User;

	@Column(DataType.STRING)
	businessName?: string | null;
}
