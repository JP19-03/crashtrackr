import { transport } from "../config/nodemailer"

type EmailType = {
    name: string,
    email: string,
    token: string
}

export class AuthEmail {
    static sendConfirmation = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'CashTrackr - Account Confirmation',
            html: `
                <h1>Hi ${user.name}</h1>
                <p>Thank you for creating an account with CashTrackr. Please click the link below to confirm your account.</p>
                <a href="http://localhost:3000/confirm/${user.token}">Confirm Account</a>
                <p>And enter the following token: ${user.token}</p>
            `
        })
        console.log("Message sent: %s", email.messageId)
    }

    static sendPasswordResetToken = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'CashTrackr - Password Reset',
            html: `
                <h1>Hi ${user.name}</h1>
                <p>You have requested to reset your password. Please click the link below to reset your password.</p>
                <a href="http://localhost:3000/reset-password/${user.token}">Reset Password</a>
                <p>And enter the following token: ${user.token}</p>
            `
        })
        console.log("Message sent: %s", email.messageId)
    }
}