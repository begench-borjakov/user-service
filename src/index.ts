import express from 'express'
import { connectMongo } from './config/mongo.js'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
})

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
