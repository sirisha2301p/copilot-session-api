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
import { Conversation } from './conversation.model';
import { User } from './user.model';

export enum MessageColumns {
	Id = 'id',
	ConversationId = 'conversationId',
	SenderId = 'senderId',
	Body = 'body',
	ReadAt = 'readAt'
}

@Table({ tableName: Tables.Messages })
export class Message extends Model<Message> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	id!: string;

	@ForeignKey(() => Conversation)
	@AllowNull(false)
	@Column(DataType.UUID)
	conversationId!: string;

	@BelongsTo(() => Conversation)
	conversation?: Conversation;

	@ForeignKey(() => User)
	@AllowNull(false)
	@Column(DataType.UUID)
	senderId!: string;

	@BelongsTo(() => User)
	sender?: User;

	@AllowNull(false)
	@Column(DataType.TEXT)
	body!: string;

	@Column(DataType.DATE)
	readAt?: Date | null;
}
