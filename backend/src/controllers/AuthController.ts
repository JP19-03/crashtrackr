import { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';

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
}