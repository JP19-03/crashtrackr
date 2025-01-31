import { Request, Response } from 'express';
import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { generateJWT } from '../utils/jwt';

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {

        const { email, password } = req.body;

        // Check if email already exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            const error = new Error('User with this email already exists');
            res.status(409).json({ error: error.message });
            return;
        }


        try {
            const user = new User(req.body);
            user.password = await hashPassword(password);
            user.token = generateToken();
            await user.save();

            await AuthEmail.sendConfirmation({
                name: user.name,
                email: user.email,
                token: user.token
            })

            res.status(201).json('Account created successfully');
        } catch (error) {
            // console.log(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        const { token } = req.body;

        const user = await User.findOne({ where: { token } });

        if (!user) {
            const error = new Error('Invalid token');
            res.status(401).json({ error: error.message });
            return;
        }

        user.confirmed = true;
        user.token = null;
        await user.save();

        res.json("Account confirmed successfully");
    }

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        // Check if email already exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            const error = new Error('User not found');
            res.status(404).json({ error: error.message });
            return;
        }

        if (!user.confirmed) {
            const error = new Error('Account not confirmed');
            res.status(403).json({ error: error.message });
            return;
        }

        const isPasswordCorrect = await checkPassword(password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('Invalid password');
            res.status(401).json({ error: error.message });
            return;
        }

        const token = generateJWT(user.id);

        res.json(token);
    }

    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body;

        // Check if email already exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            const error = new Error('User not found');
            res.status(404).json({ error: error.message });
            return;
        }
        user.token = generateToken();
        await user.save();

        await AuthEmail.sendPasswordResetToken({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.json("Check your email for password reset instructions");

    }

    static validateToken = async (req: Request, res: Response) => {
        const { token } = req.body;

        const tokenExists = await User.findOne({ where: { token } });

        if (!tokenExists) {
            const error = new Error('Invalid token');
            res.status(404).json({ error: error.message });
            return;
        }

        res.json("Token is valid");
    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({ where: { token } });
        if (!user) {
            const error = new Error('Invalid token');
            res.status(404).json({ error: error.message });
            return;
        }

        user.password = await hashPassword(password);
        user.token = null;
        await user.save();

        res.json("Password reset successfully");
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user);
    }
}