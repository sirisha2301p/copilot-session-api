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
import { MediaType } from '@app/core/enums/domain.enum';

export enum PropertyMediaColumns {
	Id = 'id',
	PropertyId = 'propertyId',
	Type = 'type',
	BlobKey = 'blobKey',
	ThumbnailKey = 'thumbnailKey',
	SortOrder = 'sortOrder'
}

@Table({ tableName: Tables.PropertyMedia })
export class PropertyMedia extends Model<PropertyMedia> {
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

	@AllowNull(false)
	@Column(DataType.ENUM(...Object.values(MediaType)))
	type!: MediaType;

	@AllowNull(false)
	@Column(DataType.STRING)
	blobKey!: string;

	@Column(DataType.STRING)
	thumbnailKey?: string | null;

	@AllowNull(false)
	@Default(0)
	@Column(DataType.INTEGER)
	sortOrder!: number;
}
