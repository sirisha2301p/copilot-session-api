import {
	Table,
	Column,
	Model,
	DataType,
	Default,
	PrimaryKey,
	ForeignKey,
	BelongsTo,
	AllowNull
} from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { User } from './user.model';

export enum NotificationColumns {
	Id = 'id',
	UserId = 'userId',
	Type = 'type',
	Payload = 'payload',
	ReadAt = 'readAt'
}

@Table({ tableName: Tables.Notifications })
export class Notification extends Model<Notification> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	id!: string;

	@ForeignKey(() => User)
	@AllowNull(false)
	@Column(DataType.UUID)
	userId!: string;

	@BelongsTo(() => User)
	user?: User;

	@AllowNull(false)
	@Column(DataType.STRING)
	type!: string;

	@Column(DataType.TEXT)
	payload?: string | null;

	@Column(DataType.DATE)
	readAt?: Date | null;
}
