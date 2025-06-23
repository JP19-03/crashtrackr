import request from 'supertest';
import server, { connectDB } from '../../server';
import { AuthController } from '../../controllers/AuthController';

describe('Authentication - Create Account', () => {

    it('should display validation errors when form is empty', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({});
        const createAccountMock = jest.spyOn(AuthController, 'createAccount');

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(3);
        expect(createAccountMock).not.toHaveBeenCalled();
    })

    it('should return 400 status code when the email is invalid', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({
                "name": 'John Doe',
                "password": 'password',
                "email": 'invalid-email'
            });
        const createAccountMock = jest.spyOn(AuthController, 'createAccount');

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].msg).toBe('Email is invalid');
        expect(createAccountMock).not.toHaveBeenCalled();
    })

    it('should return 400 status code when the password is less than 8 characters', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({
                "name": 'John Doe',
                "password": 'short',
                "email": 'email@email.com'
            });
        const createAccountMock = jest.spyOn(AuthController, 'createAccount');

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].msg).toBe('Password must be at least 8 characters long');
        expect(createAccountMock).not.toHaveBeenCalled();
    })

    it('should register a new user successfully', async () => {
        const userData = {
            "name": 'John Doe',
            "password": 'password',
            "email": 'email@email.com'
        }

        const response = await request(server)
            .post('/api/auth/create-account')
            .send(userData);

        expect(response.statusCode).toBe(201);
        expect(response.statusCode).not.toBe(400);
        expect(response.body).not.toHaveProperty('errors');
    })

    it('should return 409 conflict when a user is already registered', async () => {
        const userData = {
            "name": 'John Doe',
            "password": 'password',
            "email": 'email@email.com'
        }

        const response = await request(server)
            .post('/api/auth/create-account')
            .send(userData);

        expect(response.statusCode).toBe(409);
        expect(response.statusCode).not.toBe(400);
        expect(response.statusCode).not.toBe(201);
        expect(response.body).not.toHaveProperty('errors');
    })
})