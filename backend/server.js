import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import contactRoutes from './routes/contactsRoute.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/contacts', contactRoutes)

app.get('/', (req, res) => {
  res.send('Digitome Backend Running!')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
