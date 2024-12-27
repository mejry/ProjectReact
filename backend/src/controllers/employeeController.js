const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// Get all employees
const getEmployees = asyncHandler(async (req, res) => {
  const employees = await User.find({ role: 'employee' })
    .select('-password')
    .sort('name');

  res.json(employees);
});

// Get employee by ID
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await User.findOne({ 
    _id: req.params.id,
    role: 'employee'
  }).select('-password');

  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  res.json(employee);
});

// Get employee stats
const getEmployeeStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    { $match: { role: 'employee' } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { 
          $sum: { 
            $cond: [{ $eq: ['$isActive', true] }, 1, 0] 
          }
        },
        departments: { $addToSet: '$department' }
      }
    }
  ]);

  res.json({
    total: stats[0]?.total || 0,
    active: stats[0]?.active || 0,
    departments: stats[0]?.departments || []
  });
});

module.exports = {
  getEmployees,
  getEmployeeById,
  getEmployeeStats
};