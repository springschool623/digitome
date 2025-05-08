import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import contactRoutes from './routes/contactsRoute.js'
import accountRoutes from './routes/accountsRoute.js' // <--- thêm dòng này
import rolesRoutes from './routes/rolesRoute.js'
import permissionsRoutes from './routes/permissionsRoute.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/contacts', contactRoutes)
app.use('/api/accounts', accountRoutes) // <--- đăng ký routes tài khoản
app.use('/api/roles', rolesRoutes)
app.use('/api/permissions', permissionsRoutes)


app.get('/', (req, res) => {
  res.send('Digitome Backend Running!')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
