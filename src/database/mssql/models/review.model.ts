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

export enum ReviewColumns {
	Id = 'id',
	PropertyId = 'propertyId',
	AuthorId = 'authorId',
	Rating = 'rating',
	Comment = 'comment'
}

@Table({ tableName: Tables.Reviews })
export class Review extends Model<Review> {
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
	authorId!: string;

	@BelongsTo(() => User)
	author?: User;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	rating!: number;

	@Column(DataType.TEXT)
	comment?: string | null;
}
