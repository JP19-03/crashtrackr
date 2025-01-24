import express from 'express'
import colors from 'colors'
import morgan from 'morgan'
import { db } from './config/db'

async function connectDB() {
    try {
        await db.authenticate()
        db.sync()
        console.log(colors.blue.bold('Successfully connected to the database'))
    } catch (error) {
        //console.error(error)
        console.log(colors.red.bold('Failed to connect to the database'))
    }
}
connectDB()

const app = express()

app.use(morgan('dev'))

app.use(express.json())



export default app