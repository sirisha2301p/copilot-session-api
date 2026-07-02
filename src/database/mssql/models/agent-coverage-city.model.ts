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
import { AgentProfile } from './agent-profile.model';

export enum AgentCoverageCityColumns {
	Id = 'id',
	AgentId = 'agentId',
	City = 'city'
}

@Table({
	tableName: Tables.AgentCoverageCities,
	indexes: [{ unique: true, fields: ['agentId', 'city'] }]
})
export class AgentCoverageCity extends Model<AgentCoverageCity> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	id!: string;

	@ForeignKey(() => AgentProfile)
	@AllowNull(false)
	@Column(DataType.UUID)
	agentId!: string;

	@BelongsTo(() => AgentProfile)
	agent?: AgentProfile;

	@Index
	@AllowNull(false)
	@Column(DataType.STRING)
	city!: string;
}
