import jwt from 'jsonwebtoken';

export const createAccessToken = (
	payload: string | Record<string, unknown> | Uint8Array,
	options: jwt.SignOptions = {},
) =>
	jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: '5m',
		...options,
	});
