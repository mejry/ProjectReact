const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllLeaves,
  getLeaveBalance,
  getMyLeaves,
  createLeave,
  updateLeaveStatus,
  deleteLeave
} = require('../controllers/leaveController');

// Leave routes
router.get('/', protect, admin, getAllLeaves);
router.get('/my-leaves', protect, getMyLeaves);
router.get('/balance', protect, getLeaveBalance);
router.post('/', protect, createLeave);
router.put('/:id/status', protect, admin, updateLeaveStatus);
router.delete('/:id', protect, deleteLeave);

module.exports = router;