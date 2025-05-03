import express from 'express'
import {
  getAllAccounts,
  loginAccount,
} from '../controllers/accountsController.js'

const router = express.Router()

router.get('/', getAllAccounts)
router.post('/login', loginAccount)

export default router
