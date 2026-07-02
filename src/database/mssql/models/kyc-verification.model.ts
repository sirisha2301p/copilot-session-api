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
import { KycStatus } from '@app/core/enums/domain.enum';

export enum KycVerificationColumns {
	Id = 'id',
	UserId = 'userId',
	Provider = 'provider',
	ProviderRef = 'providerRef',
	Status = 'status',
	DocumentType = 'documentType',
	VerifiedAt = 'verifiedAt'
}

@Table({ tableName: Tables.KycVerifications })
export class KycVerification extends Model<KycVerification> {
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
	provider!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	providerRef!: string;

	@AllowNull(false)
	@Default(KycStatus.PENDING)
	@Column(DataType.ENUM(...Object.values(KycStatus)))
	status!: KycStatus;

	@Column(DataType.STRING)
	documentType?: string | null;

	@Column(DataType.DATE)
	verifiedAt?: Date | null;
}
