import {
	Table,
	Column,
	Model,
	DataType,
	Default,
	PrimaryKey,
	ForeignKey,
	BelongsTo,
	HasMany,
	Unique,
	AllowNull
} from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { User } from './user.model';
import { AgentCoverageCity } from './agent-coverage-city.model';

export enum AgentProfileColumns {
	Id = 'id',
	UserId = 'userId',
	IsApproved = 'isApproved',
	IsAvailable = 'isAvailable',
	MaxActiveAssignments = 'maxActiveAssignments'
}

@Table({ tableName: Tables.AgentProfiles })
export class AgentProfile extends Model<AgentProfile> {
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

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	isApproved!: boolean;

	@AllowNull(false)
	@Default(true)
	@Column(DataType.BOOLEAN)
	isAvailable!: boolean;

	@AllowNull(false)
	@Default(5)
	@Column(DataType.INTEGER)
	maxActiveAssignments!: number;

	@HasMany(() => AgentCoverageCity)
	coverageCities?: AgentCoverageCity[];
}
