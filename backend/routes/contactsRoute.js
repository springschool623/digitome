import express from 'express'
import {
  getAllContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contactsController.js'

const router = express.Router()

router.get('/', getAllContacts)
router.get('/:id', getContact)
router.post('/', createContact)
router.put('/:id', updateContact)
router.delete('/:id', deleteContact)

export default router
