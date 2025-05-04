import express from 'express'
import {
  getAllAccounts,
  loginAccount,
} from '../controllers/accountsController.js'
import { authorizeRoles } from '../authorizeRoles.js'

const router = express.Router()

router.get('/', authorizeRoles('administrator'), getAllAccounts)
router.post('/login', loginAccount)

export default router
