const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getEmployees,
  getEmployeeById,
  getEmployeeStats
} = require('../controllers/employeeController');

// Get all employees
router.get('/',  getEmployees);

// Get employee stats (admin only)
router.get('/stats',  getEmployeeStats);

// Get specific employee
router.get('/:id', getEmployeeById);

module.exports = router;