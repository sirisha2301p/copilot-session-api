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
import { Property } from './property.model';
import { User } from './user.model';
import { InquiryStatus } from '@app/core/enums/domain.enum';

export enum InquiryColumns {
	Id = 'id',
	PropertyId = 'propertyId',
	SeekerId = 'seekerId',
	Message = 'message',
	Status = 'status'
}

@Table({ tableName: Tables.Inquiries })
export class Inquiry extends Model<Inquiry> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	id!: string;

	@ForeignKey(() => Property)
	@AllowNull(false)
	@Column(DataType.UUID)
	propertyId!: string;

	@BelongsTo(() => Property)
	property?: Property;

	@ForeignKey(() => User)
	@AllowNull(false)
	@Column(DataType.UUID)
	seekerId!: string;

	@BelongsTo(() => User)
	seeker?: User;

	@AllowNull(false)
	@Column(DataType.TEXT)
	message!: string;

	@AllowNull(false)
	@Default(InquiryStatus.OPEN)
	@Column(DataType.ENUM(...Object.values(InquiryStatus)))
	status!: InquiryStatus;
}
