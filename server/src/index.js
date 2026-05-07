import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import habitRoutes from './routes/habits.js';
import checkinRoutes from './routes/checkins.js';

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)
app.use('/habits', habitRoutes);
app.use('/checkins', checkinRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})