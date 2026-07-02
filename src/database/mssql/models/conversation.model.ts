import {
	Table,
	Column,
	Model,
	DataType,
	Default,
	PrimaryKey,
	HasMany,
	AllowNull
} from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { Message } from './message.model';

export enum ConversationColumns {
	Id = 'id',
	ParticipantA = 'participantA',
	ParticipantB = 'participantB',
	LastMessageAt = 'lastMessageAt'
}

@Table({
	tableName: Tables.Conversations,
	indexes: [{ unique: true, fields: ['participantA', 'participantB'] }]
})
export class Conversation extends Model<Conversation> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	id!: string;

	@AllowNull(false)
	@Column(DataType.UUID)
	participantA!: string;

	@AllowNull(false)
	@Column(DataType.UUID)
	participantB!: string;

	@Column(DataType.DATE)
	lastMessageAt?: Date | null;

	@HasMany(() => Message)
	messages?: Message[];
}
