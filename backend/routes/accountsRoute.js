import express from 'express'
import {
  getAllAccounts,
  loginAccount,
  getAccount,
  updateAccount,
  deleteAccount,
  updateAccountStatus,
  updateAccountRole,
} from '../controllers/accountsController.js'
import { authorizeRoles } from '../authorizeRoles.js'

const router = express.Router()

// router.get('/', authorizeRoles('administrator'), getAllAccounts)
router.get('/', getAllAccounts)
router.post('/login', loginAccount)
router.delete('/:id', deleteAccount)
router.get('/:id', getAccount)
router.put('/:id', updateAccount)
router.patch('/:id/status', updateAccountStatus)
router.put('/:id/role', updateAccountRole)

export default router
