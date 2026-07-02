export enum KycStatus {
	NONE = 'NONE',
	PENDING = 'PENDING',
	VERIFIED = 'VERIFIED',
	REJECTED = 'REJECTED'
}

export enum PropertyType {
	ROOM = 'ROOM',
	HOUSE = 'HOUSE',
	APARTMENT = 'APARTMENT',
	PG = 'PG'
}

export enum AvailabilityStatus {
	AVAILABLE = 'AVAILABLE',
	RESERVED = 'RESERVED',
	UNAVAILABLE = 'UNAVAILABLE'
}

export enum MediaType {
	IMAGE = 'IMAGE',
	VIDEO = 'VIDEO'
}

export enum InquiryStatus {
	OPEN = 'OPEN',
	RESPONDED = 'RESPONDED',
	CLOSED = 'CLOSED'
}

export enum AssignmentStatus {
	REQUESTED = 'REQUESTED',
	ASSIGNED = 'ASSIGNED',
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED'
}
