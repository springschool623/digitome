import express from 'express'
import {
  getAllPositions,
  getPosition,
  createPosition,
  updatePosition,
  deletePosition,
} from '../controllers/positionsController.js'

const router = express.Router()

// Get all positions
router.get('/', getAllPositions)

// Get a specific position
router.get('/:id', getPosition)

// Create a new position
router.post('/', createPosition)

// Update a position
router.put('/:id', updatePosition)

// Delete a position
router.delete('/:id', deletePosition)

export default router
