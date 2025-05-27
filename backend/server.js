import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import contactRoutes from './routes/contactsRoute.js'
import accountRoutes from './routes/accountsRoute.js' // <--- thêm dòng này
import rolesRoutes from './routes/rolesRoute.js'
import permissionsRoutes from './routes/permissionsRoute.js'
import ranksRoutes from './routes/ranksRoute.js'
import positionsRoutes from './routes/positionsRoute.js'
import departmentsRoutes from './routes/departmentsRoute.js'
import locationsRoutes from './routes/locationsRoute.js'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/contacts', contactRoutes)
app.use('/api/accounts', accountRoutes) // <--- đăng ký routes tài khoản
app.use('/api/roles', rolesRoutes)
app.use('/api/permissions', permissionsRoutes)
app.use('/api/ranks', ranksRoutes)
app.use('/api/positions', positionsRoutes)
app.use('/api/departments', departmentsRoutes)
app.use('/api/locations', locationsRoutes)

app.get('/', (req, res) => {
  res.send('Digitome Backend Running!')
})

// Export the app and start function
export const startServer = () => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

// Only start the server if this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer()
}

export default app
