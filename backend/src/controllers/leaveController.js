const { User, Leave, TimeSheet, Performance, Notification } = require('../models');const asyncHandler = require('../utils/asyncHandler');

// Get all leaves (admin)
const getAllLeaves = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const status = req.query.status;
  const type = req.query.type;

  let query = {};
  if (status) query.status = status;
  if (type) query.type = type;

  const count = await Leave.countDocuments(query);
  const leaves = await Leave.find(query)
    .populate('user', 'name email department')
    .populate('approvedBy', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort('-createdAt');

  res.json({
    leaves,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

const getLeaveBalance = asyncHandler(async (req, res) => {
  const year = new Date().getFullYear();
  const leaves = await Leave.find({
    user: req.user._id,
    status: 'approved',
    startDate: {
      $gte: new Date(year, 0, 1),
      $lte: new Date(year, 11, 31),
    },
  });

  const balances = {
    vacation: {
      total: 21,
      used: 0,
      remaining: 21,
    },
    sick: {
      total: 10,
      used: 0,
      remaining: 10,
    },
    personal: {
      total: 5,
      used: 0,
      remaining: 5,
    },
  };

  leaves.forEach(leave => {
    const days = Math.ceil(
      (new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)
    );
    if (balances[leave.type]) {
      balances[leave.type].used += days;
      balances[leave.type].remaining = balances[leave.type].total - balances[leave.type].used;
    }
  });

  res.json(balances);
});

// Get my leaves
const getMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find({ user: req.user._id })
    .sort('-createdAt');
  res.json(leaves);
});

// Create leave request
const createLeave = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, type, reason } = req.body;
    console.log('Request Body:', { startDate, endDate, type, reason, userId: req.user._id });
    
    // Validate date formats
    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);
    
    if (isNaN(formattedStartDate.getTime()) || isNaN(formattedEndDate.getTime())) {
      res.status(400);
      throw new Error('Invalid date format');
    }

    const leave = await Leave.create({
      user: req.user._id,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      type,
      reason,
      status: 'pending'
    });

    console.log('Created leave:', leave);
    res.status(201).json(leave);
    
  } catch (error) {
    console.error('Error creating leave:', error);
    // If it's not already a handled error, set status to 500
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

// Update leave status (admin only)
const updateLeaveStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    console.log("Request params:", {
      status: status,
      leaveId: req.params.id,
      userId: req.user._id
    });

    // First verify the leave exists
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        message: 'Leave request not found'
      });
    }

    console.log("Original leave:", leave);

    // Create a new leave object with the updates
    const updateData = {
      status: status,
      approvedBy: req.user._id
    };

    // Use findByIdAndUpdate instead of save()
    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true,  // Return the updated document
        runValidators: true  // Run schema validators
      }
    ).populate('user approvedBy');  // Populate references if needed

    console.log("Updated leave:", updatedLeave);

    if (!updatedLeave) {
      return res.status(400).json({
        message: 'Failed to update leave status'
      });
    }

    // If socket.io is available, emit notification
    if (req.io) {
      req.io.to(updatedLeave.user.toString()).emit('leaveStatusUpdate', {
        leaveId: updatedLeave._id,
        status: status,
        message: `Your leave request has been ${status}`
      });
    }

    return res.json(updatedLeave);

  } catch (error) {
    console.error("Leave update error:", error);
    return res.status(500).json({
      message: 'Error updating leave status',
      error: error.message
    });
  }
});

// Delete leave request
const deleteLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findOne({
    _id: req.params.id,
    user: req.user._id,
    status: 'pending'
  });

  if (!leave) {
    res.status(404);
    throw new Error('Leave request not found or cannot be deleted');
  }

  await leave.remove();
  res.json({ message: 'Leave request removed' });
});

module.exports = {
  getAllLeaves,
  getLeaveBalance,
  getMyLeaves,
  createLeave,
  updateLeaveStatus,
  deleteLeave
};