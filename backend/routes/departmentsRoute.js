import express from 'express'
import {
  getAllDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentsController.js'

const router = express.Router()

// Get all departments
router.get('/', getAllDepartments)

// Get a specific department
router.get('/:id', getDepartment)

// Create a new department
router.post('/', createDepartment)

// Update a department
router.put('/:id', updateDepartment)

// Delete a department
router.delete('/:id', deleteDepartment)

export default router
