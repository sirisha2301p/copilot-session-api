import {
	User,
	OwnerProfile,
	AgentProfile,
	AgentCoverageCity,
	KycVerification,
	Property,
	PropertyMedia,
	Inquiry,
	Conversation,
	Message,
	AgentAssignment,
	Review,
	Notification
} from '../models';
import { MsSqlConstants } from './constants.mssql';

export const models = [
	User,
	OwnerProfile,
	AgentProfile,
	AgentCoverageCity,
	KycVerification,
	Property,
	PropertyMedia,
	Inquiry,
	Conversation,
	Message,
	AgentAssignment,
	Review,
	Notification
];

export const msSqlDBModelsProvider = [
	{ provide: MsSqlConstants.USERS, useValue: User },
	{ provide: MsSqlConstants.OWNER_PROFILES, useValue: OwnerProfile },
	{ provide: MsSqlConstants.AGENT_PROFILES, useValue: AgentProfile },
	{ provide: MsSqlConstants.AGENT_COVERAGE_CITIES, useValue: AgentCoverageCity },
	{ provide: MsSqlConstants.KYC_VERIFICATIONS, useValue: KycVerification },
	{ provide: MsSqlConstants.PROPERTIES, useValue: Property },
	{ provide: MsSqlConstants.PROPERTY_MEDIA, useValue: PropertyMedia },
	{ provide: MsSqlConstants.INQUIRIES, useValue: Inquiry },
	{ provide: MsSqlConstants.CONVERSATIONS, useValue: Conversation },
	{ provide: MsSqlConstants.MESSAGES, useValue: Message },
	{ provide: MsSqlConstants.AGENT_ASSIGNMENTS, useValue: AgentAssignment },
	{ provide: MsSqlConstants.REVIEWS, useValue: Review },
	{ provide: MsSqlConstants.NOTIFICATIONS, useValue: Notification }
];
