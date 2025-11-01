import mongoose from 'mongoose'

export async function connectMongo(uri: string) {
    try {
        await mongoose.connect(uri)

        console.log(`Mongo connected : ${mongoose.connection.host}`)
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)

        console.error('Mongo connection error:', message)

        throw err
    }
}
