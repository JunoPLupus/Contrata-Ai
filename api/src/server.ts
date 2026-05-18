import 'dotenv/config'
import mongoose from 'mongoose'
import app from './app'

const port : string = process.env.PORT || '3000'
const dbUri : string = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const jwtSecret = process.env.JWT_SECRET

mongoose.connect(dbUri)
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor rodando na porta ${port}`)
        })
    })
    .catch((error) => {
        console.error('Erro ao conectar ao MongoDB:', error)
        process.exit(1)
    })