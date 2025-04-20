import express from 'express'
import {
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contactsController.js'

const router = express.Router()

router.get('/', getAllContacts)
router.post('/', createContact)
router.put('/:id', updateContact)
router.delete('/:id', deleteContact)

export default router
