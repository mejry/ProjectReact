const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getWeekTimesheet,
  getTimesheetSummary,
  bulkUpdateTimesheet,
  submitTimesheet,  // Add this function
  updateTimesheetStatus,
  deleteTimesheetEntry,
  getAllTimesheets,
  updateTimesheetEntry
} = require('../controllers/timesheetController');

// Regular user routes
router.get('/', protect, getWeekTimesheet);
router.get('/summary', protect, getTimesheetSummary);
router.post('/', protect, submitTimesheet);
router.put('/bulk', protect, bulkUpdateTimesheet);
router.put('/:id', protect, updateTimesheetEntry);
router.delete('/:id', protect, deleteTimesheetEntry);
router.get('/all', protect, admin, getAllTimesheets);

module.exports = router;