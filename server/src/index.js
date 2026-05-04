import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

//Middlewares
app.use(cors())
app.use(express.json())

//Health check
app.get('/', (req, res) => {
    res.json({message: 'Server is running!' })
})

app.listen(PORT, () => {
    console.log(`Server running in port ${PORT}`)
})