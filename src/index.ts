import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectMongo } from './config/mongo.js'
import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.routes.js'
import { errorHandler } from './middlewares/errorHandler.js'

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)

app.use((_req, res) => {
    res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Route not found' },
    })
})

app.use(errorHandler)

const PORT = Number(process.env.PORT || 4000)
const MONGODB_URI = process.env.MONGODB_URI ?? ''

if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env')
    process.exit(1)
}

await connectMongo(MONGODB_URI)

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})
