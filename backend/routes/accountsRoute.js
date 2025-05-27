import express from 'express'
import {
  getAllAccounts,
  loginAccount,
} from '../controllers/accountsController.js'
import { authorizeRoles } from '../authorizeRoles.js'
import { deleteAccount } from '../controllers/accountsController.js'

const router = express.Router()

// router.get('/', authorizeRoles('administrator'), getAllAccounts)
router.get('/', getAllAccounts)
router.post('/login', loginAccount)
router.delete('/:id', deleteAccount)

export default router
