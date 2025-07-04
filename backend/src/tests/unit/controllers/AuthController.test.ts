import { createRequest, createResponse } from "node-mocks-http"
import { AuthController } from "../../../controllers/AuthController"
import User from "../../../models/User"
import { checkPassword, hashPassword } from "../../../utils/auth"
import { generateToken } from "../../../utils/token"
import { AuthEmail } from "../../../emails/AuthEmail"
import { generateJWT } from "../../../utils/jwt"

jest.mock("../../../models/User")
jest.mock("../../../utils/auth")
jest.mock("../../../utils/token")
jest.mock("../../../utils/jwt")

describe("AuthController.createAccount", () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return a 409 status and an error message if the email is already registered", async () => {

        (User.findOne as jest.Mock).mockResolvedValue(true)

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: { email: 'test@test.com', password: 'password123' }
        })
        const res = createResponse()

        await AuthController.createAccount(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(409)
        expect(data).toHaveProperty("error", "User with this email already exists")
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
    })

    it('should register new user and return a success message', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: { email: 'test@test.com', password: 'password123', name: 'Test User' }
        })
        const res = createResponse();

        const mockUser = { ...req.body, save: jest.fn() };

        (User.create as jest.Mock).mockResolvedValue(mockUser);
        (hashPassword as jest.Mock).mockReturnValue('hashedPassword');
        (generateToken as jest.Mock).mockReturnValue('generatedToken');
        jest.spyOn(AuthEmail, 'sendConfirmation').mockImplementation(() => Promise.resolve());

        await AuthController.createAccount(req, res)

        expect(User.create).toHaveBeenCalledWith(req.body);
        expect(User.create).toHaveBeenCalledTimes(1);
        expect(mockUser.save).toHaveBeenCalled();
        expect(mockUser.password).toBe('hashedPassword');
        expect(mockUser.token).toBe('generatedToken');
        expect(AuthEmail.sendConfirmation).toHaveBeenCalledWith({
            name: req.body.name,
            email: req.body.email,
            token: 'generatedToken'
        });
        expect(AuthEmail.sendConfirmation).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(201)
    })
})

describe("AuthController.login", () => {
    it('should return 404 if user is not found', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: { email: 'test@test.com', password: 'password123' }
        })
        const res = createResponse()

        await AuthController.login(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(404)
        expect(data).toHaveProperty("error", "User not found")
    })

    it('should return 403 if the account has not been confirmed', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            email: 'test@test.com',
            password: 'hashedPassword',
            confirmed: false
        })

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: { email: 'test@test.com', password: 'password123' }
        })
        const res = createResponse()

        await AuthController.login(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(403)
        expect(data).toHaveProperty("error", "Account not confirmed")
    })

    it('should return 401 if the password is incorrect', async () => {
        const userMock = {
            id: 1,
            email: 'test@test.com',
            password: 'hashedPassword',
            confirmed: true
        };
        (User.findOne as jest.Mock).mockResolvedValue(userMock);

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: { email: 'test@test.com', password: 'password123' }
        })
        const res = createResponse();

        (checkPassword as jest.Mock).mockResolvedValue(false);

        await AuthController.login(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(401)
        expect(data).toHaveProperty("error", "Invalid password")
        expect(checkPassword).toHaveBeenCalledWith(req.body.password, userMock.password)
        expect(checkPassword).toHaveBeenCalledTimes(1)
    })

    it('should return a JWT if authentication is successful', async () => {
        const userMock = {
            id: 1,
            email: 'test@test.com',
            password: 'hashedPassword',
            confirmed: true
        };

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: { email: 'test@test.com', password: 'password123' }
        })
        const res = createResponse();

        const fakeJwt = 'fakeJwtToken';

        (User.findOne as jest.Mock).mockResolvedValue(userMock);
        (checkPassword as jest.Mock).mockResolvedValue(true);
        (generateJWT as jest.Mock).mockReturnValue(fakeJwt);

        await AuthController.login(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data).toEqual(fakeJwt)
        expect(generateJWT).toHaveBeenCalledWith(userMock.id)
        expect(generateJWT).toHaveBeenCalledTimes(1)
    })
})