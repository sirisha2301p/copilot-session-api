import {
	Table,
	Column,
	Model,
	DataType,
	Default,
	PrimaryKey,
	ForeignKey,
	BelongsTo,
	AllowNull,
	Index
} from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { User } from './user.model';
import { AssignmentStatus } from '@app/core/enums/domain.enum';

export enum AgentAssignmentColumns {
	Id = 'id',
	CustomerId = 'customerId',
	AgentId = 'agentId',
	RequestedCity = 'requestedCity',
	Requirements = 'requirements',
	Status = 'status',
	AssignedAt = 'assignedAt',
	ClosedAt = 'closedAt'
}

@Table({ tableName: Tables.AgentAssignments })
export class AgentAssignment extends Model<AgentAssignment> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	id!: string;

	@ForeignKey(() => User)
	@AllowNull(false)
	@Column(DataType.UUID)
	customerId!: string;

	@BelongsTo(() => User, 'customerId')
	customer?: User;

	@ForeignKey(() => User)
	@Index
	@Column(DataType.UUID)
	agentId?: string | null;

	@BelongsTo(() => User, 'agentId')
	agent?: User;

	@AllowNull(false)
	@Column(DataType.STRING)
	requestedCity!: string;

	@Column(DataType.TEXT)
	requirements?: string | null;

	@Index
	@AllowNull(false)
	@Default(AssignmentStatus.REQUESTED)
	@Column(DataType.ENUM(...Object.values(AssignmentStatus)))
	status!: AssignmentStatus;

	@Column(DataType.DATE)
	assignedAt?: Date | null;

	@Column(DataType.DATE)
	closedAt?: Date | null;
}
