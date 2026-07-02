export const corsOptions = {
	origin: (process.env.CORS_ORIGINS ?? '')
		.split(',')
		.map((o) => o.trim())
		.filter(Boolean).length
		? (process.env.CORS_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean)
		: '*',
	credentials: true
};
