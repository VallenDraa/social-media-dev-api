import { type RegisterData } from 'src/models';

export const DEV_URL = `http://${process.env.HOST}:${process.env.PORT}`;

export const FAKE_USER: RegisterData = {
	email: 'fake@gmail.com',
	username: 'fake',
	confirmPassword: 'fake1234567',
	password: 'fake1234567',
};
