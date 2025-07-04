import express from 'express'
import colors from 'colors'
import morgan from 'morgan'
import { db } from './config/db'
import budgetRouter from './routes/budgetRouter'
import authRouter from './routes/authRouter'

export async function connectDB() {
    try {
        await db.authenticate()
        db.sync()
        console.log(colors.blue.bold('Successfully connected to the database'))
    } catch (error) {
        //console.error(error)
        //console.log(colors.red.bold('Failed to connect to the database'))
    }
}
connectDB()

const app = express()

app.use(morgan('dev'))

app.use(express.json())

app.use('/api/budgets', budgetRouter)
app.use('/api/auth', authRouter)

app.get('/', (req, res) => {
    res.send('Welcome to CashTrackr API')
})

export default app