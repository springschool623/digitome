import express from 'express'
import {
  getAllRanks,
  getRank,
  createRank,
  updateRank,
  deleteRank,
} from '../controllers/ranksController.js'

const router = express.Router()

// Get all ranks
router.get('/', getAllRanks)

// Get a specific rank
router.get('/:id', getRank)

// Create a new rank
router.post('/', createRank)

// Update a rank
router.put('/:id', updateRank)

// Delete a rank
router.delete('/:id', deleteRank)

export default router
