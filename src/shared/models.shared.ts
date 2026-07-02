interface AtPayload {
	readonly sub: string;
	readonly email: string;
	readonly role: string;
	readonly name?: string;
	readonly sessionId?: string;
	readonly sid?: string;
}

export { AtPayload };
