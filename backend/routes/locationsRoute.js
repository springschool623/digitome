import express from 'express'
import {
  getAllLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/locationsController.js'

const router = express.Router()

// Get all locations
router.get('/', getAllLocations)

// Get a specific location
router.get('/:id', getLocation)

// Create a new location
router.post('/', createLocation)

// Update a location
router.put('/:id', updateLocation)

// Delete a location
router.delete('/:id', deleteLocation)

export default router
